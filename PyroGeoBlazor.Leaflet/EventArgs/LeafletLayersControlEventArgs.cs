namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletLayersControlEventArgs : LeafletEventArgs
{
    /// <summary>
    /// Minimal information about the layer that triggered the event.
    /// Contains the Leaflet ID and type name of the layer.
    /// </summary>
    public LayerInfo? Layer { get; set; }
    public string? Name { get; set; }
}
