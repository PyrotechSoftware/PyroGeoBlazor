namespace PyroGeoBlazor.Models;

/// <summary>
/// Represents information about a WFS layer from GetCapabilities response.
/// </summary>
public class WfsLayerInfo
{
    /// <summary>
    /// The layer name (type name).
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// The layer title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// The layer abstract/description.
    /// </summary>
    public string Abstract { get; set; } = string.Empty;

    /// <summary>
    /// Default coordinate reference system (CRS/SRS).
    /// </summary>
    public string DefaultCrs { get; set; } = string.Empty;

    /// <summary>
    /// List of other supported CRS.
    /// </summary>
    public List<string> OtherCrs { get; set; } = [];

    /// <summary>
    /// Bounding box for the layer in WGS84 (EPSG:4326).
    /// </summary>
    public WfsBoundingBox? BoundingBox { get; set; }

    /// <summary>
    /// Available output formats.
    /// </summary>
    public List<string> OutputFormats { get; set; } = [];
}

/// <summary>
/// Represents a bounding box for WFS layers.
/// </summary>
public class WfsBoundingBox
{
    /// <summary>
    /// Minimum X coordinate (longitude/easting).
    /// </summary>
    public double MinX { get; set; }

    /// <summary>
    /// Minimum Y coordinate (latitude/northing).
    /// </summary>
    public double MinY { get; set; }

    /// <summary>
    /// Maximum X coordinate (longitude/easting).
    /// </summary>
    public double MaxX { get; set; }

    /// <summary>
    /// Maximum Y coordinate (latitude/northing).
    /// </summary>
    public double MaxY { get; set; }

    /// <summary>
    /// The coordinate reference system for this bounding box.
    /// </summary>
    public string Crs { get; set; } = "EPSG:4326";
}
