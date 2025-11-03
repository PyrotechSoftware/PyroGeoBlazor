namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletLocationEventArgs : LeafletEventArgs
{
    public LatLng? LatLng { get; set; }
    public LatLngBounds? Bounds { get; set; }
    public double? Accuracy { get; set; }
    public double? Altitude { get; set; }
    public double? AltitudeAccuracy { get; set; }
    public double? Heading { get; set; }
    public double? Speed { get; set; }
    public double? Timestamp { get; set; }
}
