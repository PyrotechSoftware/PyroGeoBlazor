namespace PyroGeoBlazor.Leaflet.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Options for configuring an EditableGeoJsonLayer.
/// </summary>
public class EditableGeoJsonLayerOptions : GeoJsonLayerOptions
{
    public EditableGeoJsonLayerOptions(
        Action<GeoJsonFeature, LayerInfo>? onEachFeature = null,
        Func<GeoJsonFeature, LatLng, Marker>? pointToLayer = null,
        Func<GeoJsonFeature, PathOptions>? style = null,
        Func<GeoJsonFeature, bool>? filter = null,
        Func<double[], LatLng>? coordsToLatLng = null)
        : base(onEachFeature, pointToLayer, style, filter, coordsToLatLng)
    {
    }

    /// <summary>
    /// Style to apply when drawing a new feature.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public PathOptions? DrawingStyle { get; set; }

    /// <summary>
    /// Style to apply to features in edit mode.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public PathOptions? EditingStyle { get; set; }

    /// <summary>
    /// Allow snapping to existing vertices when drawing. Default is true.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool EnableSnapping { get; set; } = true;

    /// <summary>
    /// Distance in pixels for snapping to work. Default is 15.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int SnapDistance { get; set; } = 15;

    /// <summary>
    /// Show tooltips/guides while drawing. Default is true.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool ShowDrawingGuides { get; set; } = true;

    /// <summary>
    /// Allow drawing to finish by double-clicking. Default is true.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool AllowDoubleClickFinish { get; set; } = true;

    /// <summary>
    /// Minimum number of points required to complete a polygon. Default is 3.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int MinPolygonPoints { get; set; } = 3;

    /// <summary>
    /// Minimum number of points required to complete a line. Default is 2.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int MinLinePoints { get; set; } = 2;
}
