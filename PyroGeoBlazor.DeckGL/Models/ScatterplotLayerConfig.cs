namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Configuration for a Scatterplot layer in deck.gl.
/// Renders circles at given coordinates.
/// <see href="https://deck.gl/docs/api-reference/layers/scatterplot-layer"/>
/// </summary>
public class ScatterplotLayerConfig : LayerConfig
{
    /// <inheritdoc />
    [JsonPropertyName("type")]
    public override string Type => "ScatterplotLayer";

    /// <summary>
    /// Radius scale multiplier
    /// </summary>
    [JsonIgnore]
    public double? RadiusScale
    {
        get => Props.TryGetValue("radiusScale", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["radiusScale"] = value.Value; }
    }

    /// <summary>
    /// Minimum radius in pixels
    /// </summary>
    [JsonIgnore]
    public double? RadiusMinPixels
    {
        get => Props.TryGetValue("radiusMinPixels", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["radiusMinPixels"] = value.Value; }
    }

    /// <summary>
    /// Maximum radius in pixels
    /// </summary>
    [JsonIgnore]
    public double? RadiusMaxPixels
    {
        get => Props.TryGetValue("radiusMaxPixels", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["radiusMaxPixels"] = value.Value; }
    }

    /// <summary>
    /// Line width in pixels
    /// </summary>
    [JsonIgnore]
    public double? LineWidthMinPixels
    {
        get => Props.TryGetValue("lineWidthMinPixels", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["lineWidthMinPixels"] = value.Value; }
    }

    /// <summary>
    /// Whether to draw stroked circles
    /// </summary>
    [JsonIgnore]
    public bool Stroked
    {
        get => Props.TryGetValue("stroked", out var value) && value is bool b && b;
        set => Props["stroked"] = value;
    }

    /// <summary>
    /// Whether to draw filled circles
    /// </summary>
    [JsonIgnore]
    public bool Filled
    {
        get => !Props.ContainsKey("filled") || Props["filled"] is bool b && b;
        set => Props["filled"] = value;
    }

    /// <summary>
    /// Property name or accessor for position [longitude, latitude]
    /// </summary>
    [JsonIgnore]
    public string? PositionProperty
    {
        get => Props.TryGetValue("positionProperty", out var value) && value is string s ? s : null;
        set { if (value != null) Props["positionProperty"] = value; }
    }

    /// <summary>
    /// Property name or accessor for radius
    /// </summary>
    [JsonIgnore]
    public string? RadiusProperty
    {
        get => Props.TryGetValue("radiusProperty", out var value) && value is string s ? s : null;
        set { if (value != null) Props["radiusProperty"] = value; }
    }

    /// <summary>
    /// Default fill color as [R, G, B, A] (0-255)
    /// </summary>
    [JsonIgnore]
    public int[]? FillColor
    {
        get => Props.TryGetValue("getFillColor", out var value) && value is int[] arr ? arr : null;
        set { if (value != null) Props["getFillColor"] = value; }
    }

    /// <summary>
    /// Line color as [R, G, B, A] (0-255)
    /// </summary>
    [JsonIgnore]
    public int[]? LineColor
    {
        get => Props.TryGetValue("getLineColor", out var value) && value is int[] arr ? arr : null;
        set { if (value != null) Props["getLineColor"] = value; }
    }
}
