namespace PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Represents a decoded vector tile feature from any source (MVT, PBF, GeoJSON, etc.).
/// This class is used by both Protobuf vector tile layers and Slicer vector tile layers.
/// </summary>
public class DecodedFeature
{
    /// <summary>
    /// The name of the layer containing this feature.
    /// </summary>
    public string? LayerName { get; set; }
    
    /// <summary>
    /// The unique identifier of the feature. Can be a string, number, or null.
    /// </summary>
    public object? Id { get; set; }
    
    /// <summary>
    /// The geometry of the feature.
    /// </summary>
    public object? Geometry { get; set; } = new object();
    
    /// <summary>
    /// The properties/attributes of the feature.
    /// </summary>
    public Dictionary<string, object?>? Properties { get; set; } = [];
}
