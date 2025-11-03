namespace PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Represents configuration options for a popup, including the map pane where the popup will be displayed.
/// </summary>
/// <remarks>The <see cref="Pane"/> property specifies the name of the map pane where the popup will be added.  By
/// default, the popup is added to the "popupPane".</remarks>
public class PopupOptions : DivOverlayOptions
{
    /// <summary>
    /// Map pane where the popup will be added.
    /// </summary>
    public new string Pane { get; set; } = "popupPane";

    /// <summary>
    /// The offset of the popup position.
    /// </summary>
    public new Point? Offset { get; set; } = new Point(0, 7);

    /// <summary>
    /// Max width of the popup, in pixels.
    /// </summary>
    public int MaxWidth { get; set; } = 300;

    /// <summary>
    /// Min width of the popup, in pixels.
    /// </summary>
    public int MinWidth { get; set; } = 50;

    /// <summary>
    /// If set, creates a scrollable container of the given height inside a popup if its content exceeds it.
    /// The scrollable container can be styled using the leaflet-popup-scrolled CSS class selector.
    /// </summary>
    public int? MaxHeight { get; set; }

    /// <summary>
    /// Set it to false if you don't want the map to do panning animation to fit the opened popup.
    /// </summary>
    public bool AutoPan { get; set; } = true;

    /// <summary>
    /// The margin between the popup and the top left corner of the map view after autopanning was performed.
    /// </summary>
    public Point? AutoPanPaddingTopLeft { get; set; }

    /// <summary>
    /// The margin between the popup and the bottom right corner of the map view after autopanning was performed.
    /// </summary>
    public Point? AutoPanPaddingBottomRight { get; set; }

    /// <summary>
    /// Equivalent of setting both top left and bottom right autopan padding to the same value.
    /// </summary>
    public Point AutoPanPadding { get; set; } = new(5, 5);

    /// <summary>
    /// Set it to true if you want to prevent users from panning the popup off of the screen while it is open.
    /// </summary>
    public bool KeepInView { get; set; }

    /// <summary>
    /// Controls the presence of a close button in the popup.
    /// </summary>
    public bool CloseButton { get; set; } = true;

    /// <summary>
    /// Set it to false if you want to override the default behavior of the popup closing when another popup is opened.
    /// </summary>
    public bool AutoClose { get; set; } = true;

    /// <summary>
    /// Set it to false if you want to override the default behavior of the ESC key for closing of the popup.
    /// </summary>
    public bool CloseOnEscapeKey { get; set; } = true;

    /// <summary>
    /// Set it if you want to override the default behavior of the popup closing when user clicks on the map.
    /// Defaults to the map's closePopupOnClick option.
    /// </summary>
    public bool? CloseOnClick { get; set; }

    /// <summary>
    /// A custom CSS class name to assign to the popup.
    /// </summary>
    public new string ClassName { get; set; } = string.Empty;
}
