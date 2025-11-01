namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System;
using System.Threading.Tasks;

/// <summary>
/// A circle of a fixed size with radius specified in pixels.
/// </summary>
public class CircleMarker(LatLng latLng, CircleMarkerOptions? options) : Path
{
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder == null
            ? throw new InvalidOperationException("JSBinder is not set.")
            : await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.CircleMarker", latLng, options);
    }

    #region Events

    #endregion

    #region Methods

    /// <summary>
    /// Coordinates values are rounded with formatNum function with given precision.
    /// Returns a GeoJSON representation of the circle marker (as a GeoJSON Point Feature).
    /// </summary>
    /// <param name="numberOfDecimalPlaces">Number of decimal places.</param>
    /// <param name="skipPrecisionProcessing">Skip precision processing</param>
    /// <returns>The GeoJSON</returns>
    public async Task<object> ToGeoJson(int numberOfDecimalPlaces, bool skipPrecisionProcessing)
    {
        GuardAgainstNullBinding("Cannot get GeoJSON from CircleMarker because it is not bound to a JS object.");

        return skipPrecisionProcessing
            ? await JSObjectReference!.InvokeAsync<object>("toGeoJSON", false)
            : await JSObjectReference!.InvokeAsync<object>("toGeoJSON", numberOfDecimalPlaces);
    }

    /// <summary>
    /// Returns the current geographical position of the circle marker
    /// </summary>
    /// <returns>The <see cref="LatLng"/>.</returns>
    public async Task<LatLng> GetLatLng()
    {
        GuardAgainstNullBinding("Cannot get LatLng from CircleMarker because it is not bound to a JS object.");
        return await JSObjectReference!.InvokeAsync<LatLng>("getLatLng");
    }

    /// <summary>
    /// Returns the current radius of the circle
    /// </summary>
    public async Task<double> GetRadius()
    {
        GuardAgainstNullBinding("Cannot get radius from CircleMarker because it is not bound to a JS object.");
        return await JSObjectReference!.InvokeAsync<double>("getRadius");
    }

    /// <summary>
    /// Sets the position of a circle marker to a new location.
    /// </summary>
    /// <param name="latLng">The <see cref="LatLng"/> of the new location.</param>
    /// <returns>The CircleMarker.</returns>
    public async Task<CircleMarker> SetLatLng(LatLng latLng)
    {
        var module = await JSBinder!.GetLeafletMapModule();
        await module!.InvokeVoidAsync("LeafletMap.CircleMarker.setLatLng", latLng);
        return this;
    }

    /// <summary>
    /// Sets the radius of the circle marker.
    /// </summary>
    /// <remarks>This method updates the radius of the circle marker on the map asynchronously.</remarks>
    /// <param name="radius">The new radius of the circle marker, specified as a double. Must be a non-negative value.</param>
    /// <returns>The current <see cref="CircleMarker"/> instance, allowing for method chaining.</returns>
    public async Task<CircleMarker> SetRadius(double radius)
    {
        var module = await JSBinder!.GetLeafletMapModule();
        await module!.InvokeVoidAsync("LeafletMap.CircleMarker.setRadius", radius);
        return this;
    }

    #endregion
}
