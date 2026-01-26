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

    /// <summary>
    /// Whether the layer allows attribute editing and symbology changes.
    /// When false, the layer is locked and cannot be edited through the UI.
    /// Defaults to false (locked) for safety - must be explicitly set to true to allow editing.
    /// </summary>
    [JsonIgnore]
    public bool IsEditable { get; set; } = false;

    /// <summary>
    /// Configuration for editable attribute fields.
    /// Defines which fields can be edited, their data types, and constraints.
    /// If not set, no attribute editing is available even if IsEditable is true.
    /// </summary>
    [JsonPropertyName("editableFields")]
    public List<AttributeFieldConfig> EditableFields { get; set; } = [];

    /// <summary>
    /// Optional list of property names to exclude from the attributes display.
    /// These properties will not be shown in the FeatureAttributesControl.
    /// Example: new[] { "geometry", "bbox", "id" }
    /// </summary>
    [JsonIgnore]
    public string[]? ExcludedProperties { get; set; }

    /// <summary>
    /// Minimum zoom level before the layer's data is fetched from the server.
    /// Below this zoom level, no data will be loaded (layer appears empty).
    /// This is useful for performance optimization on layers with large datasets that should only appear when zoomed in.
    /// Example: Set to 12 for parcel layers that should only load when zoomed to neighborhood level.
    /// If null or 0, data loads at all zoom levels.
    /// </summary>
    [JsonPropertyName("minZoom")]
    public double? MinZoom { get; set; }

    /// <summary>
    /// Whether to enable viewport culling for this layer.
    /// When true, the layer's DataUrl will be automatically appended with viewport bounds and zoom parameters.
    /// The API endpoint must support minLon, minLat, maxLon, maxLat, and zoom query parameters.
    /// This significantly reduces data transfer for large datasets by only loading visible features.
    /// Defaults to false for backward compatibility.
    /// </summary>
    [JsonPropertyName("enableViewportCulling")]
    public bool EnableViewportCulling { get; set; } = false;

    /// <summary>
    /// Debounce timeout in milliseconds for tile loading indicators (for MVT/Tile layers).
    /// After the last tile completes loading, the loading indicator will wait this long before disappearing.
    /// This prevents flickering when tiles load in quick succession.
    /// Larger layers with more tiles may need a longer timeout (e.g., 2000ms).
    /// Defaults to 1000ms (1 second).
    /// </summary>
    [JsonPropertyName("tileLoadingDebounceMs")]
    public int TileLoadingDebounceMs { get; set; } = 1000;
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
