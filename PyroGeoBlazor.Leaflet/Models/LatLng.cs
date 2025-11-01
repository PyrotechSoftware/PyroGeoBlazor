namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Threading.Tasks;

/// <summary>
/// A point with a latitude and longitude.
/// <see href="https://leafletjs.com/reference-1.7.1.html#latlng"/>
/// </summary>
/// <remarks>
/// Constructs a LatLng
/// </remarks>
/// <param name="lat">Latitude in degrees.</param>
/// <param name="lng">Longitude in degrees.</param>
public class LatLng(double lat, double lng) : InteropObject
{
    /// <summary>
    /// Latitude in degrees.
    /// </summary>
    public double Lat { get; set; } = lat;
    /// <summary>
    /// Longitude in degrees.
    /// </summary>
    public double Lng { get; set; } = lng;

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder is null
            ? throw new System.InvalidOperationException("Cannot create LatLng object. No JavaScript binding has been set up for this object.")
            : await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.latLng", Lat, Lng);
    }

    /// <inheritdoc/>
    public override string ToString()
    {
        return $"({Lat}, {Lng})";
    }
}
