namespace PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Defines styles for multiple layers with default fallback values.
/// </summary>
public class LayerFeatureStyle
{
    /// <summary>
    /// Default fill color for features when not specified in layer-specific styles.
    /// </summary>
    public string? DefaultFill { get; set; }
    
    /// <summary>
    /// Default stroke color for features when not specified in layer-specific styles.
    /// </summary>
    public string? DefaultStroke { get; set; }
    
    /// <summary>
    /// Default line width for features when not specified in layer-specific styles.
    /// </summary>
    public int? DefaultLineWidth { get; set; }
    
    /// <summary>
    /// Dictionary of layer-specific styles keyed by layer name.
    /// Uses standard Leaflet <see cref="PathOptions"/> for styling.
    /// </summary>
    public Dictionary<string, PathOptions>? StylesByLayerName { get; set; }
}
