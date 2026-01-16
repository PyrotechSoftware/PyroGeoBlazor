namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;

using PyroGeoBlazor.Demo.Models;
using PyroGeoBlazor.Leaflet.Models;

using System.Globalization;
using System.Text.Json;

public partial class WfsLayers : ComponentBase, IAsyncDisposable
{
    private readonly HttpClient _httpClient = new();

    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;
    protected WfsLayer? WfsLayer;
    protected LayersControl LayersControl;
    protected MapStateViewModel MapStateViewModel;
    protected List<Control> MapControls = [];

    private bool wfsLayerAdded = false;
    private int selectedCount = 0;
    private int maxFeatures = 1000;
    private int newMaxFeatures = 1000;

    public WfsLayers()
    {
        var mapCentre = new LatLng(-42, 175); // Centred on New Zealand
        MapStateViewModel = new MapStateViewModel
        {
            MapCentreLatitude = mapCentre.Lat,
            MapCentreLongitude = mapCentre.Lng,
            Zoom = 4
        };

        PositionMap = new Map("wfsMap", new MapOptions
        {
            Center = mapCentre,
            Zoom = MapStateViewModel.Zoom,
            EventOptions = new MapEventOptions
            {
                ContextMenu = true
            }
        }, true);

        OpenStreetMapsTileLayer = new TileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            new TileLayerOptions
            {
                Attribution = @"Map data &copy; <a href=""https://www.openstreetmap.org/"">OpenStreetMap</a> contributors, " +
                    @"<a href=""https://creativecommons.org/licenses/by-sa/2.0/"">CC-BY-SA</a>"
            }
        );

        LayersControl = new LayersControl(
            baseLayers: [],
            overlays: [],
            options: new LayersControlOptions()
            {
                Collapsed = false,
                Position = "topright",
                HideSingleBase = false,
                AutoZIndex = true,
                SortLayers = false
            }
        );

