namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletTileEventArgs : LeafletEventArgs
{
    public object? Tile { get; set; }
    public Point? Coords { get; set; }
}
