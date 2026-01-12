namespace PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Represents a bounding box for WFS spatial filtering.
/// </summary>
public class WfsBoundingBox
{
    /// <summary>
    /// Minimum X coordinate (west/left).
    /// </summary>
    public required double MinX { get; init; }

    /// <summary>
    /// Minimum Y coordinate (south/bottom).
    /// </summary>
    public required double MinY { get; init; }

    /// <summary>
    /// Maximum X coordinate (east/right).
    /// </summary>
    public required double MaxX { get; init; }

    /// <summary>
    /// Maximum Y coordinate (north/top).
    /// </summary>
    public required double MaxY { get; init; }

    /// <summary>
    /// Spatial Reference System for the bounding box.
    /// Optional. Example: "EPSG:4326"
    /// </summary>
    public string? Srs { get; init; }
}
