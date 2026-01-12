namespace PyroGeoBlazor.Leaflet.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Specifies the renderer type for vector tile layers.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum VectorTileRendererType
{
    /// <summary>
    /// Use Canvas-based tile renderer (L.Canvas.Tile).
    /// </summary>
    Canvas,

    /// <summary>
    /// Use SVG-based tile renderer (L.SVG.Tile).
    /// </summary>
    SVG
}
