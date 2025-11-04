namespace PyroGeoBlazor.Leaflet.Models;

public class ZoomControlOptions : ControlOptions
{
    public string ZoomInText { get; set; } = "<span aria-hidden=\"true\">+</span>";
    public string ZoomInTitle { get; set; } = "Zoom in";
    public string ZoomOutText { get; set; } = "<span aria-hidden=\"true\">&#x2212;</span>";
    public string ZoomOutTitle { get; set; } = "Zoom out";
}
