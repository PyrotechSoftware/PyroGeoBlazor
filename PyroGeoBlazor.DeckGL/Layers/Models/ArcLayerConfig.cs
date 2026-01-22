namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Configuration for an Arc layer in deck.gl.
/// Renders arcs between pairs of source and target coordinates.
/// <see href="https://deck.gl/docs/api-reference/layers/arc-layer"/>
/// </summary>
public class ArcLayerConfig : LayerConfig
{
    /// <inheritdoc />
    [JsonPropertyName("type")]
    public override string Type => "ArcLayer";

    /// <summary>
    /// Width of the arcs in pixels
    /// </summary>
    [JsonIgnore]
    public double? Width
    {
        get => Props.TryGetValue("getWidth", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["getWidth"] = value.Value; }
    }

    /// <summary>
    /// Height of the arc as a ratio of distance between source and target
    /// </summary>
    [JsonIgnore]
    public double? Height
    {
        get => Props.TryGetValue("getHeight", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["getHeight"] = value.Value; }
    }

    /// <summary>
    /// Tilt angle of the arcs in degrees
    /// </summary>
    [JsonIgnore]
    public double? Tilt
    {
        get => Props.TryGetValue("getTilt", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["getTilt"] = value.Value; }
    }

    /// <summary>
    /// Source position color as [R, G, B, A] (0-255)
    /// </summary>
    [JsonIgnore]
    public int[]? SourceColor
    {
        get => Props.TryGetValue("getSourceColor", out var value) && value is int[] arr ? arr : null;
        set { if (value != null) Props["getSourceColor"] = value; }
    }

    /// <summary>
    /// Target position color as [R, G, B, A] (0-255)
    /// </summary>
    [JsonIgnore]
    public int[]? TargetColor
    {
        get => Props.TryGetValue("getTargetColor", out var value) && value is int[] arr ? arr : null;
        set { if (value != null) Props["getTargetColor"] = value; }
    }

    /// <summary>
    /// Property path for source position (e.g., "from.coordinates")
    /// </summary>
    [JsonIgnore]
    public string? SourcePositionProperty
    {
        get => Props.TryGetValue("sourcePositionProperty", out var value) && value is string s ? s : null;
        set { if (value != null) Props["sourcePositionProperty"] = value; }
    }

    /// <summary>
    /// Property path for target position (e.g., "to.coordinates")
    /// </summary>
    [JsonIgnore]
    public string? TargetPositionProperty
    {
        get => Props.TryGetValue("targetPositionProperty", out var value) && value is string s ? s : null;
        set { if (value != null) Props["targetPositionProperty"] = value; }
    }
}
