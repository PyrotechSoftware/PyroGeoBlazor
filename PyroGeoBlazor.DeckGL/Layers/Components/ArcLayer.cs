namespace PyroGeoBlazor.DeckGL.Components;

using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.DeckGL.Models;

/// <summary>
/// An arc layer component for rendering arcs/lines between two points in DeckGL.
/// Useful for showing connections, flows, or routes.
/// <see href="https://deck.gl/docs/api-reference/layers/arc-layer"/>
/// </summary>
public class ArcLayer : DeckGLLayer
{
    /// <summary>
    /// URL to fetch arc data from
    /// </summary>
    [Parameter]
    public string? DataUrl { get; set; }

    /// <summary>
    /// Inline arc data (alternative to DataUrl)
    /// </summary>
    [Parameter]
    public object? Data { get; set; }

    /// <summary>
    /// Source position accessor (property name or function)
    /// </summary>
    [Parameter]
    public string? GetSourcePosition { get; set; }

    /// <summary>
    /// Target position accessor (property name or function)
    /// </summary>
    [Parameter]
    public string? GetTargetPosition { get; set; }

    /// <summary>
    /// Source color as RGBA array [r, g, b, a] (0-255)
    /// </summary>
    [Parameter]
    public int[]? SourceColor { get; set; }

    /// <summary>
    /// Target color as RGBA array [r, g, b, a] (0-255)
    /// </summary>
    [Parameter]
    public int[]? TargetColor { get; set; }

    /// <summary>
    /// Arc width in pixels
    /// </summary>
    [Parameter]
    public double Width { get; set; } = 1.0;

    /// <summary>
    /// Minimum width in pixels
    /// </summary>
    [Parameter]
    public double WidthMinPixels { get; set; } = 1.0;

    /// <summary>
    /// Maximum width in pixels
    /// </summary>
    [Parameter]
    public double WidthMaxPixels { get; set; } = double.MaxValue;

    /// <summary>
    /// Width scale multiplier
    /// </summary>
    [Parameter]
    public double WidthScale { get; set; } = 1.0;

    /// <summary>
    /// Arc height multiplier (controls the "bend" of the arc)
    /// </summary>
    [Parameter]
    public double GreatCircle { get; set; }

    /// <summary>
    /// Number of segments to render the arc
    /// </summary>
    [Parameter]
    public int NumSegments { get; set; } = 50;

    protected override LayerConfig CreateLayerConfig()
    {
        var config = new ArcLayerConfig
        {
            DataUrl = DataUrl,
            Data = Data,
            SourceColor = SourceColor,
            TargetColor = TargetColor,
            Width = Width
        };

        // Set additional properties via Props
        if (!string.IsNullOrEmpty(GetSourcePosition))
        {
            config.Props["getSourcePosition"] = GetSourcePosition;
        }
        if (!string.IsNullOrEmpty(GetTargetPosition))
        {
            config.Props["getTargetPosition"] = GetTargetPosition;
        }
        if (WidthMinPixels != 1.0)
        {
            config.Props["widthMinPixels"] = WidthMinPixels;
        }
        if (WidthMaxPixels < double.MaxValue)
        {
            config.Props["widthMaxPixels"] = WidthMaxPixels;
        }
        if (WidthScale != 1.0)
        {
            config.Props["widthScale"] = WidthScale;
        }
        if (GreatCircle != 0)
        {
            config.Props["greatCircle"] = GreatCircle;
        }
        if (NumSegments != 50)
        {
            config.Props["numSegments"] = NumSegments;
        }

        return config;
    }
}
