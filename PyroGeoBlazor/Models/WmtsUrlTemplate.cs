namespace PyroGeoBlazor.Models;

/// <summary>
/// Represents a WMTS URL template that can be used to initialize a tile layer.
/// </summary>
public class WmtsUrlTemplate
{
    /// <summary>
    /// The URL template string with placeholders for tile requests.
    /// Example: "https://server.com/wmts/{Layer}/{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.png"
    /// </summary>
    public string UrlTemplate { get; set; } = string.Empty;

    /// <summary>
    /// The layer identifier used in the URL template.
    /// </summary>
    public string Layer { get; set; } = string.Empty;

    /// <summary>
    /// The tile matrix set identifier.
    /// </summary>
    public string TileMatrixSet { get; set; } = string.Empty;

    /// <summary>
    /// The format (e.g., "image/png").
    /// </summary>
    public string Format { get; set; } = string.Empty;

    /// <summary>
    /// The style identifier.
    /// </summary>
    public string Style { get; set; } = string.Empty;
}
