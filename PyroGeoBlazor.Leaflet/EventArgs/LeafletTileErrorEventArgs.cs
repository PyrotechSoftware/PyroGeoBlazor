namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletTileErrorEventArgs : LeafletEventArgs
{
    public object? Tile { get; set; }
    public Point? Coords { get; set; }
    public object? Error { get; set; }
}
