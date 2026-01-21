namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json;
using System.Text.Json.Serialization;

/// <summary>
/// Result of a polygon feature selection operation.
/// </summary>
public class FeatureSelectionResult
{
    /// <summary>
    /// The polygon vertices used for selection [longitude, latitude].
    /// </summary>
    [JsonPropertyName("polygon")]
    public double[][] Polygon { get; set; } = [];

    /// <summary>
    /// Array of selected features from various layers.
    /// </summary>
    [JsonPropertyName("features")]
    public SelectedFeature[] Features { get; set; } = [];

    /// <summary>
    /// Total count of selected features.
    /// </summary>
    [JsonPropertyName("featureCount")]
    public int FeatureCount { get; set; }
}

/// <summary>
/// Represents a selected feature from a specific layer.
/// </summary>
public class SelectedFeature
{
    /// <summary>
    /// The ID of the layer containing this feature.
    /// </summary>
    [JsonPropertyName("layerId")]
    public string LayerId { get; set; } = string.Empty;

    /// <summary>
    /// The feature data. Structure varies by layer type (GeoJSON, point data, etc.).
    /// </summary>
    [JsonPropertyName("feature")]
    public JsonElement Feature { get; set; }
}
