namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletResizeEventArgs : LeafletEventArgs
{
    public Point? OldSize { get; set; }
    public Point? NewSize { get; set; }
}
