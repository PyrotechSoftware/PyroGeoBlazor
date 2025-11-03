namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletGeoJsonEventArgs : LeafletEventArgs
{
    public Layer? Layer { get; set; }
    public object? Properties { get; set; }
    public string? GeometryType { get; set; }
    public string? Id { get; set; }
}
