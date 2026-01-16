namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;

using PyroGeoBlazor.Demo.Models;
using PyroGeoBlazor.Leaflet.Models;
using PyroGeoBlazor.Models;

using System.Globalization;

public partial class WfsLayers : ComponentBase, IAsyncDisposable
{
    private readonly HttpClient _httpClient = new();

    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;
    protected LayersControl LayersControl;
    protected MapStateViewModel MapStateViewModel;
    protected List<Control> MapControls = [];

    private readonly Dictionary<string, WfsLayer> dynamicLayers = new();
    private readonly List<string> loadedLayers = [];
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

    /// <summary>
    /// Handles the configuration generated event from the WFS layer selector.
    /// Creates a new WFS layer and adds it to the map.
    /// </summary>
    private async Task HandleConfigGenerated(WfsLayerConfig config)
    {
        if (PositionMap == null || string.IsNullOrEmpty(config.TypeName))
        {
            return;
        }

        // Check if layer already loaded
        if (dynamicLayers.ContainsKey(config.TypeName))
        {
            Console.WriteLine($"Layer {config.TypeName} is already loaded");
            return;
        }

        try
        {
            // Try to get bounds from WFS GetCapabilities and fit the map (only for first layer)
            if (dynamicLayers.Count == 0)
            {
                var layerBounds = await GetLayerBoundsFromWFS(config.TypeName, config.ServiceUrl);
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
            }

            // Get current map bounds
            var bounds = await PositionMap.GetBounds();

            // Check if bounds are valid
            if (bounds?.SouthWest == null || bounds?.NorthEast == null)
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

            // Use bounding box from config or calculate from map
            var bbox = config.BoundingBox ?? new PyroGeoBlazor.Models.WfsBoundingBox
            {
                MinX = westLng,
                MinY = southLat,
                MaxX = eastLng,
                MaxY = northLat
            };

            // Create WFS layer with options
            var wfsLayer = new WfsLayer(
                wfsUrl: config.ServiceUrl,
                options: new WfsLayerOptions
                {
                    RequestParameters = new WfsRequestParameters
                    {
                        TypeName = config.TypeName,
                        MaxFeatures = config.MaxFeatures ?? maxFeatures,
                        SrsName = config.SrsName,
                        BBox = bbox
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

            // Subscribe to events
            wfsLayer.OnFeatureSelected += (sender, args) =>
            {
                selectedCount = dynamicLayers.Values.Sum(l => l.GetSelectedFeaturesCount());
                StateHasChanged();
            };

            wfsLayer.OnFeatureUnselected += (sender, args) =>
            {
                selectedCount = dynamicLayers.Values.Sum(l => l.GetSelectedFeaturesCount());
                StateHasChanged();
            };

            // Add to map
            await wfsLayer.AddTo(PositionMap);

            // Load features from WFS
            Console.WriteLine($"Loading WFS features for layer: {config.TypeName}");
            await wfsLayer.LoadFeaturesAsync();
            Console.WriteLine("WFS features loaded successfully!");

            // Add to layer control
            await LayersControl.AddOverlay(wfsLayer, config.TypeName);

            // Track the layer
            dynamicLayers[config.TypeName] = wfsLayer;
            loadedLayers.Add(config.TypeName);

            newMaxFeatures = maxFeatures;
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
    /// <param name="serviceUrl">The WFS service URL</param>
    /// <returns>LatLngBounds for the layer, or null if not found</returns>
    private async Task<LatLngBounds?> GetLayerBoundsFromWFS(string typeName, string serviceUrl)
    {
        try
        {
            // Build the GetCapabilities URL
            var getCapabilitiesUrl = serviceUrl;
            if (!getCapabilitiesUrl.Contains("REQUEST=GetCapabilities", StringComparison.OrdinalIgnoreCase))
            {
                var separator = getCapabilitiesUrl.Contains('?') ? '&' : '?';
                getCapabilitiesUrl = $"{getCapabilitiesUrl}{separator}service=WFS&version=2.0.0&request=GetCapabilities";
            }

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
    /// Updates the MaxFeatures limit dynamically without recreating the layers.
    /// Subsequent auto-refresh requests will use the new limit.
    /// </summary>
    public async Task UpdateMaxFeatures()
    {
        if (PositionMap == null || dynamicLayers.Count == 0)
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

            // Update all loaded layers
            foreach (var layer in dynamicLayers.Values)
            {
                layer.UpdateMaxFeatures(maxFeatures);
                layer.ClearLoadedFeatureCache();
                await layer.LoadFeaturesAsync(clearExisting: true);
            }

            Console.WriteLine($"MaxFeatures updated to {maxFeatures}. Subsequent requests will use this limit.");
            StateHasChanged();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating MaxFeatures: {ex.Message}");
        }
    }

    public async Task ReloadWfsLayers()
    {
        if (PositionMap == null || dynamicLayers.Count == 0)
        {
            return;
        }

        try
        {
            Console.WriteLine("WFS: Reloading all layers...");

            foreach (var layer in dynamicLayers.Values)
            {
                // Clear the feature cache
                layer.ClearLoadedFeatureCache();
                
                // Reload features
                await layer.LoadFeaturesAsync(clearExisting: true);
            }

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
        foreach (var layer in dynamicLayers.Values)
        {
            await layer.ClearSelection();
        }
        selectedCount = 0;
        StateHasChanged();
    }

    public async ValueTask DisposeAsync()
    {
        await OpenStreetMapsTileLayer.DisposeAsync();
        
        foreach (var layer in dynamicLayers.Values)
        {
            await layer.DisposeAsync();
        }
        
        if (PositionMap != null)
        {
            await PositionMap.DisposeAsync();
        }

        _httpClient.Dispose();
        GC.SuppressFinalize(this);
    }
}
