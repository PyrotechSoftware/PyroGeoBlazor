namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Event arguments for when a GeoJSON feature is clicked.
/// </summary>
public class GeoJsonFeatureClickEventArgs : LeafletMouseEventArgs
{
    /// <summary>
    /// Minimal information about the layer that was clicked.
    /// </summary>
    public LayerInfo? Layer { get; set; }

    /// <summary>
    /// The GeoJSON feature that was clicked.
    /// </summary>
    public GeoJsonFeature? Feature { get; set; }
}
