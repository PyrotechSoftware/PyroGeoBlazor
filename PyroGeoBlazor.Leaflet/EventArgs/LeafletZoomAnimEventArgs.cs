namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletZoomAnimEventArgs : LeafletEventArgs
{
    public LatLng? Center { get; set; }
    public double? Zoom { get; set; }
    public bool? NoUpdate { get; set; }
}
