namespace PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// The options used when creating a <see cref="Layer"/>.
/// </summary>
public class LayerOptions
{
    /// <summary>
    /// The string shown in the attribution control.
    /// May be required to show, e.g., tile provider's copyright message.
    /// </summary>
    public string? Attribution { get; set; }

    /// <summary>
    /// By default the layer will be added to the map's overlay pane.
    /// Overriding this option will cause the layer to be placed on another pane by default.
    /// </summary>
    public string Pane { get; set; } = "overlayPane";
}
