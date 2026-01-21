namespace PyroGeoBlazor.DeckGL.Models;

/// <summary>
/// Defines the interaction mode for the map
/// </summary>
public enum MapMode
{
    /// <summary>
    /// Explore mode - pan and zoom the map (default)
    /// </summary>
    Explore,

    /// <summary>
    /// Select individual features by clicking
    /// </summary>
    SelectFeature,

    /// <summary>
    /// Select features by drawing a polygon
    /// </summary>
    SelectByPolygon
}
