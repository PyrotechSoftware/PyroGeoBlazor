namespace PyroGeoBlazor.Leaflet.EventArgs;

public class LeafletEventArgs
{
    public string? Type { get; set; }
    public object? Target { get; set; }
    public object? SourceTarget { get; set; }
    public object? PropagatedFrom { get; set; }
}
