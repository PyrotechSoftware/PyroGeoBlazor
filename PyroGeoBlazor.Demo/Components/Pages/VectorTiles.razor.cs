namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;

using PyroGeoBlazor.Demo.Models;
using PyroGeoBlazor.Leaflet.Models;
using PyroGeoBlazor.Models;
using PyroGeoBlazor.Utilities;

using System.Globalization;

public partial class VectorTiles : ComponentBase, IAsyncDisposable
{
    private HttpClient HttpClient { get; set; } = new HttpClient();

    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;
    protected MapStateViewModel MapStateViewModel;
    protected List<Control> MapControls = [];

    private bool isInteractive = true;
    private bool selectionEnabled = true;
    private bool multiSelectEnabled = false;
    private LayerStyle? layerStyleControl;
    private PathOptions currentLayerStyle = new()
    {
        Stroke = true,
        Color = "#3388ff",
        Weight = 3,
        Opacity = 1.0,
        Fill = true,
        FillColor = "#3388ff",
        FillOpacity = 0.2,
        LineCap = "round",
        LineJoin = "round"
    };

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
    }

    private async Task OnMapReady()
    {
        if (PositionMap == null)
            return;
        await OpenStreetMapsTileLayer.AddTo(PositionMap);
    }

    private async Task MoveLayerUp(string layerName)
    {
        if (PositionMap == null)
            return;

        var layer = PositionMap.GetLayer(layerName);
        if (layer == null)
            return;

        try
        {
            await layer.MoveUpManaged(PositionMap);
            StateHasChanged();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error moving layer up: {ex.Message}");
        }
    }

    private async Task MoveLayerDown(string layerName)
    {
        if (PositionMap == null)
            return;

        var layer = PositionMap.GetLayer(layerName);
        if (layer == null)
            return;

        try
        {
            await layer.MoveDownManaged(PositionMap);
            StateHasChanged();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error moving layer down: {ex.Message}");
        }
    }

    private async Task RemoveLayerByName(string layerName)
    {
        if (PositionMap == null)
            return;

        var layer = PositionMap.GetLayer(layerName);
        if (layer == null)
            return;

        try
        {
            await layer.RemoveFromManaged(PositionMap);
            StateHasChanged();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error removing layer: {ex.Message}");
        }
    }

    private async Task ToggleLayerVisibility(string layerName)
    {
        if (PositionMap == null)
            return;

        var layer = PositionMap.GetLayer(layerName);
        if (layer == null)
            return;

        try
        {
            await layer.ToggleVisibility();
            StateHasChanged();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error toggling layer visibility: {ex.Message}");
        }
    }

    /// <summary>
    /// Handles the apply style event from the LayerStyle control.
    /// Updates the current layer style to be used for new layers.
    /// </summary>
    private Task HandleApplyStyle(PathOptions newStyle)
    {
        currentLayerStyle = newStyle;
        StateHasChanged();
        return Task.CompletedTask;
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
        if (PositionMap.GetLayer(urlTemplate.Layer) != null)
        {
            Console.WriteLine($"Layer {urlTemplate.Layer} is already loaded");
            return;
        }

        // Extract layer name without workspace prefix for style key
        var layerStyleKey = urlTemplate.Layer.Contains(':') 
            ? urlTemplate.Layer.Split(':')[1] 
            : urlTemplate.Layer;

        // Create the vector tile layer using the current style from LayerStyle control
        var layer = new ProtobufVectorTileLayer(
            urlTemplate.UrlTemplate,
            new ProtobufVectorTileLayerOptions
            {
                Attribution = "",
                TileSize = 256,
                Opacity = 1.0, // Use full opacity at layer level - stroke/fill opacity controls transparency
                MinZoom = 1,
                Interactive = isInteractive,
                EnableFeatureSelection = selectionEnabled,
                VectorTileLayerStyles = new Dictionary<string, PathOptions>
                {
                    [layerStyleKey] = new PathOptions
                    {
                        Fill = currentLayerStyle.Fill,
                        FillColor = currentLayerStyle.FillColor,
                        FillOpacity = currentLayerStyle.FillOpacity,
                        Stroke = currentLayerStyle.Stroke,
                        Color = currentLayerStyle.Color,
                        Weight = currentLayerStyle.Weight,
                        Opacity = currentLayerStyle.Opacity,
                        LineCap = currentLayerStyle.LineCap,
                        LineJoin = currentLayerStyle.LineJoin,
                        DashArray = currentLayerStyle.DashArray,
                        ClassName = currentLayerStyle.ClassName
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

        // Add to map using managed layer system
        await layer.AddTo(PositionMap, urlTemplate.Layer);

        // Try to fit bounds to the layer
        try
        {
            var layerIdentifier = urlTemplate.Layer.Contains(':') 
                ? urlTemplate.Layer.Split(':')[1] 
                : urlTemplate.Layer;
                
            var bounds = await GetLayerBoundsFromWMTS(layerIdentifier);
            if (bounds != null && PositionMap.ManagedLayers.Count() == 2)
            {
                await PositionMap.FitBounds(bounds);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fitting bounds: {ex.Message}");
        }

        var color = ColorUtilities.GenerateRandomColor();
        currentLayerStyle.FillColor = color;
        currentLayerStyle.Color = color;
        layerStyleControl?.SetStyle(currentLayerStyle);

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
        
        if (PositionMap == null) return;

        foreach (var (_, layer) in PositionMap.ManagedLayers)
        {
            if (layer is ProtobufVectorTileLayer vectorLayer)
            {
                await vectorLayer.SetInteractive(isInteractive);
            }
        }
    }

    private async Task ToggleSelection(ChangeEventArgs e)
    {
        selectionEnabled = (bool)(e.Value ?? false);
        
        if (PositionMap == null) return;

        foreach (var (_, layer) in PositionMap.ManagedLayers)
        {
            if (layer is ProtobufVectorTileLayer vectorLayer)
            {
                await vectorLayer.SetEnableFeatureSelection(selectionEnabled);
            }
        }
    }

    private async Task ToggleMultiSelect(ChangeEventArgs e)
    {
        multiSelectEnabled = (bool)(e.Value ?? false);
        
        if (PositionMap == null) return;

        foreach (var (_, layer) in PositionMap.ManagedLayers)
        {
            if (layer is ProtobufVectorTileLayer vectorLayer)
            {
                await vectorLayer.SetMultipleFeatureSelection(multiSelectEnabled);
            }
        }
    }

    private async Task ClearSelection()
    {
        if (PositionMap == null) return;

        foreach (var (_, layer) in PositionMap.ManagedLayers)
        {
            if (layer is ProtobufVectorTileLayer vectorLayer)
            {
                await vectorLayer.ClearSelection();
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        await OpenStreetMapsTileLayer.DisposeAsync();
        
        if (PositionMap != null)
        {
            // Dispose all managed layers
            foreach (var (_, layer) in PositionMap.ManagedLayers.ToList())
            {
                await layer.DisposeAsync();
            }

            await PositionMap.DisposeAsync();
        }

        HttpClient.Dispose();
        GC.SuppressFinalize(this);
    }
}
