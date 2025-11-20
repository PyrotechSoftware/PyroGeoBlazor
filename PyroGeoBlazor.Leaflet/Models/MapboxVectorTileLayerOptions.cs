namespace PyroGeoBlazor.Leaflet.Models;

using System.Text.Json.Serialization;

public class MapboxVectorTileLayerOptions : GridLayerOptions
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Format { get; set; } = "MVT";

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int TilePixelRatio { get; set; } = 1;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public new string Pane { get; set; } = "overlayPane";

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool? EnableFeatureContextMenu { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public LayerFeatureStyle? Style { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public FeatureStyle? SelectedFeatureStyle { get; set; }

    public string? LayerName { get; set; }
}
