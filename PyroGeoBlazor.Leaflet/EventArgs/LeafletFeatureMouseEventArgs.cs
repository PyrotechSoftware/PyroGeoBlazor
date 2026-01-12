namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Event arguments for feature mouse events in vector tile layers.
/// </summary>
public class LeafletFeatureMouseEventArgs : LeafletMouseEventArgs
{
    /// <summary>
    /// The name of the layer containing the feature.
    /// </summary>
    public string? LayerName { get; set; }
    
    /// <summary>
    /// The decoded feature that was interacted with.
    /// </summary>
    public DecodedFeature? Feature { get; set; }
}
