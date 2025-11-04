namespace PyroGeoBlazor.Leaflet.Models;

public class ControlOptions
{
    /// <summary>
    /// The position of the control (one of the map corners).
    /// Possible values are 'topleft', 'topright', 'bottomleft' or 'bottomright'
    /// </summary>
    public string Position { get; set; } = "topright";
}
