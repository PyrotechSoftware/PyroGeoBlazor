namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Configuration for an MVT (Mapbox Vector Tiles) layer.
/// Displays vector tiles from sources like GeoServer, MapBox, or other MVT providers.
/// </summary>
public class MVTLayerConfig : LayerConfig
{
    /// <inheritdoc />
    [JsonPropertyName("type")]
    public override string Type => "MVTLayer";

    /// <summary>
    /// URL template for MVT data. Use {x}, {y}, {z} as placeholders.
    /// Example GeoServer: "http://localhost:8080/geoserver/gwc/service/tms/1.0.0/workspace:layer@EPSG:900913@pbf/{z}/{x}/{-y}.pbf"
    /// Note: GeoServer TMS uses {-y} for inverted Y coordinate
    /// </summary>
    [JsonIgnore]
    public new string? DataUrl
    {
        get => Props.TryGetValue("dataUrl", out var value) ? value as string : null;
        set { if (value != null) Props["dataUrl"] = value; }
    }

    /// <summary>
    /// Minimum zoom level
    /// </summary>
    [JsonIgnore]
    public new int MinZoom
    {
        get => Props.TryGetValue("minZoom", out var value) && value is int i ? i : 0;
        set => Props["minZoom"] = value;
    }

    /// <summary>
    /// Maximum zoom level
    /// </summary>
    [JsonIgnore]
    public int MaxZoom
    {
        get => Props.TryGetValue("maxZoom", out var value) && value is int i ? i : 22;
        set => Props["maxZoom"] = value;
    }

    /// <summary>
    /// Whether features can be clicked/hovered
    /// </summary>
    [JsonIgnore]
    public new bool Pickable
    {
        get => Props.TryGetValue("pickable", out var value) && value is bool b ? b : true;
        set => Props["pickable"] = value;
    }

    /// <summary>
    /// Whether to draw polygon strokes
    /// </summary>
    [JsonIgnore]
    public bool Stroked
    {
        get => Props.TryGetValue("stroked", out var value) && value is bool b ? b : true;
        set => Props["stroked"] = value;
    }

    /// <summary>
    /// Whether to fill polygons
    /// </summary>
    [JsonIgnore]
    public bool Filled
    {
        get => Props.TryGetValue("filled", out var value) && value is bool b ? b : true;
        set => Props["filled"] = value;
    }

    /// <summary>
    /// Fill color for polygon features [R, G, B, A]
    /// </summary>
    [JsonIgnore]
    public int[]? FillColor
    {
        get => Props.TryGetValue("fillColor", out var value) ? value as int[] : null;
        set { if (value != null) Props["fillColor"] = value; }
    }

    /// <summary>
    /// Line color for features [R, G, B, A]
    /// </summary>
    [JsonIgnore]
    public int[]? LineColor
    {
        get => Props.TryGetValue("lineColor", out var value) ? value as int[] : null;
        set { if (value != null) Props["lineColor"] = value; }
    }

    /// <summary>
    /// Line width scale
    /// </summary>
    [JsonIgnore]
    public int LineWidthScale
    {
        get => Props.TryGetValue("lineWidthScale", out var value) && value is int i ? i : 1;
        set => Props["lineWidthScale"] = value;
    }

    /// <summary>
    /// Minimum line width in pixels
    /// </summary>
    [JsonIgnore]
    public int LineWidthMinPixels
    {
        get => Props.TryGetValue("lineWidthMinPixels", out var value) && value is int i ? i : 1;
        set => Props["lineWidthMinPixels"] = value;
    }

    /// <summary>
    /// Point radius for point features
    /// </summary>
    [JsonIgnore]
    public int PointRadiusMinPixels
    {
        get => Props.TryGetValue("pointRadiusMinPixels", out var value) && value is int i ? i : 2;
        set => Props["pointRadiusMinPixels"] = value;
    }

    /// <summary>
    /// Create an MVT layer for GeoServer TMS endpoint
    /// </summary>
    /// <param name="id">Layer ID</param>
    /// <param name="geoserverUrl">GeoServer base URL (e.g., "http://localhost:8080/geoserver")</param>
    /// <param name="workspace">GeoServer workspace name</param>
    /// <param name="layerName">GeoServer layer name</param>
    /// <param name="srs">Spatial reference system (default: EPSG:900913 for Web Mercator)</param>
    public static MVTLayerConfig FromGeoServer(
        string id,
        string geoserverUrl,
        string workspace,
        string layerName,
        string srs = "EPSG:900913")
    {
        // GeoServer TMS MVT URL pattern
        // Note: GeoServer uses {-y} for TMS (inverted Y axis)
        var url = $"{geoserverUrl.TrimEnd('/')}/gwc/service/tms/1.0.0/{workspace}:{layerName}@{srs}@pbf/{{z}}/{{x}}/{{-y}}.pbf";

        return new MVTLayerConfig
        {
            Id = id,
            DataUrl = url,
            MinZoom = 0,
            MaxZoom = 22,
            Pickable = true,
            Stroked = true,
            Filled = true,
            FillColor = [160, 160, 180, 200],
            LineColor = [80, 80, 80, 255],
            LineWidthMinPixels = 1,
            PointRadiusMinPixels = 2
        };
    }

    /// <summary>
    /// Create an MVT layer from a generic MVT URL
    /// </summary>
    public static MVTLayerConfig FromUrl(string id, string mvtUrl)
    {
        return new MVTLayerConfig
        {
            Id = id,
            DataUrl = mvtUrl,
            MinZoom = 0,
            MaxZoom = 22,
            Pickable = true,
            Stroked = true,
            Filled = true,
            FillColor = [160, 160, 180, 200],
            LineColor = [80, 80, 80, 255],
            LineWidthMinPixels = 1,
            PointRadiusMinPixels = 2
        };
    }
}
