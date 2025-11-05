namespace PyroGeoBlazor.Leaflet.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Options for configuring a <see cref="GridLayer"/>.
/// <see href="https://leafletjs.com/reference.html#gridlayer-option"/>
/// </summary>
public class GridLayerOptions : LayerOptions
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int TileSize { get; set; } = 256;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public double Opacity { get; set; } = 1.0;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool? UpdateWhenIdle { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool? UpdateWhenZooming { get; set; } = true;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int UpdateInterval { get; set; } = 200;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int ZIndex { get; set; } = 1;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public LatLngBounds? Bounds { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int MinZoom { get; set; } = 0;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int? MaxZoom { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int? MaxNativeZoom { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int? MinNativeZoom { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool NoWrap { get; set; } = false;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public new string Pane { get; set; } = "tilePane";

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string ClassName { get; set; } = string.Empty;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int KeepBuffer { get; set; } = 2;
}
