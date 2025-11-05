namespace PyroGeoBlazor.Leaflet.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Options for displaying WMS services as tile layers on the map.
/// <see href="https://leafletjs.com/reference.html#tilelayer-wms-option"/>
/// </summary>
public class WmsTileLayerOptions : TileLayerOptions
{
    /// <summary>
    /// (Required) Comma-separated list of WMS layers to show.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Layers { get; set; } = string.Empty;

    /// <summary>
    /// Comma-separated list of WMS styles.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Styles { get; set; } = string.Empty;

    /// <summary>
    /// WMS image format (use 'image/png' for layers with transparency).
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Format { get; set; } = "image/jpeg";

    /// <summary>
    /// If true, the WMS service will return images with transparency.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool Transparent { get; set; } = false;

    /// <summary>
    /// Version of the WMS service to use
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Version { get; set; } = "1.1.1";

    /// <summary>
    /// Coordinate Reference System to use for the WMS requests, defaults to map CRS.
    /// Don't change this if you're not sure what it means.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public CrsRef? Crs { get; set; }

    /// <summary>
    /// If true, WMS request parameter keys will be uppercase.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool Uppercase { get; set; } = false;
}
