namespace PyroGeoBlazor.DeckGL.Components;

using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.DeckGL.Models;

/// <summary>
/// Displays a status bar showing the current map view state information.
/// Shows longitude, latitude, zoom, pitch, and bearing in a compact format.
/// Also displays a loading indicator when layers are being updated or data is being fetched.
/// When not loading, displays a refresh button to reload all layers.
/// </summary>
public partial class MapStatusBar : ComponentBase
{
    /// <summary>
    /// The current view state to display in the status bar.
    /// </summary>
    [Parameter]
    public ViewState? CurrentViewState { get; set; }

    /// <summary>
    /// Optional custom CSS class to apply to the status bar.
    /// </summary>
    [Parameter]
    public string? CssClass { get; set; }

    /// <summary>
    /// Height of the status bar in pixels. Default is 35px.
    /// </summary>
    [Parameter]
    public int Height { get; set; } = 35;

    /// <summary>
    /// Indicates whether layers are currently being updated or data is being fetched.
    /// When true, displays a loading indicator on the right side of the status bar.
    /// </summary>
    [Parameter]
    public bool IsLoading { get; set; }

    /// <summary>
    /// Callback invoked when the refresh button is clicked.
    /// </summary>
    [Parameter]
    public EventCallback OnRefreshClicked { get; set; }
}
