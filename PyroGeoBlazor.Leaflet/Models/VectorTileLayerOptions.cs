namespace PyroGeoBlazor.Leaflet.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Base options for configuring vector tile layers using Leaflet.VectorGrid plugin.
/// <see href="https://github.com/Leaflet/Leaflet.VectorGrid"/>
/// </summary>
public class VectorTileLayerOptions : GridLayerOptions
{
    /// <summary>
    /// Specifies the renderer factory to use for rendering vector tiles.
    /// Can be either Canvas or SVG. Defaults to Canvas if not specified.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public VectorTileRendererType? RendererFactory { get; set; }

    /// <summary>
    /// A dictionary of styles keyed by vector layer name.
    /// Each value is a <see cref="PathOptions"/> that will be applied to features in that layer.
    /// For layers not specified, VectorGrid will use default styles.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public Dictionary<string, PathOptions>? VectorTileLayerStyles { get; set; }

    /// <summary>
    /// Whether to make tiles interactive (allowing click, hover, etc. events).
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool Interactive { get; set; } = false;

    /// <summary>
    /// A JavaScript function name that will be used to get a unique identifier for each feature.
    /// This is used for feature selection and event handling.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string? GetFeatureId { get; set; }

    /// <summary>
    /// Attribution text to display for this layer.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string? Attribution { get; set; }

    /// <summary>
    /// Style to apply to selected features (used for client-side selection highlighting).
    /// This is a custom feature added by PyroGeoBlazor and not part of the VectorGrid API.
    /// Uses standard Leaflet <see cref="PathOptions"/> for styling.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public PathOptions? SelectedFeatureStyle { get; set; }

    /// <summary>
    /// Whether to enable feature selection on click.
    /// This is a custom feature added by PyroGeoBlazor and not part of the VectorGrid API.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool EnableFeatureSelection { get; set; } = true;

    /// <summary>
    /// Whether to enable multiple feature selection.
    /// This is a custom feature added by PyroGeoBlazor and not part of the VectorGrid API.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool MultipleFeatureSelection { get; set; } = false;

    /// <summary>
    /// Style to apply when hovering over a feature.
    /// If not specified, a default red stroke style will be used (color: red, weight: 2, opacity: 1.0).
    /// Only applies when EnableHoverStyle is true and Interactive is true.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public PathOptions? HoverStyle { get; set; }

    /// <summary>
    /// If true, applies hover styling to features when the mouse hovers over them.
    /// Default is true. Set to false to disable hover effects.
    /// When enabled without a custom HoverStyle, a default red stroke will be applied.
    /// Only works when Interactive is true.
    /// </summary>
    public bool EnableHoverStyle { get; set; } = true;
}
