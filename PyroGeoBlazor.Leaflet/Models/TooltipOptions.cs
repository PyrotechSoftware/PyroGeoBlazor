namespace PyroGeoBlazor.Leaflet.Models;

public class TooltipOptions : DivOverlayOptions
{
    /// <summary>
    /// Map pane where the tooltip will be added.
    /// </summary>
    public new string Pane { get; set; } = "tooltipPane";

    /// <summary>
    /// Optional offset of the tooltip position.
    /// </summary>
    public new Point Offset { get; set; } = new(0, 0);

    /// <summary>
    /// Direction where to open the tooltip.
    /// Possible values are right, left, top, bottom, center, auto.
    /// auto will dynamically switch between right and left according to the tooltip position on the map.
    /// </summary>
    public string Direction { get; set; } = "auto";

    /// <summary>
    /// Whether to open the tooltip permanently or only on mouseover.
    /// </summary>
    public bool Permanent { get; set; } = false;

    /// <summary>
    /// If true, the tooltip will follow the mouse instead of being fixed at the feature center.
    /// </summary>
    public bool Sticky { get; set; } = false;

    /// <summary>
    /// Tooltip container opacity.
    /// </summary>
    public double Opacity { get; set; } = 0.9;

    /// <summary>
    /// If false, then tooltip events will not be fired.
    /// </summary>
    public bool EnableEvents { get; set; } = true;
}
