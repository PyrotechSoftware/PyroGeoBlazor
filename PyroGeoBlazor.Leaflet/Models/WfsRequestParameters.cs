namespace PyroGeoBlazor.Leaflet.Models;

using PyroGeoBlazor.Models;

/// <summary>
/// Parameters for a WFS GetFeature request.
/// </summary>
public class WfsRequestParameters
{
    /// <summary>
    /// The feature type name (e.g., "workspace:layername").
    /// Required.
    /// </summary>
    public required string TypeName { get; init; }

    /// <summary>
    /// WFS version. Defaults to "1.0.0".
    /// </summary>
    public string Version { get; init; } = "1.0.0";

    /// <summary>
    /// Maximum number of features to return.
    /// Optional. Recommended for large datasets.
    /// </summary>
    public int? MaxFeatures { get; init; }

    /// <summary>
    /// CQL filter to apply to the features.
    /// Optional. Example: "population > 1000000"
    /// </summary>
    public string? CqlFilter { get; init; }

    /// <summary>
    /// Comma-separated list of property names to include.
    /// Optional. If not specified, all properties are returned.
    /// </summary>
    public string? PropertyName { get; init; }

    /// <summary>
    /// Spatial Reference System name (e.g., "EPSG:4326").
    /// Optional. Defaults to the layer's native SRS.
    /// </summary>
    public string? SrsName { get; init; }

    /// <summary>
    /// Bounding box to filter features spatially.
    /// Optional.
    /// </summary>
    public WfsBoundingBox? BBox { get; init; }
}
