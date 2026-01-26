namespace PyroGeoBlazor.DeckGL.Components;

using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.DeckGL.Models;

/// <summary>
/// A tile layer component for rendering raster tiles (like basemaps) in DeckGL.
/// <see href="https://deck.gl/docs/api-reference/geo-layers/tile-layer"/>
/// </summary>
public class TileLayer : DeckGLLayer
{
    /// <summary>
    /// URL template for tiles. Use {x}, {y}, and {z} as placeholders.
    /// Example: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    /// </summary>
    [Parameter]
    public string? TileUrl { get; set; }

    /// <summary>
    /// Minimum zoom level for tiles
    /// </summary>
    [Parameter]
    public int TileMinZoom { get; set; } = 0;

    /// <summary>
    /// Maximum zoom level for tiles
    /// </summary>
    [Parameter]
    public int TileMaxZoom { get; set; } = 19;

    /// <summary>
    /// Tile size in pixels
    /// </summary>
    [Parameter]
    public int TileSize { get; set; } = 256;

    /// <summary>
    /// Whether to render tiles with smooth interpolation
    /// </summary>
    [Parameter]
    public bool RefinementStrategy { get; set; }

    protected override LayerConfig CreateLayerConfig()
    {
        var config = new TileLayerConfig
        {
            TileUrl = TileUrl,
            MinZoom = TileMinZoom,
            MaxZoom = TileMaxZoom,
            TileSize = TileSize
        };

        // Set refinement strategy if needed
        if (RefinementStrategy)
        {
            config.Props["refinementStrategy"] = "best-available";
        }

        return config;
    }

    /// <summary>
    /// Creates a Carto Light basemap tile layer
    /// </summary>
    /// <param name="id">Layer ID</param>
    /// <returns>A configured TileLayer instance</returns>
    public static TileLayer CartoLight(string id = "carto-light")
    {
        return new TileLayer
        {
            Id = id,
            TileUrl = "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            Pickable = false
        };
    }

    /// <summary>
    /// Creates a Carto Dark basemap tile layer
    /// </summary>
    /// <param name="id">Layer ID</param>
    /// <returns>A configured TileLayer instance</returns>
    public static TileLayer CartoDark(string id = "carto-dark")
    {
        return new TileLayer
        {
            Id = id,
            TileUrl = "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            Pickable = false
        };
    }

    /// <summary>
    /// Creates an OpenStreetMap basemap tile layer
    /// </summary>
    /// <param name="id">Layer ID</param>
    /// <returns>A configured TileLayer instance</returns>
    public static TileLayer OpenStreetMap(string id = "osm")
    {
        return new TileLayer
        {
            Id = id,
            TileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            Pickable = false
        };
    }
}
