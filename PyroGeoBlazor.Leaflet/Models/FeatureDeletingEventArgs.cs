namespace PyroGeoBlazor.Leaflet.Models;

using System.Collections.Generic;
using System.Text.Json.Serialization;

/// <summary>
/// Event arguments for the FeatureDeleting event that allows cancellation.
/// </summary>
public class FeatureDeletingEventArgs
{
    /// <summary>
    /// The features that are about to be deleted.
    /// </summary>
    [JsonPropertyName("features")]
    public List<GeoJsonFeature>? Features { get; set; }

    /// <summary>
    /// Set to true to cancel the delete operation.
    /// </summary>
    [JsonPropertyName("cancel")]
    public bool Cancel { get; set; }
}
