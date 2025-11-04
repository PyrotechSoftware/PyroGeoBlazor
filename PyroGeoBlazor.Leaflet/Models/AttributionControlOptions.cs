namespace PyroGeoBlazor.Leaflet.Models;

public class AttributionControlOptions
{
    /// <summary>
    /// The HTML text shown before the attributions. Default is "Leaflet"
    /// </summary>
    public string? Prefix { get; set; } = "Leaflet";

    /// <summary>
    /// If true, the control will be created disabled (not shown). Default is false.
    /// </summary>
    public bool Disabled { get; set; } = false;
}
