namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;

using PyroGeoBlazor.Demo.Models;
using PyroGeoBlazor.Leaflet.Models;
using PyroGeoBlazor.Models;

using System.Globalization;

public partial class VectorTiles : ComponentBase, IAsyncDisposable
{
    private HttpClient HttpClient { get; set; } = new HttpClient();

    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;
    protected LayersControl LayersControl;
    protected MapStateViewModel MapStateViewModel;
    protected List<Control> MapControls = [];

    private readonly Dictionary<string, ProtobufVectorTileLayer> dynamicLayers = new();
    private readonly List<string> loadedLayers = [];
    private bool isInteractive = true;
    private bool selectionEnabled = true;
    private bool multiSelectEnabled = false;
    private readonly Random random = new();

    public VectorTiles()
    {
        var mapCentre = new LatLng(-42, 175);
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

    private async Task MoveTopLayerDown()
    {
        if (PositionMap == null) return;
        if (loadedLayers.Count <= 1) return;

        // Top layer is last in loadedLayers
        var topLayerName = loadedLayers[^1];
        if (!dynamicLayers.TryGetValue(topLayerName, out var topLayer)) return;

        // Request move to index = count-2 (one below top)
        var targetIndex = loadedLayers.Count - 2;
        try
        {
            await topLayer.MoveToIndex(PositionMap, targetIndex);

            // Reorder our local list to reflect the new order
            loadedLayers.RemoveAt(loadedLayers.Count - 1);
            loadedLayers.Insert(targetIndex, topLayerName);
            StateHasChanged();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error moving layer: {ex.Message}");
        }
    }

    /// <summary>
    /// Handles the URL template generated event from the layer selector.
    /// Creates a new vector tile layer and adds it to the map.
    /// </summary>
    private async Task HandleUrlTemplateGenerated(WmtsUrlTemplate urlTemplate)
    {
        if (PositionMap == null || string.IsNullOrEmpty(urlTemplate.Layer))
        {
            return;
        }

        // Check if layer already loaded
        if (dynamicLayers.ContainsKey(urlTemplate.Layer))
        {
            Console.WriteLine($"Layer {urlTemplate.Layer} is already loaded");
            return;
        }

        // Generate random colors for the layer
        var (fillColor, strokeColor) = GenerateRandomColors();

        // Extract layer name without workspace prefix for style key
        var layerStyleKey = urlTemplate.Layer.Contains(':') 
            ? urlTemplate.Layer.Split(':')[1] 
            : urlTemplate.Layer;

        // Decide fill opacity: make the first layer added fully opaque
        var defaultFillOpacity = dynamicLayers.Count == 0 ? 1.0 : 0.4;

        // Create the vector tile layer
        var layer = new ProtobufVectorTileLayer(
            urlTemplate.UrlTemplate,
            new ProtobufVectorTileLayerOptions
            {
                Attribution = "",
                TileSize = 256,
                Opacity = 0.6,
                MinZoom = 1,
                Interactive = isInteractive,
                EnableFeatureSelection = selectionEnabled,
                VectorTileLayerStyles = new Dictionary<string, PathOptions>
                {
                    [layerStyleKey] = new PathOptions
                    {
                        Fill = true,
                        FillColor = fillColor,
                        FillOpacity = defaultFillOpacity,
                        Stroke = true,
                        Color = strokeColor,
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

        // Add to map and layer control
        await layer.AddTo(PositionMap);
        await LayersControl.AddOverlay(layer, urlTemplate.Layer);

        // Track the layer
        dynamicLayers[urlTemplate.Layer] = layer;
        loadedLayers.Add(urlTemplate.Layer);

        // Try to fit bounds to the layer
        try
        {
            var layerIdentifier = urlTemplate.Layer.Contains(':') 
                ? urlTemplate.Layer.Split(':')[1] 
                : urlTemplate.Layer;
                
            var bounds = await GetLayerBoundsFromWMTS(layerIdentifier);
            if (bounds != null && dynamicLayers.Count == 1)
            {
                await PositionMap.FitBounds(bounds);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fitting bounds: {ex.Message}");
        }

        StateHasChanged();
    }

    /// <summary>
    /// Generates random colors for layer styling.
    /// </summary>
    private (string fillColor, string strokeColor) GenerateRandomColors()
    {
        var hue = random.Next(0, 360);
        var saturation = random.Next(40, 70);
        var lightnessFill = random.Next(65, 80);
        var lightnessStroke = random.Next(35, 50);

        var fillColor = $"hsl({hue}, {saturation}%, {lightnessFill}%)";
        var strokeColor = $"hsl({hue}, {saturation}%, {lightnessStroke}%)";

        return (fillColor, strokeColor);
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

            // Fetch the GetCapabilities XML
            var response = await HttpClient.GetStringAsync(getCapabilitiesUrl);
            
            // Parse the XML
            var doc = System.Xml.Linq.XDocument.Parse(response);
            
            // Define namespaces used in WMTS GetCapabilities
            System.Xml.Linq.XNamespace ns = "http://www.opengis.net/wmts/1.0";
            System.Xml.Linq.XNamespace ows = "http://www.opengis.net/ows/1.1";
            
            // Find the layer element with matching identifier
            var layer = doc.Descendants(ns + "Layer")
                .FirstOrDefault(l => l.Element(ows + "Identifier")?.Value == layerName);
            
            if (layer == null)
            {
                Console.WriteLine($"Layer {layerName} not found in WMTS GetCapabilities");
                return null;
            }
            
            // Try to get WGS84BoundingBox first (this is in lat/lon)
            var wgs84BBox = layer.Element(ows + "WGS84BoundingBox");
            if (wgs84BBox != null)
            {
                var lowerCorner = wgs84BBox.Element(ows + "LowerCorner")?.Value.Split(' ');
                var upperCorner = wgs84BBox.Element(ows + "UpperCorner")?.Value.Split(' ');
                
                if (lowerCorner?.Length == 2 && upperCorner?.Length == 2)
                {
                    // WGS84BoundingBox is in lon/lat order
                    var minLon = double.Parse(lowerCorner[0], CultureInfo.InvariantCulture);
                    var minLat = double.Parse(lowerCorner[1], CultureInfo.InvariantCulture);
                    var maxLon = double.Parse(upperCorner[0], CultureInfo.InvariantCulture);
                    var maxLat = double.Parse(upperCorner[1], CultureInfo.InvariantCulture);
                    
                    var southWest = new LatLng(minLat, minLon);
                    var northEast = new LatLng(maxLat, maxLon);
                    
                    return new LatLngBounds(northEast, southWest);
                }
            }
            
            // If no WGS84BoundingBox, try BoundingBox (might need projection conversion)
            var bbox = layer.Element(ows + "BoundingBox");
            if (bbox != null)
            {
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
                        
                        var southWest = new LatLng(minLat, minLon);
                        var northEast = new LatLng(maxLat, maxLon);
                        
                        return new LatLngBounds(northEast, southWest);
                    }
                }
            }
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting layer bounds from WMTS: {ex.Message}");
            return null;
        }
    }

    private async Task ToggleInteractive(ChangeEventArgs e)
    {
        isInteractive = (bool)(e.Value ?? false);
        
        foreach (var layer in dynamicLayers.Values)
        {
            await layer.SetInteractive(isInteractive);
        }
    }

    private async Task ToggleSelection(ChangeEventArgs e)
    {
        selectionEnabled = (bool)(e.Value ?? false);
        
        foreach (var layer in dynamicLayers.Values)
        {
            await layer.SetEnableFeatureSelection(selectionEnabled);
        }
    }

    private async Task ToggleMultiSelect(ChangeEventArgs e)
    {
        multiSelectEnabled = (bool)(e.Value ?? false);
        
        foreach (var layer in dynamicLayers.Values)
        {
            await layer.SetMultipleFeatureSelection(multiSelectEnabled);
        }
    }

    private async Task ClearSelection()
    {
        foreach (var layer in dynamicLayers.Values)
        {
            await layer.ClearSelection();
        }
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

        HttpClient.Dispose();
        GC.SuppressFinalize(this);
    }
}
