namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Configuration for styling features on the map.
/// Can be used as a base style for all features or as a selection style for selected features.
/// </summary>
public class FeatureStyle
{
    /// <summary>
    /// Fill color for features as a hex string (e.g., "#FF0000" or "#FF0000FF" with alpha).
    /// Default: "#FFFF00" (yellow) for selection
    /// </summary>
    [JsonPropertyName("fillColor")]
    public string? FillColor { get; set; }

    /// <summary>
    /// Opacity for the fill (0.0 to 1.0).
    /// Default: 0.6 for selection
    /// </summary>
    [JsonPropertyName("fillOpacity")]
    public double? FillOpacity { get; set; }

    /// <summary>
    /// Line/border color for features as a hex string (e.g., "#FF0000" or "#FF0000FF" with alpha).
    /// Default: "#FFFF00" (yellow) for selection
    /// </summary>
    [JsonPropertyName("lineColor")]
    public string? LineColor { get; set; }

    /// <summary>
    /// Opacity for the line/border (0.0 to 1.0).
    /// Default: 1.0 (fully opaque)
    /// </summary>
    [JsonPropertyName("opacity")]
    public double? Opacity { get; set; }

    /// <summary>
    /// Line width for features in pixels.
    /// Default: 3 for selection
    /// </summary>
    [JsonPropertyName("lineWidth")]
    public int? LineWidth { get; set; }

    /// <summary>
    /// Radius scale multiplier for point features.
    /// Default: 1.5 (50% larger) for selection
    /// </summary>
    [JsonPropertyName("radiusScale")]
    public double? RadiusScale { get; set; }

    /// <summary>
    /// Create a default yellow style (commonly used for selection)
    /// </summary>
    public static FeatureStyle Yellow => new()
    {
        FillColor = "#FFFF00",
        FillOpacity = 0.6,
        LineColor = "#FFFF00",
        Opacity = 1.0,
        LineWidth = 3,
        RadiusScale = 1.5
    };

    /// <summary>
    /// Create a red style
    /// </summary>
    public static FeatureStyle Red => new()
    {
        FillColor = "#FF0000",
        FillOpacity = 0.6,
        LineColor = "#FF0000",
        Opacity = 1.0,
        LineWidth = 3,
        RadiusScale = 1.5
    };

    /// <summary>
    /// Create a green style
    /// </summary>
    public static FeatureStyle Green => new()
    {
        FillColor = "#00FF00",
        FillOpacity = 0.6,
        LineColor = "#00FF00",
        Opacity = 1.0,
        LineWidth = 3,
        RadiusScale = 1.5
    };

    /// <summary>
    /// Create a blue style
    /// </summary>
    public static FeatureStyle Blue => new()
    {
        FillColor = "#0096FF",
        FillOpacity = 0.6,
        LineColor = "#0096FF",
        Opacity = 1.0,
        LineWidth = 3,
        RadiusScale = 1.5
    };

    /// <summary>
    /// Create an orange style
    /// </summary>
    public static FeatureStyle Orange => new()
    {
        FillColor = "#FF8C00",
        FillOpacity = 0.6,
        LineColor = "#FF8C00",
        Opacity = 1.0,
        LineWidth = 3,
        RadiusScale = 1.5
    };

    /// <summary>
    /// Create a purple style
    /// </summary>
    public static FeatureStyle Purple => new()
    {
        FillColor = "#9333EA",
        FillOpacity = 0.6,
        LineColor = "#9333EA",
        Opacity = 1.0,
        LineWidth = 3,
        RadiusScale = 1.5
    };

    /// <summary>
    /// Create a gray style
    /// </summary>
    public static FeatureStyle Gray => new()
    {
        FillColor = "#868E96",
        FillOpacity = 0.5,
        LineColor = "#495057",
        Opacity = 1.0,
        LineWidth = 1,
        RadiusScale = 1.0
    };
}


