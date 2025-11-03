namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletPopupEventArgs : LeafletEventArgs
{
    public Popup? Popup { get; set; }
}
