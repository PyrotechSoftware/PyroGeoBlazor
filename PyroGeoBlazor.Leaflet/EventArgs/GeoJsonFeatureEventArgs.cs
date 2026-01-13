namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Event arguments for feature-related events in editable GeoJSON layers.
/// </summary>
public class GeoJsonFeatureEventArgs : System.EventArgs
{
    /// <summary>
    /// The GeoJSON feature associated with the event.
    /// </summary>
    public GeoJsonFeature? Feature { get; set; }

    /// <summary>
    /// Minimal information about the layer associated with the feature.
    /// </summary>
    public LayerInfo? Layer { get; set; }
}
