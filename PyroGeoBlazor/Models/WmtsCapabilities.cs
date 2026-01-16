namespace PyroGeoBlazor.Models;

/// <summary>
/// Represents the result of parsing a WMTS GetCapabilities response.
/// </summary>
public class WmtsCapabilities
{
    /// <summary>
    /// List of available layers.
    /// </summary>
    public List<WmtsLayerInfo> Layers { get; set; } = [];

    /// <summary>
    /// Service title.
    /// </summary>
    public string ServiceTitle { get; set; } = string.Empty;

    /// <summary>
    /// Service abstract.
    /// </summary>
    public string ServiceAbstract { get; set; } = string.Empty;

    /// <summary>
    /// Base URL for the WMTS service.
    /// </summary>
    public string ServiceUrl { get; set; } = string.Empty;
}
