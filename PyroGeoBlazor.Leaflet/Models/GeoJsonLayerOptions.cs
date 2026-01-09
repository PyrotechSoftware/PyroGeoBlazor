namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Text.Json.Serialization;

public class GeoJsonLayerOptions : InteractiveLayerOptions
{
    private readonly GeoJsonLayerInterop _interop;

    public GeoJsonLayerOptions(
        Action<GeoJsonFeature, LayerInfo>? onEachFeature = null,
        Func<GeoJsonFeature, LatLng, Marker>? pointToLayer = null,
        Func<GeoJsonFeature, PathOptions>? style = null,
        Func<GeoJsonFeature, bool>? filter = null,
        Func<double[], LatLng>? coordsToLatLng = null)
    {
        _interop = new GeoJsonLayerInterop(onEachFeature, pointToLayer, style, filter, coordsToLatLng);

        if (onEachFeature != null || pointToLayer != null || style != null || filter != null || coordsToLatLng != null)
        {
            Interop = DotNetObjectReference.Create(_interop);
        }
    }

    /// <summary>
    /// Whether default Markers for "Point" type Features inherit from group options.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool MarkersInheritOptions { get; set; } = false;

    /// <summary>
    /// Enable verbose console logging for debugging GeoJSON operations.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool DebugLogging { get; set; } = false;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public DotNetObjectReference<GeoJsonLayerInterop>? Interop { get; set; }

    public bool OnEachFeatureEnabled => _interop.OnEachFeatureAction != null;
    public bool PointToLayerEnabled => _interop.PointToLayerFunc != null;
    public bool StyleEnabled => _interop.StyleFunc != null;
    public bool FilterEnabled => _interop.FilterFunc != null;
    public bool CoordsToLatLngEnabled => _interop.CoordsToLatLngFunc != null;
}
