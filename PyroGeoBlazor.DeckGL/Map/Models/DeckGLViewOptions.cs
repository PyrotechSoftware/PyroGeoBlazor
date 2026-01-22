namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Represents the camera view state for a deck.gl visualization.
/// <see href="https://deck.gl/docs/api-reference/core/deck#initialviewstate"/>
/// </summary>
public class ViewState
{
    /// <summary>
    /// Longitude of the view center
    /// </summary>
    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }

    /// <summary>
    /// Latitude of the view center
    /// </summary>
    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }

    /// <summary>
    /// Zoom level (0-20)
    /// </summary>
    [JsonPropertyName("zoom")]
    public double Zoom { get; set; }

    /// <summary>
    /// Camera pitch in degrees (0-90)
    /// </summary>
    [JsonPropertyName("pitch")]
    public double? Pitch { get; set; }

    /// <summary>
    /// Camera bearing in degrees (0-360)
    /// </summary>
    [JsonPropertyName("bearing")]
    public double? Bearing { get; set; }

    /// <summary>
    /// Minimum zoom level
    /// </summary>
    [JsonPropertyName("minZoom")]
    public double? MinZoom { get; set; }

    /// <summary>
    /// Maximum zoom level
    /// </summary>
    [JsonPropertyName("maxZoom")]
    public double? MaxZoom { get; set; }
}

/// <summary>
/// Configuration options for creating a DeckGL view.
/// </summary>
public class DeckGLViewOptions
{
    /// <summary>
    /// HTML container element ID where deck.gl will render
    /// </summary>
    [JsonPropertyName("containerId")]
    public string ContainerId { get; set; } = string.Empty;

    /// <summary>
    /// Initial view state (camera position)
    /// </summary>
    [JsonPropertyName("initialViewState")]
    public ViewState InitialViewState { get; set; } = new ViewState();

    /// <summary>
    /// Enable map controls (pan, zoom, rotate)
    /// </summary>
    [JsonPropertyName("controller")]
    public bool Controller { get; set; } = true;

    /// <summary>
    /// Enable tooltips
    /// </summary>
    [JsonPropertyName("enableTooltips")]
    public bool EnableTooltips { get; set; } = true;
}
