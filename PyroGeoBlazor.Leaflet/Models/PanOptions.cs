namespace PyroGeoBlazor.Leaflet.Models;

public class PanOptions
{
    /// <summary>
    /// Duration of animated panning, in seconds.
    /// </summary>
    public double Duration { get; set; } = 0.25;

    /// <summary>
    /// The curvature factor of panning animation easing (third parameter of the Cubic Bezier curve).
    /// 1.0 means linear animation, and the smaller this number, the more bowed the curve.
    /// </summary>
    public double EaseLinearity { get; set; } = 0.25;

    /// <summary>
    /// If true, panning won't fire movestart event on start (used internally for panning inertia).
    /// </summary>
    public bool NoMoveStart { get; set; } = false;
}
