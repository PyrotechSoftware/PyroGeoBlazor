namespace PyroGeoBlazor.Leaflet.EventArgs;

public class LeafletErrorEventArgs : LeafletEventArgs
{
    public string? Message { get; set; }
    public int? Code { get; set; }
}
