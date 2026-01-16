namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;

using PyroGeoBlazor.Demo.Models;
using PyroGeoBlazor.Leaflet.Models;

using System.Globalization;
using System.Text.Json;

public partial class VectorTiles : ComponentBase, IAsyncDisposable
{
    private HttpClient HttpClient { get; set; } = new HttpClient();

    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;
    protected ProtobufVectorTileLayer? TownshipsLayer;
    protected ProtobufVectorTileLayer? ExtensionsLayer;
    protected ProtobufVectorTileLayer? ParcelsLayer;
    protected LayersControl LayersControl;
    protected MapStateViewModel MapStateViewModel;
    protected List<Control> MapControls = [];

    private bool layersAdded = false;
    private bool isInteractive = true;
    private bool selectionEnabled = true;
    private bool multiSelectEnabled = false;

    public VectorTiles()
    {
        var mapCentre = new LatLng(-42, 175); // Centred on New Zealand
        MapStateViewModel = new MapStateViewModel
        {
            MapCentreLatitude = mapCentre.Lat,
            MapCentreLongitude = mapCentre.Lng,
            Zoom = 4
        };

        PositionMap = new Map("vectorTilesMap", new MapOptions
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

        // Initialize vector tile layers
        TownshipsLayer = new ProtobufVectorTileLayer(
            "https://lims.koleta.co.mz/geoserver/PlannerSpatial/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER={LayerName}&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}",
            new ProtobufVectorTileLayerOptions
            {
                Attribution = "",
                TileSize = 256,
                Opacity = 0.6,
                MinZoom = 1,
                Interactive = true,
                LayerName = "PlannerSpatial:Township",
                VectorTileLayerStyles = new Dictionary<string, PathOptions>
                {
                    ["PlannerSpatial:Township"] = new PathOptions
                    {
                        Fill = true,
                        FillColor = "#88cc88",
                        FillOpacity = 0.4,
                        Stroke = true,
                        Color = "#44aa44",
                        Weight = 2,
                        Opacity = 1.0
                    }
                },
                SelectedFeatureStyle = new PathOptions
                {
                    Fill = true,
                    FillColor = "rgba(50,150,250,0.5)",
                    FillOpacity = 0.5,
                    Stroke = true,
                    Weight = 3,
                    Color = "rgba(50,150,250,0.9)",
                    Opacity = 1.0
                }
            }
        );

        ExtensionsLayer = new ProtobufVectorTileLayer(
            "https://lims.koleta.co.mz/geoserver/PlannerSpatial/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=PlannerSpatial:TownshipExtensionOrFarm&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}",
            new ProtobufVectorTileLayerOptions
            {
                Attribution = "",
                Opacity = 0.6,
                TileSize = 256,
                MinZoom = 1,
                Interactive = true,
                VectorTileLayerStyles = new Dictionary<string, PathOptions>
                {
                    ["PlannerSpatial:TownshipExtensionOrFarm"] = new PathOptions
                    {
                        Fill = true,
                        FillColor = "#ffcc88",
                        FillOpacity = 0.4,
                        Stroke = true,
                        Color = "#ff8844",
                        Weight = 2,
                        Opacity = 1.0
                    }
                },
                SelectedFeatureStyle = new PathOptions
                {
                    Fill = true,
                    FillColor = "rgba(50,150,250,0.5)",
                    FillOpacity = 0.5,
                    Stroke = true,
                    Weight = 3,
                    Color = "rgba(50,150,250,0.9)",
                    Opacity = 1.0
                }
            }
        );

        ParcelsLayer = new ProtobufVectorTileLayer(
            "https://lims.koleta.co.mz/geoserver/PlannerSpatial/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=PlannerSpatial:vwParcelsLayer&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}",
            new ProtobufVectorTileLayerOptions
            {
                Attribution = "",
                Opacity = 0.6,
                TileSize = 256,
                MinZoom = 1,
                Interactive = true,
                EnableFeatureSelection = true,
                VectorTileLayerStyles = new Dictionary<string, PathOptions>
                {
                    ["vwParcelsLayer"] = new PathOptions
                    {
                        Fill = true,
                        FillColor = "#ccccff",
                        FillOpacity = 0.3,
                        Stroke = true,
                        Color = "#8888ff",
                        Weight = 1,
                        Opacity = 0.8
                    }
                },
                SelectedFeatureStyle = new PathOptions
                {
                    Fill = true,
                    FillColor = "yellow",
                    FillOpacity = 0.5,
                    Stroke = true,
                    Weight = 3,
                    Color = "yellow",
                    Opacity = 1.0
                }
            }
        );

        // Subscribe to interactive events
        ParcelsLayer.OnMouseOver += (sender, args) =>
        {
            if (args?.Feature?.Properties != null)
            {
                Console.WriteLine($"Mouse over feature: {JsonSerializer.Serialize(args.Feature.Properties)}");
            }
        };

        ParcelsLayer.OnFeatureClicked += (sender, args) =>
        {
            if (args?.Feature?.Properties != null)
            {
                Console.WriteLine($"Feature clicked: {JsonSerializer.Serialize(args.Feature.Properties)}");
            }
        };

        ParcelsLayer.OnFeatureSelected += (sender, args) =>
        {
            if (args?.Feature?.Properties != null)
            {
                Console.WriteLine($"Feature selected. Total: {ParcelsLayer?.GetSelectedFeaturesCount()}");
            }
        };

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

    public async Task AddVectorTileLayers()
    {
        if (PositionMap == null || TownshipsLayer == null)
        {
            return;
        }

        await TownshipsLayer.AddTo(PositionMap);
        await LayersControl.AddOverlay(TownshipsLayer, "Townships");

        if (ExtensionsLayer != null)
        {
            await ExtensionsLayer.AddTo(PositionMap);
            await LayersControl.AddOverlay(ExtensionsLayer, "Extensions");
        }

        if (ParcelsLayer != null)
        {
            await ParcelsLayer.AddTo(PositionMap);
            await LayersControl.AddOverlay(ParcelsLayer, "Parcels");
        }

        layersAdded = true;

        // Get bounds from WMTS service and fit the map
        // Note: The WMTS layer identifier is just "Township", not "PlannerSpatial:Township"
        try
        {
            var bounds = await GetLayerBoundsFromWMTS("Township");
            if (bounds != null)
            {
                await PositionMap.FitBounds(bounds);
            }
            else
            {
                Console.WriteLine("Could not retrieve bounds from WMTS service");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fitting bounds: {ex.Message}");
        }

        StateHasChanged();
    }

    /// <summary>
    /// Gets the bounding box of a layer from the WMTS GetCapabilities response.
    /// </summary>
    /// <param name="layerName">The name of the layer (e.g., "PlannerSpatial:Township")</param>
    /// <returns>LatLngBounds for the layer, or null if not found</returns>
    private async Task<LatLngBounds?> GetLayerBoundsFromWMTS(string layerName)
    {
        try
        {
            // Build the GetCapabilities URL
            var baseUrl = "https://lims.koleta.co.mz/geoserver/PlannerSpatial/gwc/service/wmts";
            var getCapabilitiesUrl = $"{baseUrl}?REQUEST=GetCapabilities&SERVICE=WMTS";

            Console.WriteLine($"Fetching WMTS GetCapabilities from: {getCapabilitiesUrl}");

            // Fetch the GetCapabilities XML
            var response = await HttpClient.GetStringAsync(getCapabilitiesUrl);
            
            Console.WriteLine($"Received response, length: {response.Length}");
            Console.WriteLine($"First 500 chars: {response.Substring(0, Math.Min(500, response.Length))}");
            
            // Parse the XML
            var doc = System.Xml.Linq.XDocument.Parse(response);
            
            Console.WriteLine($"XML parsed successfully. Root element: {doc.Root?.Name}");
            
            // Define namespaces used in WMTS GetCapabilities
            System.Xml.Linq.XNamespace ns = "http://www.opengis.net/wmts/1.0";
            System.Xml.Linq.XNamespace ows = "http://www.opengis.net/ows/1.1";
            
            // Log all namespaces in the document
            var namespaces = doc.Root?.Attributes()
                .Where(a => a.IsNamespaceDeclaration)
                .Select(a => $"{a.Name.LocalName}={a.Value}");
            if (namespaces?.Any() == true)
            {
                Console.WriteLine($"Document namespaces: {string.Join(", ", namespaces)}");
            }
            
            // Find the layer element with matching identifier
            Console.WriteLine($"Looking for layer: {layerName}");
            var allLayers = doc.Descendants(ns + "Layer").ToList();
            Console.WriteLine($"Found {allLayers.Count} Layer elements");
            
            var layer = allLayers.FirstOrDefault(l => 
            {
                var identifier = l.Element(ows + "Identifier")?.Value;
                Console.WriteLine($"  Found layer with identifier: {identifier}");
                return identifier == layerName;
            });
            
            if (layer == null)
            {
                Console.WriteLine($"Layer {layerName} not found in WMTS GetCapabilities");
                return null;
            }
            
            Console.WriteLine($"Found layer: {layerName}");
            
            // Try to get WGS84BoundingBox first (this is in lat/lon)
            var wgs84BBox = layer.Element(ows + "WGS84BoundingBox");
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

                    Console.WriteLine($"Bounds: SW({minLat}, {minLon}) NE({maxLat}, {maxLon})");
                    
                    var southWest = new LatLng(minLat, minLon);
                    var northEast = new LatLng(maxLat, maxLon);
                    
                    return new LatLngBounds(northEast, southWest);
                }
            }
            
            // If no WGS84BoundingBox, try BoundingBox (might need projection conversion)
            var bbox = layer.Element(ows + "BoundingBox");
            if (bbox != null)
            {
                Console.WriteLine("Found BoundingBox");
                var crs = bbox.Attribute("crs")?.Value;
                var lowerCorner = bbox.Element(ows + "LowerCorner")?.Value.Split(' ');
                var upperCorner = bbox.Element(ows + "UpperCorner")?.Value.Split(' ');
                
                if (lowerCorner?.Length == 2 && upperCorner?.Length == 2)
                {
                    // If it's EPSG:4326, it's already in lat/lon
                    if (crs?.Contains("4326") == true)
                    {
                        var minLon = double.Parse(lowerCorner[0], CultureInfo.InvariantCulture);
                        var minLat = double.Parse(lowerCorner[1], CultureInfo.InvariantCulture);
                        var maxLon = double.Parse(upperCorner[0], CultureInfo.InvariantCulture);
                        var maxLat = double.Parse(upperCorner[1], CultureInfo.InvariantCulture);
                        
                        Console.WriteLine($"Bounds: SW({minLat}, {minLon}) NE({maxLat}, {maxLon})");
                        
                        var southWest = new LatLng(minLat, minLon);
                        var northEast = new LatLng(maxLat, maxLon);
                        
                        return new LatLngBounds(northEast, southWest);
                    }
                    else
                    {
                        Console.WriteLine($"BoundingBox is in projection {crs}, conversion needed");
                    }
                }
            }
            
            Console.WriteLine($"No usable bounding box found for layer {layerName}");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting layer bounds from WMTS: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return null;
        }
    }

    private async Task ToggleInteractive(ChangeEventArgs e)
    {
        isInteractive = (bool)(e.Value ?? false);
        
        if (TownshipsLayer != null)
        {
            await TownshipsLayer.SetInteractive(isInteractive);
        }
        if (ExtensionsLayer != null)
        {
            await ExtensionsLayer.SetInteractive(isInteractive);
        }
        if (ParcelsLayer != null)
        {
            await ParcelsLayer.SetInteractive(isInteractive);
        }
    }

    private async Task ToggleSelection(ChangeEventArgs e)
    {
        selectionEnabled = (bool)(e.Value ?? false);
        
        if (TownshipsLayer != null)
        {
            await TownshipsLayer.SetEnableFeatureSelection(selectionEnabled);
        }
        if (ExtensionsLayer != null)
        {
            await ExtensionsLayer.SetEnableFeatureSelection(selectionEnabled);
        }
        if (ParcelsLayer != null)
        {
            await ParcelsLayer.SetEnableFeatureSelection(selectionEnabled);
        }
    }

    private async Task ToggleMultiSelect(ChangeEventArgs e)
    {
        multiSelectEnabled = (bool)(e.Value ?? false);
        
        if (TownshipsLayer != null)
        {
            await TownshipsLayer.SetMultipleFeatureSelection(multiSelectEnabled);
        }
        if (ExtensionsLayer != null)
        {
            await ExtensionsLayer.SetMultipleFeatureSelection(multiSelectEnabled);
        }
        if (ParcelsLayer != null)
        {
            await ParcelsLayer.SetMultipleFeatureSelection(multiSelectEnabled);
        }
    }

    private async Task ClearSelection()
    {
        if (TownshipsLayer != null)
        {
            await TownshipsLayer.ClearSelection();
        }
        if (ExtensionsLayer != null)
        {
            await ExtensionsLayer.ClearSelection();
        }
        if (ParcelsLayer != null)
        {
            await ParcelsLayer.ClearSelection();
        }
    }

    public async ValueTask DisposeAsync()
    {
        await OpenStreetMapsTileLayer.DisposeAsync();
        if (PositionMap != null)
        {
            await PositionMap.DisposeAsync();
        }

        HttpClient.Dispose();
        GC.SuppressFinalize(this);
    }
}
