namespace PyroGeoBlazor.Leaflet.EventArgs;

using PyroGeoBlazor.Leaflet.Models;

public class LeafletFeatureMouseEventArgs : LeafletMouseEventArgs
{
    public string? LayerName { get; set; }
    public DecodedMvtFeature? Feature { get; set; }
}
