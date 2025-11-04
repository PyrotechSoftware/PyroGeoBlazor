namespace PyroGeoBlazor.Leaflet.Models;

public class ScaleControlOptions : ControlOptions
{
    /// <summary>
    /// Maximum width of the control in pixels.
    /// </summary>
    public int MaxWidth { get; set; } = 100;

    /// <summary>
    /// Whether to show the metric scale line (meters/kilometers).
    /// </summary>
    public bool Metric { get; set; } = true;

    /// <summary>
    /// Whether to show the imperial scale line (feet/miles).
    /// </summary>
    public bool Imperial { get; set; } = true;

    /// <summary>
    /// If true, the control is updated on 'moveend' event, otherwise it is always up to date (updated on 'move' event).
    /// </summary>
    public bool UpdateWhenIdle { get; set; } = false;
}
