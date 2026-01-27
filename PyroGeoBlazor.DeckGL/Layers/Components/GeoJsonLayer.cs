namespace PyroGeoBlazor.DeckGL.Components;

using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.DeckGL.Models;

/// <summary>
/// A GeoJSON layer component for rendering GeoJSON data in DeckGL.
/// <see href="https://deck.gl/docs/api-reference/layers/geojson-layer"/>
/// </summary>
public class GeoJsonLayer : DeckGLLayer
{
    /// <summary>
    /// URL to fetch GeoJSON data from
    /// </summary>
    [Parameter]
    public string? DataUrl { get; set; }

    /// <summary>
    /// Inline GeoJSON data (alternative to DataUrl)
    /// </summary>
    [Parameter]
    public object? Data { get; set; }

    /// <summary>
    /// Whether to draw strokes (outlines) for polygons
    /// </summary>
    [Parameter]
    public bool Stroked { get; set; } = true;

    /// <summary>
    /// Whether to fill polygons
    /// </summary>
    [Parameter]
    public bool Filled { get; set; } = true;

    /// <summary>
    /// Whether to extrude polygons (3D)
    /// </summary>
    [Parameter]
    public bool Extruded { get; set; }

    /// <summary>
    /// Whether to draw points as circles
    /// </summary>
    [Parameter]
    public bool PointsAsCircles { get; set; } = true;

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
    /// Line width scale multiplier
    /// </summary>
    [Parameter]
    public double LineWidthScale { get; set; } = 1.0;

    /// <summary>
    /// Minimum line width in pixels
    /// </summary>
    [Parameter]
    public double LineWidthMinPixels { get; set; } = 1.0;

    /// <summary>
    /// Maximum line width in pixels
    /// </summary>
    [Parameter]
    public double LineWidthMaxPixels { get; set; } = double.MaxValue;

    /// <summary>
    /// Point radius in pixels
    /// </summary>
    [Parameter]
    public double PointRadiusMinPixels { get; set; } = 2.0;

    /// <summary>
    /// Elevation scale for extruded polygons
    /// </summary>
    [Parameter]
    public double ElevationScale { get; set; } = 1.0;

    /// <summary>
    /// Enable viewport culling to only fetch data within current viewport
    /// </summary>
    [Parameter]
    public bool EnableViewportCulling { get; set; }

    /// <summary>
    /// Property name to use for label text.
    /// Labels will only display if this property exists and has a value.
    /// Example: "name", "label", "title"
    /// </summary>
    [Parameter]
    public string? LabelProperty { get; set; }

    /// <summary>
    /// Whether labels are enabled for this layer.
    /// Can be changed at runtime through the LayerContentsControl.
    /// Defaults to false.
    /// </summary>
    [Parameter]
    public bool LabelsEnabled { get; set; } = false;

    /// <summary>
    /// Minimum zoom level for label visibility.
    /// Labels won't appear when zoomed out below this level.
    /// Defaults to 12 (neighborhood level).
    /// </summary>
    [Parameter]
    public double LabelMinZoom { get; set; } = 12;

    /// <summary>
    /// Label font size in pixels.
    /// Defaults to 12.
    /// </summary>
    [Parameter]
    public int LabelFontSize { get; set; } = 12;

    /// <summary>
    /// Label text color in hex format (e.g., "#000000" for black).
    /// Defaults to black.
    /// </summary>
    [Parameter]
    public string LabelTextColor { get; set; } = "#000000";

    /// <summary>
    /// Label background color in hex format with optional alpha (e.g., "#FFFFFFCC").
    /// Provides better readability by rendering behind text.
    /// Defaults to semi-transparent white.
    /// </summary>
    [Parameter]
    public string LabelBackgroundColor { get; set; } = "#FFFFFFCC";

    protected override LayerConfig CreateLayerConfig()
    {
        var config = new GeoJsonLayerConfig
        {
            DataUrl = DataUrl,
            Data = Data,
            Stroked = Stroked,
            Filled = Filled,
            Extruded = Extruded,
            LineWidthScale = LineWidthScale,
            LineWidthMinPixels = LineWidthMinPixels,
            FillColor = FillColor,
            LineColor = LineColor,
            EnableViewportCulling = EnableViewportCulling
        };

        // Configure labels if property specified
        if (!string.IsNullOrEmpty(LabelProperty))
        {
            config.LabelConfig = new LabelConfig
            {
                TextProperty = LabelProperty,
                Enabled = LabelsEnabled,
                MinZoom = LabelMinZoom,
                FontSize = LabelFontSize,
                TextColor = LabelTextColor,
                BackgroundColor = LabelBackgroundColor
            };
        }

        // Set additional properties via Props if needed
        if (PointsAsCircles)
        {
            config.Props["pointsAsCircles"] = PointsAsCircles;
        }
        if (LineWidthMaxPixels < double.MaxValue)
        {
            config.Props["lineWidthMaxPixels"] = LineWidthMaxPixels;
        }
        if (PointRadiusMinPixels > 0)
        {
            config.Props["pointRadiusMinPixels"] = PointRadiusMinPixels;
        }
        if (ElevationScale != 1.0)
        {
            config.Props["elevationScale"] = ElevationScale;
        }

        return config;
    }
}
