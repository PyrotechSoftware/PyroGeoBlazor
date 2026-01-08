namespace PyroGeoBlazor.Leaflet.Models;

public class GeoJsonLayerOptions : InteractiveLayerOptions
{
    /// <summary>
    /// Whether default Markers for "Point" type Features inherit from group options.
    /// </summary>
    public bool MarkersInheritOptions { get; set; }
}
