namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Text.Json.Serialization;

public class GeoJsonLayerOptions : InteractiveLayerOptions
{
    private readonly Action<object, object>? _onEachFeature;

    public GeoJsonLayerOptions(Action<object, object>? onEachFeature = null)
    {
        _onEachFeature = onEachFeature;
        var interop = new GeoJsonLayerInterop(_onEachFeature);
        Interop = DotNetObjectReference.Create(interop);
    }

    /// <summary>
    /// Whether default Markers for "Point" type Features inherit from group options.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool MarkersInheritOptions { get; set; } = false;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public DotNetObjectReference<GeoJsonLayerInterop>? Interop { get; set; }
}
