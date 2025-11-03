namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletMouseEventArgs : LeafletEventArgs
{
    public LatLng? LatLng { get; set; }
    public Point? LayerPoint { get; set; }
    public Point? ContainerPoint { get; set; }
    public object? OriginalEvent { get; set; }
}
