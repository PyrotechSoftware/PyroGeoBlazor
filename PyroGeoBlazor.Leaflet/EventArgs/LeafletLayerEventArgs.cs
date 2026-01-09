namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletLayerEventArgs : LeafletEventArgs
{
    /// <summary>
    /// Minimal information about the layer that triggered the event.
    /// Contains the Leaflet ID and type name of the layer.
    /// </summary>
    public LayerInfo? Layer { get; set; }
}
