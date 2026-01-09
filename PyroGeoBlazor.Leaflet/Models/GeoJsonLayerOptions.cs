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

    /// <summary>
    /// Enable feature selection when clicking on features. Enabled by default.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool EnableFeatureSelection { get; set; } = true;

    /// <summary>
    /// Allow multiple features to be selected simultaneously. When false, selecting a new feature will deselect the previous one.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool MultipleFeatureSelection { get; set; } = false;

    /// <summary>
    /// Style to apply to selected features.
    /// If not specified, a default blue highlight style will be used (color: #3388ff, weight: 3, opacity: 1, fillOpacity: 0.5).
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public PathOptions? SelectedFeatureStyle { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public DotNetObjectReference<GeoJsonLayerInterop>? Interop { get; set; }

    public bool OnEachFeatureEnabled => _interop.OnEachFeatureAction != null;
    public bool PointToLayerEnabled => _interop.PointToLayerFunc != null;
    public bool StyleEnabled => _interop.StyleFunc != null;
    public bool FilterEnabled => _interop.FilterFunc != null;
    public bool CoordsToLatLngEnabled => _interop.CoordsToLatLngFunc != null;
}
