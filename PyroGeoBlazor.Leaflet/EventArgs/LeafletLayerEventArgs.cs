namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletLayerEventArgs : LeafletEventArgs
{
    public Layer? Layer { get; set; }
}
