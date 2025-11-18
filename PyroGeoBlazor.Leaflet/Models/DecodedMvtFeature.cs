namespace PyroGeoBlazor.Leaflet.Models;

public class DecodedMvtFeature
{
    public string? LayerName { get; set; }
    public int? Id { get; set; }
    public object? Geometry { get; set; } = new object();
    public Dictionary<string, object?>? Properties { get; set; } = [];
}
