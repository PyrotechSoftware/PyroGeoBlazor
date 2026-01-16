namespace PyroGeoBlazor.Models;

/// <summary>
/// Represents information about a WMTS layer from GetCapabilities response.
/// </summary>
public class WmtsLayerInfo
{
    /// <summary>
    /// The layer identifier.
    /// </summary>
    public string Identifier { get; set; } = string.Empty;

    /// <summary>
    /// The layer title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// The layer abstract/description.
    /// </summary>
    public string Abstract { get; set; } = string.Empty;

    /// <summary>
    /// Available tile matrix sets for this layer.
    /// </summary>
    public List<string> TileMatrixSets { get; set; } = [];

    /// <summary>
    /// Available formats for this layer.
    /// </summary>
    public List<string> Formats { get; set; } = [];

    /// <summary>
    /// Available styles for this layer.
    /// </summary>
    public List<WmtsStyleInfo> Styles { get; set; } = [];

    /// <summary>
    /// Bounding box for the layer (WGS84).
    /// </summary>
    public WmtsBoundingBox? BoundingBox { get; set; }
}

/// <summary>
/// Represents a WMTS style.
/// </summary>
public class WmtsStyleInfo
{
    /// <summary>
    /// Style identifier.
    /// </summary>
    public string Identifier { get; set; } = string.Empty;

    /// <summary>
    /// Style title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Indicates if this is the default style.
    /// </summary>
    public bool IsDefault { get; set; }
}

/// <summary>
/// Represents a bounding box.
/// </summary>
public class WmtsBoundingBox
{
    /// <summary>
    /// Lower corner longitude.
    /// </summary>
    public double MinX { get; set; }

    /// <summary>
    /// Lower corner latitude.
    /// </summary>
    public double MinY { get; set; }

    /// <summary>
    /// Upper corner longitude.
    /// </summary>
    public double MaxX { get; set; }

    /// <summary>
    /// Upper corner latitude.
    /// </summary>
    public double MaxY { get; set; }
}
