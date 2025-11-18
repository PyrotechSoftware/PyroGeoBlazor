namespace PyroGeoBlazor.Leaflet.Models;

public class LayerFeatureStyle
{
    public string? DefaultFill { get; set; }
    public string? DefaultStroke { get; set; }
    public int? DefaultLineWidth { get; set; }
    public Dictionary<string, FeatureStyle>? StylesByLayerName { get; set; }
}
