namespace PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Configuration options for the editing control.
/// </summary>
public class EditingControlOptions
{
    /// <summary>
    /// Gets or sets the position of the editing control on the map.
    /// Default is "bottom-center".
    /// </summary>
    public string Position { get; set; } = "bottom-center";

    /// <summary>
    /// Gets or sets additional CSS classes to apply to the control.
    /// </summary>
    public string? CssClass { get; set; }

    /// <summary>
    /// Gets or sets custom inline styles for the control.
    /// </summary>
    public string? Style { get; set; }

    /// <summary>
    /// Gets or sets whether to automatically show the control when editing starts.
    /// Default is true.
    /// </summary>
    public bool AutoShow { get; set; } = true;

    /// <summary>
    /// Gets or sets whether to automatically hide the control when editing stops.
    /// Default is true.
    /// </summary>
    public bool AutoHide { get; set; } = true;

    /// <summary>
    /// SVG icon for the polygon drawing button.
    /// </summary>
    public string PolygonIcon { get; set; } = DefaultIcons.Polygon;

    /// <summary>
    /// SVG icon for the line drawing button.
    /// </summary>
    public string LineIcon { get; set; } = DefaultIcons.Line;

    /// <summary>
    /// SVG icon for the edit button.
    /// </summary>
    public string EditIcon { get; set; } = DefaultIcons.Edit;

    /// <summary>
    /// SVG icon for the delete button.
    /// </summary>
    public string DeleteIcon { get; set; } = DefaultIcons.Delete;

    /// <summary>
    /// SVG icon for the confirm button.
    /// </summary>
    public string ConfirmIcon { get; set; } = DefaultIcons.Confirm;

    /// <summary>
    /// SVG icon for the cancel button.
    /// </summary>
    public string CancelIcon { get; set; } = DefaultIcons.Cancel;

    /// <summary>
    /// Tooltip text for the polygon button.
    /// </summary>
    public string PolygonTooltip { get; set; } = "Draw new polygon";

    /// <summary>
    /// Tooltip text for the line button.
    /// </summary>
    public string LineTooltip { get; set; } = "Draw new line";

    /// <summary>
    /// Tooltip text for the edit button.
    /// </summary>
    public string EditTooltip { get; set; } = "Edit selected features";

    /// <summary>
    /// Tooltip text for the delete button.
    /// </summary>
    public string DeleteTooltip { get; set; } = "Delete selected features";

    /// <summary>
    /// Tooltip text for the confirm button.
    /// </summary>
    public string ConfirmTooltip { get; set; } = "Confirm drawing";

    /// <summary>
    /// Tooltip text for the cancel button.
    /// </summary>
    public string CancelTooltip { get; set; } = "Cancel drawing";

    /// <summary>
    /// Button size in pixels (width and height).
    /// </summary>
    public int ButtonSize { get; set; } = 40;

    /// <summary>
    /// Icon size in pixels (width and height).
    /// </summary>
    public int IconSize { get; set; } = 24;
}
