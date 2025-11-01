namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Threading.Tasks;

/// <summary>
/// A rectangular geographical area on a map.
/// <see href="https://leafletjs.com/reference-1.7.1.html#latlngbounds"/>
/// </summary>
/// <remarks>
/// Constructs a LatLngBounds instance.
/// </remarks>
/// <param name="corner1">The first corner defining the bounds.</param>
/// <param name="corner2">The second corner defining the bounds, diagonally opposite the first.</param>
public class LatLngBounds(LatLng corner1, LatLng corner2) : InteropObject
{

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder is null
            ? throw new System.InvalidOperationException("Cannot create LatLngBounds object. No JavaScript binding has been set up for this object.")
            : await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.latLngBounds", corner1.JSObjectReference, corner2.JSObjectReference);
    }
}