namespace PyroGeoBlazor.DeckGL.Components;

using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.DeckGL.Models;

/// <summary>
/// A scatterplot layer component for rendering point data in DeckGL.
/// <see href="https://deck.gl/docs/api-reference/layers/scatterplot-layer"/>
/// </summary>
public class ScatterplotLayer : DeckGLLayer
{
    /// <summary>
    /// URL to fetch point data from
    /// </summary>
    [Parameter]
    public string? DataUrl { get; set; }

    /// <summary>
    /// Inline point data (alternative to DataUrl)
    /// </summary>
    [Parameter]
    public object? Data { get; set; }

    /// <summary>
    /// Fill color as RGBA array [r, g, b, a] (0-255)
    /// </summary>
    [Parameter]
    public int[]? FillColor { get; set; }

    /// <summary>
    /// Line color as RGBA array [r, g, b, a] (0-255)
    /// </summary>
    [Parameter]
    public int[]? LineColor { get; set; }

    /// <summary>
    /// Point radius in meters (for geospatial coordinates) or pixels
    /// </summary>
    [Parameter]
    public double Radius { get; set; } = 10.0;

    /// <summary>
    /// Minimum radius in pixels
    /// </summary>
    [Parameter]
    public double RadiusMinPixels { get; set; } = 1.0;

    /// <summary>
    /// Maximum radius in pixels
    /// </summary>
    [Parameter]
    public double RadiusMaxPixels { get; set; } = double.MaxValue;

    /// <summary>
    /// Radius scale multiplier
    /// </summary>
    [Parameter]
    public double RadiusScale { get; set; } = 1.0;

    /// <summary>
    /// Whether radius is in pixels (true) or meters (false)
    /// </summary>
    [Parameter]
    public bool RadiusUnits { get; set; }

    /// <summary>
    /// Line width in pixels
    /// </summary>
    [Parameter]
    public double LineWidth { get; set; } = 1.0;

    /// <summary>
    /// Whether to draw strokes (outlines) for points
    /// </summary>
    [Parameter]
    public bool Stroked { get; set; }

    /// <summary>
    /// Whether to fill points
    /// </summary>
    [Parameter]
    public bool Filled { get; set; } = true;

    /// <summary>
    /// Whether to render as billboards (always facing camera)
    /// </summary>
    [Parameter]
    public bool Billboard { get; set; } = true;

    /// <summary>
    /// Anti-aliasing quality
    /// </summary>
    [Parameter]
    public bool Antialiasing { get; set; } = true;

    protected override LayerConfig CreateLayerConfig()
    {
        var config = new ScatterplotLayerConfig
        {
            DataUrl = DataUrl,
            Data = Data,
            FillColor = FillColor,
            LineColor = LineColor,
            RadiusMinPixels = RadiusMinPixels,
            RadiusMaxPixels = RadiusMaxPixels,
            RadiusScale = RadiusScale,
            Stroked = Stroked,
            Filled = Filled
        };

        // Set additional properties via Props
        if (Radius != 10.0)
        {
            config.Props["radius"] = Radius;
        }
        if (RadiusUnits)
        {
            config.Props["radiusUnits"] = "pixels";
        }
        if (LineWidth != 1.0)
        {
            config.Props["lineWidth"] = LineWidth;
        }
        if (!Billboard)
        {
            config.Props["billboard"] = false;
        }
        if (!Antialiasing)
        {
            config.Props["antialiasing"] = false;
        }

        return config;
    }
}
