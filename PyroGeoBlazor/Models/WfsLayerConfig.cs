namespace PyroGeoBlazor.Models;

/// <summary>
/// Configuration for a WFS layer that can be used to initialize a WFS layer.
/// </summary>
public class WfsLayerConfig
{
    /// <summary>
    /// The base URL for the WFS service.
    /// </summary>
    public string ServiceUrl { get; set; } = string.Empty;

    /// <summary>
    /// The layer name (type name) to request.
    /// </summary>
    public string TypeName { get; set; } = string.Empty;

    /// <summary>
    /// The WFS version (e.g., "1.0.0", "1.1.0", "2.0.0").
    /// </summary>
    public string Version { get; set; } = "2.0.0";

    /// <summary>
    /// The coordinate reference system to use for the request.
    /// </summary>
    public string SrsName { get; set; } = "EPSG:4326";

    /// <summary>
    /// The bounding box for the layer.
    /// </summary>
    public WfsBoundingBox? BoundingBox { get; set; }

    /// <summary>
    /// Maximum number of features to retrieve.
    /// </summary>
    public int? MaxFeatures { get; set; }

    /// <summary>
    /// List of all available layers from the service.
    /// </summary>
    public List<WfsLayerInfo> AvailableLayers { get; set; } = [];
}
