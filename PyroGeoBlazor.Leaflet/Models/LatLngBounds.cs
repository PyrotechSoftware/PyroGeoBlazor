namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Threading.Tasks;

/// <summary>
/// A rectangular geographical area on a map.
/// <see href="https://leafletjs.com/reference.html#latlngbounds"/>
/// </summary>
/// <remarks>
/// Constructs a LatLngBounds instance.
/// </remarks>
/// <param name="northEast">The first corner defining the bounds.</param>
/// <param name="southWest">The second corner defining the bounds, diagonally opposite the first.</param>
public class LatLngBounds(LatLng northEast, LatLng southWest) : InteropObject
{
    public LatLng NorthEast { get; set; } = northEast;
    public LatLng SouthWest { get; set; } = southWest;

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder is null
            ? throw new System.InvalidOperationException("Cannot create LatLngBounds object. No JavaScript binding has been set up for this object.")
            : await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.latLngBounds", NorthEast.JSObjectReference, SouthWest.JSObjectReference);
    }
}
