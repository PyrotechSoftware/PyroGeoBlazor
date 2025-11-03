namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletTooltipEventArgs : LeafletEventArgs
{
    public Tooltip? Tooltip { get; set; }
}
