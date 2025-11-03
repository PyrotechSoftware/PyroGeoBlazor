namespace PyroGeoBlazor.Leaflet.Models;

public class DivOverlayOptions : InteractiveLayerOptions
{
    /// <summary>
    /// If true, the popup/tooltip will listen to the mouse events.
    /// </summary>
    public new bool Interactive { get; set; }

    /// <summary>
    /// The offset of the overlay position.
    /// </summary>
    public Point Offset { get; set; } = new(0, 0);

    /// <summary>
    /// A custom CSS class name to assign to the overlay.
    /// </summary>
    public string ClassName { get; set; } = string.Empty;

    /// <summary>
    /// Map pane where the overlay will be added.
    /// </summary>
    public new string? Pane { get; set; }

    /// <summary>
    /// Sets the HTML content of the overlay while initializing.
    /// </summary>
    public string Content { get; set; } = string.Empty;
}
