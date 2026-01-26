namespace PyroGeoBlazor.DeckGL.Components;

using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.DeckGL.Models;

/// <summary>
/// An MVT (Mapbox Vector Tiles) layer component for rendering vector tile data in DeckGL.
/// <see href="https://deck.gl/docs/api-reference/geo-layers/mvt-layer"/>
/// </summary>
public class MVTLayer : DeckGLLayer
{
    /// <summary>
    /// URL template for MVT tiles. Use {x}, {y}, and {z} as placeholders.
    /// Example: "https://server.com/tiles/{z}/{x}/{y}.pbf"
    /// </summary>
    [Parameter]
    public string? TileUrl { get; set; }

    /// <summary>
    /// GeoServer URL (for use with FromGeoServer helper)
    /// </summary>
    [Parameter]
    public string? GeoServerUrl { get; set; }

    /// <summary>
    /// GeoServer workspace name
    /// </summary>
    [Parameter]
    public string? Workspace { get; set; }

    /// <summary>
    /// GeoServer layer name
    /// </summary>
    [Parameter]
    public string? LayerName { get; set; }

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
    /// Line width in pixels
    /// </summary>
    [Parameter]
    public double LineWidthMinPixels { get; set; } = 1.0;

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
    /// Minimum zoom level for tiles
    /// </summary>
    [Parameter]
    public int TileMinZoom { get; set; } = 0;

    /// <summary>
    /// Maximum zoom level for tiles
    /// </summary>
    [Parameter]
    public int TileMaxZoom { get; set; } = 14;

    /// <summary>
    /// Debounce timeout in milliseconds for tile loading indicators.
    /// After the last tile completes loading, the loading indicator will wait this long before disappearing.
    /// This prevents flickering when tiles load in quick succession.
    /// Larger layers with more tiles may need a longer timeout (e.g., 2000-3000ms).
    /// Defaults to 1000ms (1 second).
    /// </summary>
    [Parameter]
    public int TileLoadingDebounceMs { get; set; } = 1000;

    /// <summary>
    /// Property name to use for label text.
    /// Labels will only display if this property exists and has a value.
    /// Example: "PARCEL_ID", "NAME", "LABEL"
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
    /// For large MVT layers, set higher (e.g., 14) to prevent clutter.
    /// Defaults to 12.
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
    /// Provides better readability. Defaults to semi-transparent white.
    /// </summary>
    [Parameter]
    public string LabelBackgroundColor { get; set; } = "#FFFFFFCC";

    protected override LayerConfig CreateLayerConfig()
    {
        MVTLayerConfig config;

        // If GeoServer parameters are provided, use the FromGeoServer factory
        if (!string.IsNullOrEmpty(GeoServerUrl) && !string.IsNullOrEmpty(Workspace) && !string.IsNullOrEmpty(LayerName))
        {
            config = MVTLayerConfig.FromGeoServer(
                id: Id,
                geoserverUrl: GeoServerUrl,
                workspace: Workspace,
                layerName: LayerName
            );
        }
        else if (!string.IsNullOrEmpty(TileUrl))
        {
            config = new MVTLayerConfig
            {
                DataUrl = TileUrl,
                MinZoom = TileMinZoom,
                MaxZoom = TileMaxZoom
            };
        }
        else
        {
            throw new InvalidOperationException(
                "MVTLayer requires either TileUrl or all GeoServer parameters (GeoServerUrl, Workspace, LayerName)");
        }

        // Apply style properties
        if (FillColor != null)
        {
            config.FillColor = FillColor;
        }

        if (LineColor != null)
        {
            config.LineColor = LineColor;
        }

        config.LineWidthMinPixels = (int)LineWidthMinPixels;
        config.Stroked = Stroked;
        config.Filled = Filled;
        config.TileLoadingDebounceMs = TileLoadingDebounceMs;

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

        return config;
    }
}
