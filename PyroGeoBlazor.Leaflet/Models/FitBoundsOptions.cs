namespace PyroGeoBlazor.Leaflet.Models;

public class FitBoundsOptions : ZoomPanOptions
{
    /// <summary>
    /// The maximum possible zoom to use.
    /// </summary>
    public int? MaxZoom { get; set; }

    /// <summary>
    /// Sets the amount of padding in the top left corner of a map container that shouldn't
    /// be accounted for when setting the view to fit bounds.
    /// Useful if you have some control overlays on the map like a sidebar
    /// and you don't want them to obscure objects you're zooming to.
    /// </summary>
    public Point? PaddingTopLeft { get; set; }

    /// <summary>
    /// Sets the amount of padding in the bottom right corner of a map container
    /// that shouldn't be accounted for when setting the view to fit bounds.
    /// Useful if you have some control overlays on the map like a sidebar
    /// and you don't want them to obscure objects you're zooming to.
    /// </summary>
    public Point? PaddingBottomRight { get; set; }

    /// <summary>
    /// Equivalent of setting both top left and bottom right padding to the same value.
    /// </summary>
    public Point? Padding { get; set; }
}
