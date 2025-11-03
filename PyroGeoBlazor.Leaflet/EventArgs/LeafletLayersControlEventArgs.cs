namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletLayersControlEventArgs : LeafletEventArgs
{
    public Layer? Layer { get; set; }
    public string? Name { get; set; }
}