        MapControls.Add(LayersControl);
    }

    public async Task AddWfsLayer()
    {
        if (PositionMap is null)
        {
            Console.WriteLine("Cannot add WFS layer: Map not initialized");
            return;
        }

        try
        {
            // First, try to get bounds from WFS GetCapabilities and fit the map
            var layerBounds = await GetLayerBoundsFromWFS("PlannerSpatial:vwParcelsLayer");
            if (layerBounds != null)
            {
                Console.WriteLine("Fitting map to WFS layer bounds...");
                await PositionMap.FitBounds(layerBounds, new FitBoundsOptions
                {
                    Padding = new Point(50, 50),
                    MaxZoom = 12
                });
                
                // Wait a moment for the map to adjust
                await Task.Delay(500);
            }

            // Get current map bounds
            var bounds = await PositionMap.GetBounds();

            // Check if bounds are valid
            if (bounds?.SouthWest is null || bounds?.NorthEast is null)
            {
                Console.WriteLine("Map bounds not available. Please wait for map to fully initialize and try again.");
                return;
            }

            Console.WriteLine($"Loading WFS features for bounds: SW({bounds.SouthWest.Lat}, {bounds.SouthWest.Lng}) NE({bounds.NorthEast.Lat}, {bounds.NorthEast.Lng})");

            // Normalize coordinates
            var westLng = Math.Min(bounds.SouthWest.Lng, bounds.NorthEast.Lng);
            var eastLng = Math.Max(bounds.SouthWest.Lng, bounds.NorthEast.Lng);
            var southLat = Math.Min(bounds.SouthWest.Lat, bounds.NorthEast.Lat);
            var northLat = Math.Max(bounds.SouthWest.Lat, bounds.NorthEast.Lat);

            // Create WFS layer with options
            WfsLayer = new WfsLayer(
                wfsUrl: "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows",
                options: new WfsLayerOptions
                {
                    RequestParameters = new WfsRequestParameters
                    {
                        TypeName = "PlannerSpatial:vwParcelsLayer",
                        MaxFeatures = maxFeatures,
                        SrsName = "EPSG:4326",
                        BBox = new WfsBoundingBox
                        {
                            MinX = westLng,
                            MinY = southLat,
                            MaxX = eastLng,
                            MaxY = northLat
                        }
                    },
                    // GeoJSON layer options
                    MultipleFeatureSelection = true,
                    SelectedFeatureStyle = new PathOptions
                    {
                        Fill = true,
                        FillColor = "rgba(255,165,0,0.6)",
                        FillOpacity = 0.6,
                        Stroke = true,
                        Weight = 3,
                        Color = "rgba(255,140,0,1)",
                        Opacity = 1.0
                    },
                    // WFS-specific options
                    AutoRefresh = true,
                    IncrementalRefresh = true,
                    RefreshDebounceMs = 1000
                }
            );

            // Subscribe to events
            WfsLayer.OnFeatureClicked += (sender, args) =>
            {
                if (args?.Feature?.Properties is not null)
                {
                    Console.WriteLine($"WFS Feature clicked: {JsonSerializer.Serialize(args.Feature.Properties)}");
                }
            };

            WfsLayer.OnFeatureSelected += (sender, args) =>
            {
                if (args?.Feature?.Properties is not null && WfsLayer is not null)
                {
                    selectedCount = WfsLayer.GetSelectedFeaturesCount();
                    Console.WriteLine($"WFS Feature selected. Total: {selectedCount}");
                    StateHasChanged();
                }
            };

            WfsLayer.OnFeatureUnselected += (sender, args) =>
            {
                if (WfsLayer is not null)
                {
                    selectedCount = WfsLayer.GetSelectedFeaturesCount();
                    Console.WriteLine($"WFS Feature unselected. Remaining: {selectedCount}");
                    StateHasChanged();
                }
            };

            // Add to map
            await WfsLayer.AddTo(PositionMap);

            // Load features from WFS
            Console.WriteLine("Loading WFS features for current map bounds...");
            await WfsLayer.LoadFeaturesAsync();
            Console.WriteLine("WFS features loaded successfully!");

            // Add to layer control
            await LayersControl.AddOverlay(WfsLayer, "WFS Parcels");

            wfsLayerAdded = true;
            newMaxFeatures = maxFeatures; // Initialize newMaxFeatures to current value
            StateHasChanged();
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"Failed to load WFS data: {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error adding WFS layer: {ex.Message}");
        }
    }

    /// <summary>
    /// Gets the bounding box of a layer from the WFS GetCapabilities response.
    /// </summary>
    /// <param name="typeName">The type name of the layer (e.g., "PlannerSpatial:vwParcelsLayer")</param>
    /// <returns>LatLngBounds for the layer, or null if not found</returns>
    private async Task<LatLngBounds?> GetLayerBoundsFromWFS(string typeName)
    {
        try
        {
            // Build the GetCapabilities URL
            var baseUrl = "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows";
            var getCapabilitiesUrl = $"{baseUrl}?service=WFS&version=2.0.0&request=GetCapabilities";

            Console.WriteLine($"Fetching WFS GetCapabilities from: {getCapabilitiesUrl}");

            // Fetch the GetCapabilities XML
            var response = await _httpClient.GetStringAsync(getCapabilitiesUrl);
            
            Console.WriteLine($"Received WFS response, length: {response.Length}");
            
            // Parse the XML
            var doc = System.Xml.Linq.XDocument.Parse(response);
            
            Console.WriteLine($"XML parsed successfully. Root element: {doc.Root?.Name}");
            
            // Define namespaces used in WFS GetCapabilities
            System.Xml.Linq.XNamespace wfs = "http://www.opengis.net/wfs/2.0";
            System.Xml.Linq.XNamespace ows = "http://www.opengis.net/ows/1.1";
            
            // Find the FeatureType element with matching Name
            Console.WriteLine($"Looking for layer: {typeName}");
            var allFeatureTypes = doc.Descendants(wfs + "FeatureType").ToList();
            Console.WriteLine($"Found {allFeatureTypes.Count} FeatureType elements");
            
            var featureType = allFeatureTypes.FirstOrDefault(ft => 
            {
                var name = ft.Element(wfs + "Name")?.Value;
                Console.WriteLine($"  Found feature type with name: {name}");
                return name == typeName;
            });
            
            if (featureType == null)
            {
                Console.WriteLine($"Layer {typeName} not found in WFS GetCapabilities");
                return null;
            }
            
            Console.WriteLine($"Found feature type: {typeName}");
            
            // Try to get WGS84BoundingBox (this is in lat/lon)
            var wgs84BBox = featureType.Element(ows + "WGS84BoundingBox");
            if (wgs84BBox != null)
            {
                Console.WriteLine("Found WGS84BoundingBox");
                var lowerCorner = wgs84BBox.Element(ows + "LowerCorner")?.Value.Split(' ');
                var upperCorner = wgs84BBox.Element(ows + "UpperCorner")?.Value.Split(' ');
                
                if (lowerCorner?.Length == 2 && upperCorner?.Length == 2)
                {
                    // WGS84BoundingBox is in lon/lat order
                    var minLon = double.Parse(lowerCorner[0], CultureInfo.InvariantCulture);
                    var minLat = double.Parse(lowerCorner[1], CultureInfo.InvariantCulture);
                    var maxLon = double.Parse(upperCorner[0], CultureInfo.InvariantCulture);
                    var maxLat = double.Parse(upperCorner[1], CultureInfo.InvariantCulture);
                    
                    Console.WriteLine($"WFS Bounds: SW({minLat}, {minLon}) NE({maxLat}, {maxLon})");
                    
                    var southWest = new LatLng(minLat, minLon);
                    var northEast = new LatLng(maxLat, maxLon);
                    
                    return new LatLngBounds(northEast, southWest);
                }
            }
            
            Console.WriteLine($"No usable bounding box found for layer {typeName}");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting layer bounds from WFS: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return null;
        }
    }

    /// <summary>
    /// Updates the MaxFeatures limit dynamically without recreating the layer.
    /// Subsequent auto-refresh requests will use the new limit.
    /// </summary>
    public async Task UpdateMaxFeatures()
    {
        if (PositionMap is null || WfsLayer is null)
        {
            return;
        }

        if (newMaxFeatures == maxFeatures)
        {
            Console.WriteLine("MaxFeatures value unchanged, no update needed");
            return;
        }

        try
        {
            Console.WriteLine($"Updating MaxFeatures from {maxFeatures} to {newMaxFeatures}");
            
            // Update the stored max features value
            maxFeatures = newMaxFeatures;

            // Update the MaxFeatures on the existing layer (doesn't recreate the layer)
            WfsLayer.UpdateMaxFeatures(maxFeatures);

            // Optionally reload features with the new limit
            // Clear cache and reload to immediately apply the new limit
            WfsLayer.ClearLoadedFeatureCache();
            await WfsLayer.LoadFeaturesAsync(clearExisting: true);

            Console.WriteLine($"MaxFeatures updated to {maxFeatures}. Subsequent requests will use this limit.");
            StateHasChanged();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating MaxFeatures: {ex.Message}");
        }
    }

    public async Task ReloadWfsLayer()
    {
        if (PositionMap is null || WfsLayer is null)
        {
            return;
        }

        try
        {
            Console.WriteLine("WFS: Reloading layer...");

            // Clear the feature cache
            WfsLayer.ClearLoadedFeatureCache();

            // Remove the old layer from the map
            await WfsLayer.RemoveLayer();

            // Get current bounds
            var bounds = await PositionMap.GetBounds();
            if (bounds?.SouthWest is null || bounds?.NorthEast is null)
            {
                Console.WriteLine("WFS: Cannot reload - bounds not available");
                return;
            }

            // Normalize coordinates
            var westLng = Math.Min(bounds.SouthWest.Lng, bounds.NorthEast.Lng);
            var eastLng = Math.Max(bounds.SouthWest.Lng, bounds.NorthEast.Lng);
            var southLat = Math.Min(bounds.SouthWest.Lat, bounds.NorthEast.Lat);
            var northLat = Math.Max(bounds.SouthWest.Lat, bounds.NorthEast.Lat);

            // Create new layer
            WfsLayer = new WfsLayer(
                wfsUrl: "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows",
                options: new WfsLayerOptions
                {
                    RequestParameters = new WfsRequestParameters
                    {
                        TypeName = "PlannerSpatial:vwParcelsLayer",
                        MaxFeatures = maxFeatures,
                        SrsName = "EPSG:4326",
                        BBox = new WfsBoundingBox
                        {
                            MinX = westLng,
                            MinY = southLat,
                            MaxX = eastLng,
                            MaxY = northLat
                        }
                    },
                    MultipleFeatureSelection = true,
                    SelectedFeatureStyle = new PathOptions
                    {
                        Fill = true,
                        FillColor = "rgba(255,165,0,0.6)",
                        FillOpacity = 0.6,
                        Stroke = true,
                        Weight = 3,
                        Color = "rgba(255,140,0,1)",
                        Opacity = 1.0
                    },
                    AutoRefresh = true,
                    IncrementalRefresh = true,
                    RefreshDebounceMs = 1000
                }
            );

            // Re-subscribe to events
            WfsLayer.OnFeatureSelected += (sender, args) =>
            {
                if (WfsLayer is not null)
                {
                    selectedCount = WfsLayer.GetSelectedFeaturesCount();
                    StateHasChanged();
                }
            };

            WfsLayer.OnFeatureUnselected += (sender, args) =>
            {
                if (WfsLayer is not null)
                {
                    selectedCount = WfsLayer.GetSelectedFeaturesCount();
                    StateHasChanged();
                }
            };

            // Add to map and load
            await WfsLayer.AddTo(PositionMap);
            await WfsLayer.LoadFeaturesAsync(clearExisting: true);

            selectedCount = 0;
            Console.WriteLine("WFS: Reload complete!");
            StateHasChanged();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"WFS: Error during reload - {ex.Message}");
        }
    }

    private async Task ClearSelection()
    {
        if (WfsLayer != null)
        {
            await WfsLayer.ClearSelection();
            selectedCount = 0;
            StateHasChanged();
        }
    }

    public async ValueTask DisposeAsync()
    {
        await OpenStreetMapsTileLayer.DisposeAsync();
        if (PositionMap != null)
        {
            await PositionMap.DisposeAsync();
        }

        _httpClient.Dispose();
        GC.SuppressFinalize(this);
    }
}
