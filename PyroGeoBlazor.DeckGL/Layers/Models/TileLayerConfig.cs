namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Configuration for a TileLayer that displays raster or vector tiles.
/// Commonly used for base maps like OpenStreetMap.
/// </summary>
public class TileLayerConfig : LayerConfig
{
    /// <inheritdoc />
    [JsonPropertyName("type")]
    public override string Type => "TileLayer";

    /// <summary>
    /// URL template for tile data. Use {x}, {y}, {z} as placeholders.
    /// Example: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    /// </summary>
    [JsonIgnore]
    public string? TileUrl
    {
        get => Props.TryGetValue("tileUrl", out var value) ? value as string : null;
        set { if (value != null) Props["tileUrl"] = value; }
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
        get => Props.TryGetValue("maxZoom", out var value) && value is int i ? i : 19;
        set => Props["maxZoom"] = value;
    }

    /// <summary>
    /// Tile size in pixels (default: 256)
    /// </summary>
    [JsonIgnore]
    public int TileSize
    {
        get => Props.TryGetValue("tileSize", out var value) && value is int i ? i : 256;
        set => Props["tileSize"] = value;
    }

    /// <summary>
    /// Z-index for layer ordering (lower values render first)
    /// </summary>
    [JsonIgnore]
    public int ZIndex
    {
        get => Props.TryGetValue("zIndex", out var value) && value is int i ? i : 0;
        set => Props["zIndex"] = value;
    }

    /// <summary>
    /// Create an OpenStreetMap tile layer
    /// </summary>
    public static TileLayerConfig OpenStreetMap(string id = "osm-base-layer")
    {
        return new TileLayerConfig
        {
            Id = id,
            TileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            MinZoom = 0,
            MaxZoom = 19,
            TileSize = 256,
            ZIndex = -1,  // Render below other layers
            Visible = true
        };
    }

    /// <summary>
    /// Create a Carto base map tile layer
    /// </summary>
    public static TileLayerConfig CartoLight(string id = "carto-light-layer")
    {
        return new TileLayerConfig
        {
            Id = id,
            TileUrl = "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            MinZoom = 0,
            MaxZoom = 19,
            TileSize = 256,
            ZIndex = -1,
            Visible = true
        };
    }

    /// <summary>
    /// Create a Carto dark base map tile layer
    /// </summary>
    public static TileLayerConfig CartoDark(string id = "carto-dark-layer")
    {
        return new TileLayerConfig
        {
            Id = id,
            TileUrl = "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            MinZoom = 0,
            MaxZoom = 19,
            TileSize = 256,
            ZIndex = -1,
            Visible = true
        };
    }
}
