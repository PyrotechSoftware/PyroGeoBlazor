namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletGeoJsonEventArgs : LeafletEventArgs
{
    /// <summary>
    /// Minimal information about the layer that triggered the event.
    /// Contains the Leaflet ID and type name of the layer.
    /// </summary>
    public LayerInfo? Layer { get; set; }
    public object? Properties { get; set; }
    public string? GeometryType { get; set; }
    public string? Id { get; set; }
}
