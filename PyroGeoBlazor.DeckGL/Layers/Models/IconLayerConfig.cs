namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Configuration for an Icon layer in deck.gl.
/// Renders icons/markers at given coordinates.
/// <see href="https://deck.gl/docs/api-reference/layers/icon-layer"/>
/// </summary>
public class IconLayerConfig : LayerConfig
{
    /// <inheritdoc />
    [JsonPropertyName("type")]
    public override string Type => "IconLayer";

    /// <summary>
    /// Size scale multiplier for icons
    /// </summary>
    [JsonIgnore]
    public double? SizeScale
    {
        get => Props.TryGetValue("sizeScale", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["sizeScale"] = value.Value; }
    }

    /// <summary>
    /// Minimum icon size in pixels
    /// </summary>
    [JsonIgnore]
    public double? SizeMinPixels
    {
        get => Props.TryGetValue("sizeMinPixels", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["sizeMinPixels"] = value.Value; }
    }

    /// <summary>
    /// Maximum icon size in pixels
    /// </summary>
    [JsonIgnore]
    public double? SizeMaxPixels
    {
        get => Props.TryGetValue("sizeMaxPixels", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["sizeMaxPixels"] = value.Value; }
    }

    /// <summary>
    /// Whether to render as billboards (always facing camera)
    /// </summary>
    [JsonIgnore]
    public bool Billboard
    {
        get => !Props.ContainsKey("billboard") || Props["billboard"] is bool b && b;
        set => Props["billboard"] = value;
    }

    /// <summary>
    /// The name of the icon to use from the icon mapping
    /// </summary>
    [JsonIgnore]
    public string IconName
    {
        get => Props.TryGetValue("iconName", out var value) && value is string s ? s : "marker";
        set => Props["iconName"] = value;
    }

    /// <summary>
    /// Icon size in pixels
    /// </summary>
    [JsonIgnore]
    public double IconSize
    {
        get => Props.TryGetValue("iconSize", out var value) && value is double d ? d : 32.0;
        set => Props["iconSize"] = value;
    }
}
