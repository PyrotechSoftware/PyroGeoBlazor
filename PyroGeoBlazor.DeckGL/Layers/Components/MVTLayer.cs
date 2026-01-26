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

        return config;
    }
}
