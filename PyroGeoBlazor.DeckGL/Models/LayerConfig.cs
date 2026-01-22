namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Base class for all deck.gl layer configurations.
/// Blazor uses these to declaratively specify layers; JS handles the actual layer creation.
/// </summary>
public abstract class LayerConfig
{
    /// <summary>
    /// Unique identifier for this layer
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Type of layer (e.g., "GeoJsonLayer", "ScatterplotLayer")
    /// </summary>
    [JsonPropertyName("type")]
    public abstract string Type { get; }

    /// <summary>
    /// URL to fetch data from (optional - JS will handle fetching)
    /// If not provided, use Data property instead
    /// </summary>
    [JsonPropertyName("dataUrl")]
    public string? DataUrl { get; set; }

    /// <summary>
    /// Inline data (optional - use when data is small or already available)
    /// If DataUrl is provided, this is ignored
    /// </summary>
    [JsonPropertyName("data")]
    public object? Data { get; set; }

    /// <summary>
    /// Layer-specific properties passed to deck.gl
    /// </summary>
    [JsonPropertyName("props")]
    public Dictionary<string, object> Props { get; set; } = [];

    /// <summary>
    /// Base feature style applied to all features in this layer
    /// </summary>
    [JsonPropertyName("featureStyle")]
    public FeatureStyle? FeatureStyle { get; set; }

    /// <summary>
    /// Style applied to selected features in this layer (overrides FeatureStyle for selected features)
    /// If not set, the global selection style is used
    /// </summary>
    [JsonPropertyName("selectionStyle")]
    public FeatureStyle? SelectionStyle { get; set; }

    /// <summary>
    /// Style applied to hovered feature in this layer
    /// If not set, no hover styling is applied
    /// </summary>
    [JsonPropertyName("hoverStyle")]
    public FeatureStyle? HoverStyle { get; set; }

    /// <summary>
    /// Configuration for tooltip display when hovering over features in this layer
    /// If not set, default tooltip behavior is used
    /// </summary>
    [JsonPropertyName("tooltipConfig")]
    public TooltipConfig? TooltipConfig { get; set; }

    /// <summary>
    /// Property name to use as the unique feature identifier for selection and deduplication.
    /// This is especially important for MVT layers where features can span multiple tiles.
    /// Example: "CustomIdentifier", "OBJECTID", "id", etc.
    /// If not set, the system will try common ID fields.
    /// </summary>
    [JsonPropertyName("uniqueIdProperty")]
    public string? UniqueIdProperty { get; set; }

    /// <summary>
    /// Property name to use for displaying feature names in the UI (e.g., in selection lists).
    /// If not set, falls back to UniqueIdProperty.
    /// Example: "name", "label", "title", etc.
    /// </summary>
    [JsonPropertyName("displayProperty")]
    public string? DisplayProperty { get; set; }

    /// <summary>
    /// Optional renderer for styling features based on attribute values (like ArcGIS UniqueValueRenderer).
    /// When set, each unique value of the specified attribute gets its own style.
    /// Example: Style parcels by zoning type, with different colors for Residential, Commercial, Industrial, etc.
    /// </summary>
    [JsonPropertyName("uniqueValueRenderer")]
    public UniqueValueRenderer? UniqueValueRenderer { get; set; }

    /// <summary>
    /// Whether the layer is pickable (can be clicked/hovered)
    /// </summary>
    [JsonIgnore]
    public bool Pickable
    {
        get => Props.TryGetValue("pickable", out var value) && value is bool b && b;
        set => Props["pickable"] = value;
    }

    /// <summary>
    /// Opacity of the layer (0-1)
    /// </summary>
    [JsonIgnore]
    public double? Opacity
    {
        get => Props.TryGetValue("opacity", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["opacity"] = value.Value; }
    }

    /// <summary>
    /// Whether the layer is visible
    /// </summary>
    [JsonIgnore]
    public bool Visible
    {
        get => !Props.ContainsKey("visible") || Props["visible"] is bool b && b;
        set => Props["visible"] = value;
    }
}

/// <summary>
/// Event arguments for layer click events
/// </summary>
public class LayerClickEventArgs
{
    [JsonPropertyName("layerId")]
    public string? LayerId { get; set; }

    [JsonPropertyName("object")]
    public object? Object { get; set; }

    [JsonPropertyName("coordinate")]
    public double[]? Coordinate { get; set; }

    [JsonPropertyName("pixel")]
    public double[]? Pixel { get; set; }
}

/// <summary>
/// Event arguments for layer hover events
/// </summary>
public class LayerHoverEventArgs
{
    [JsonPropertyName("layerId")]
    public string? LayerId { get; set; }

    [JsonPropertyName("object")]
    public object? Object { get; set; }

    [JsonPropertyName("coordinate")]
    public double[]? Coordinate { get; set; }
}
