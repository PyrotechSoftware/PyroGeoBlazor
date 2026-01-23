namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Configuration for a GeoJSON layer in deck.gl.
/// Renders GeoJSON data as points, lines, or polygons.
/// <see href="https://deck.gl/docs/api-reference/layers/geojson-layer"/>
/// </summary>
public class GeoJsonLayerConfig : LayerConfig
{
    /// <inheritdoc />
    [JsonPropertyName("type")]
    public override string Type => "GeoJsonLayer";

    /// <summary>
    /// Whether to draw stroked lines
    /// </summary>
    [JsonIgnore]
    public bool Stroked
    {
        get => !Props.ContainsKey("stroked") || Props["stroked"] is bool b && b;
        set => Props["stroked"] = value;
    }

    /// <summary>
    /// Whether to draw filled polygons.
    /// Automatically determined by FeatureStyle.FillOpacity: filled when FillOpacity > 0, not filled when FillOpacity = 0.
    /// </summary>
    [JsonIgnore]
    public bool Filled
    {
        get
        {
            // If explicitly set in Props, use that value
            if (Props.TryGetValue("filled", out var value) && value is bool b)
            {
                return b;
            }

            // Otherwise, determine from FeatureStyle.FillOpacity
            // Filled when FillOpacity > 0, not filled when FillOpacity = 0
            if (FeatureStyle?.FillOpacity != null)
            {
                return FeatureStyle.FillOpacity > 0.0;
            }

            // Default to true if no FeatureStyle is set
            return true;
        }
        set => Props["filled"] = value;
    }

    /// <summary>
    /// Whether to extrude polygons (3D)
    /// </summary>
    [JsonIgnore]
    public bool Extruded
    {
        get => Props.TryGetValue("extruded", out var value) && value is bool b && b;
        set => Props["extruded"] = value;
    }

    /// <summary>
    /// Type of points to draw ("circle" or "icon")
    /// </summary>
    [JsonIgnore]
    public string PointType
    {
        get => Props.TryGetValue("pointType", out var value) && value is string s ? s : "circle";
        set => Props["pointType"] = value;
    }

    /// <summary>
    /// Line width scale factor
    /// </summary>
    [JsonIgnore]
    public double? LineWidthScale
    {
        get => Props.TryGetValue("lineWidthScale", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["lineWidthScale"] = value.Value; }
    }

    /// <summary>
    /// Minimum line width in pixels
    /// </summary>
    [JsonIgnore]
    public double? LineWidthMinPixels
    {
        get => Props.TryGetValue("lineWidthMinPixels", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["lineWidthMinPixels"] = value.Value; }
    }

    /// <summary>
    /// Fill color as [R, G, B, A] (0-255)
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

    /// <summary>
    /// Point radius in meters
    /// </summary>
    [JsonIgnore]
    public double? PointRadius
    {
        get => Props.TryGetValue("getPointRadius", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["getPointRadius"] = value.Value; }
    }

    /// <summary>
    /// Elevation for extruded polygons in meters
    /// </summary>
    [JsonIgnore]
    public double? Elevation
    {
        get => Props.TryGetValue("getElevation", out var value) && value is double d ? d : null;
        set { if (value.HasValue) Props["getElevation"] = value.Value; }
    }
}
