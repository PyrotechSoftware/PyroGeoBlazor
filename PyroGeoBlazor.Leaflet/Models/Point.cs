namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Threading.Tasks;

/// <summary>
/// A point with x and y coordinates in pixels.
/// </summary>
/// <remarks>
/// Constructs a point
/// </remarks>
/// <param name="x">The x coordinate in pixels.</param>
/// <param name="y">The y corrdinate in pixels.</param>
/// <param name="round">Flag indicating whether coordinate values should be rounded.</param>
public class Point(double x, double y, bool round = false) : InteropObject
{
    /// <summary>
    /// The x coordinate in pixels.
    /// </summary>
    public double X { get; set; } = x;
    /// <summary>
    /// The y corrdinate in pixels.
    /// </summary>
    public double Y { get; set; } = y;
    /// <summary>
    /// Flag indicating whether coordinate values should be rounded.
    /// </summary>
    public bool Round { get; set; } = round;

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder is null
            ? throw new System.InvalidOperationException("Cannot create Point object. No JavaScript binding has been set up for this object.")
            : await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.point", X, Y, Round);
    }

    /// <inheritdoc/>
    public override string ToString()
    {
        return $"({X}, {Y})";
    }
}