namespace PyroGeoBlazor.Leaflet.Models;

public class PaddingOptions : PanOptions
{
    public Point PaddingTopLeft { get; set; } = new(0, 0);
    public Point PaddingBottomRight { get; set; } = new(0, 0);
    public Point Padding { get; set; } = new(0, 0);
}
