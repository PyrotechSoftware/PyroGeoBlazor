namespace PyroGeoBlazor.Leaflet.Models;

using System.Text.Json.Serialization;

/// <summary>
/// The options used to create a <see cref="TileLayer"/>.
/// </summary>
public class TileLayerOptions : GridLayerOptions
{
    /// <summary>
    /// The minimum zoom level down to which this layer will be displayed (inclusive).
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public new int MinZoom { get; set; } = 0;

    /// <summary>
    /// The maximum zoom level up to which this layer will be displayed (inclusive).
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public new int MaxZoom { get; set; } = 18;

    /// <summary>
    /// Subdomains of the tile service.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string[] Subdomains { get; set; } = ["a","b","c"];

    /// <summary>
    /// URL to the tile image to show in place of the tile that failed to load.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string ErrorTileUrl { get; set; } = string.Empty;

    /// <summary>
    /// The zoom number used in tile URLs will be offset with this value.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int ZoomOffset { get; set; } = 0;

    /// <summary>
    /// If true, inverses Y axis numbering for tiles (turn this on for TMS services).
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool Tms { get; set; } = false;

    /// <summary>
    /// If set to true, the zoom number used in tile URLs will be reversed (maxZoom - zoom instead of zoom)
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool ZoomReverse { get; set; } = false;

    /// <summary>
    /// If true and user is on a retina display,
    /// it will request four tiles of half the specified size
    /// and a bigger zoom level in place of one to utilize the high resolution.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool DetectRetina { get; set; } = false;

    /// <summary>
    /// Whether the crossOrigin attribute will be added to the tiles.
    /// If a String is provided, all tiles will have their crossOrigin attribute set to the String provided.
    /// This is needed if you want to access tile pixel data.Refer to CORS Settings for valid String values.
    /// </summary>
    public bool CrossOrigin { get; set; } = false;

    /// <summary>
    /// Whether the referrerPolicy attribute will be added to the tiles.
    /// If a String is provided, all tiles will have their referrerPolicy attribute set to the String provided.
    /// This may be needed if your map's rendering context has a strict default
    /// but your tile provider expects a valid referrer (e.g. to validate an API token).
    /// Refer to HTMLImageElement.referrerPolicy for valid String values.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool ReferrerPolicy { get; set; } = false;
}
