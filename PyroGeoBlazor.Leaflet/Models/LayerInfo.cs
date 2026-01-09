namespace PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Minimal layer information received from JavaScript events.
/// Contains only the essential identifiers without the full layer object.
/// </summary>
public class LayerInfo
{
    /// <summary>
    /// The Leaflet internal ID for the layer.
    /// </summary>
    public int? LeafletId { get; set; }

    /// <summary>
    /// The type name of the layer (e.g., "Marker", "Polyline", "GeoJSON").
    /// </summary>
    public string? Type { get; set; }
}
