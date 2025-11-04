namespace PyroGeoBlazor.Leaflet.Models;

public class LayersControlOptions : ControlOptions
{
    public bool Collapsed { get; set; } = true;
    public bool AutoZIndex { get; set; } = true;
    public bool HideSingleBase { get; set; } = false;
    public bool SortLayers { get; set; } = false;
    public object? SortFunction { get; set; } = null;
}
