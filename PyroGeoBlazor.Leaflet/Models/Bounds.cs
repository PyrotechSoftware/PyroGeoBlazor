namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Threading.Tasks;

/// <summary>
/// A rectangular area in pixel coordinates.
/// </summary>
/// <remarks>
/// Constructs a Bounds instance.
/// </remarks>
/// <param name="min">The top left corner of the bounds.</param>
/// <param name="max">The bottom right corner of the bounds.</param>
public class Bounds(Point min, Point max) : InteropObject
{
    /// <summary>
    /// The top left corner of the bounds.
    /// </summary>
    public Point Min { get; set; } = min;
    /// <summary>
    /// The bottom right corner of the bounds.
    /// </summary>
    public Point Max { get; set; } = max;

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        if (JSBinder is null)
        {
            throw new System.InvalidOperationException("Cannot create Bounds object. No JavaScript binding has been set up for this object.");
        }

        if (Min.JSBinder is null)
        {
            await Min.BindJsObjectReference(JSBinder);
        }
        Min.GuardAgainstNullBinding("Cannot create Bounds object. No JavaScript binding has been set up for the Min property.");
        if (Max.JSBinder is null)
        {
            await Max.BindJsObjectReference(JSBinder);
        }
        Max.GuardAgainstNullBinding("Cannot create Bounds object. No JavaScript binding has been set up for the Max property.");
        return await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.bounds", Min.JSObjectReference, Max.JSObjectReference);
    }

    /// <inheritsdoc/>
    public override string ToString()
    {
        return $"[{Min}, {Max}]";
    }
}