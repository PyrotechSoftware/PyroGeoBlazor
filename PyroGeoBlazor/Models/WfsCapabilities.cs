namespace PyroGeoBlazor.Models;

/// <summary>
/// Represents the result of parsing a WFS GetCapabilities response.
/// </summary>
public class WfsCapabilities
{
    /// <summary>
    /// List of available layers (feature types).
    /// </summary>
    public List<WfsLayerInfo> Layers { get; set; } = [];

    /// <summary>
    /// Service title.
    /// </summary>
    public string ServiceTitle { get; set; } = string.Empty;

    /// <summary>
    /// Service abstract.
    /// </summary>
    public string ServiceAbstract { get; set; } = string.Empty;

    /// <summary>
    /// Base URL for the WFS service.
    /// </summary>
    public string ServiceUrl { get; set; } = string.Empty;

    /// <summary>
    /// WFS version (e.g., "1.0.0", "1.1.0", "2.0.0").
    /// </summary>
    public string Version { get; set; } = string.Empty;
}
