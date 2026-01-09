namespace PyroGeoBlazor.Leaflet.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Represents a GeoJSON Feature object.
/// </summary>
public class GeoJsonFeature
{
    /// <summary>
    /// The type of the GeoJSON object, always "Feature".
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; set; } = "Feature";

    /// <summary>
    /// The feature's unique identifier.
    /// </summary>
    [JsonPropertyName("id")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public object? Id { get; set; }

    /// <summary>
    /// The geometry object containing the spatial data.
    /// </summary>
    [JsonPropertyName("geometry")]
    public GeoJsonGeometry? Geometry { get; set; }

    /// <summary>
    /// Properties associated with this feature.
    /// </summary>
    [JsonPropertyName("properties")]
    public Dictionary<string, object?>? Properties { get; set; }
}

/// <summary>
/// Represents a GeoJSON Geometry object.
/// </summary>
public class GeoJsonGeometry
{
    /// <summary>
    /// The type of geometry (e.g., "Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon", "GeometryCollection").
    /// </summary>
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    /// <summary>
    /// The coordinates of the geometry. Structure depends on the geometry type.
    /// </summary>
    [JsonPropertyName("coordinates")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public object? Coordinates { get; set; }

    /// <summary>
    /// For GeometryCollection type, contains an array of geometry objects.
    /// </summary>
    [JsonPropertyName("geometries")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public GeoJsonGeometry[]? Geometries { get; set; }
}
