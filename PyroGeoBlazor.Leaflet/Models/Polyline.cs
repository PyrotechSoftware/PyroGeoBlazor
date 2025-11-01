namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

/// <summary>
/// A vector line overlay <see cref="Layer"/>.
/// <see href="https://leafletjs.com/reference-1.7.1.html#polyline"/>
/// </summary>
/// <remarks>
/// Constructs a Polyline.
/// </remarks>
/// <param name="latLngs">An array of points defining the shape.</param>
/// <param name="options">The <see cref="PolylineOptions"/> used to define the polyline.</param>
public class Polyline(IEnumerable<LatLng> latLngs, PolylineOptions options) : Path
{
    /// <summary>
    /// An array of points defining the shape.
    /// </summary>
    [JsonIgnore] public IEnumerable<LatLng> LatLngs { get; } = latLngs;

    /// <summary>
    /// The <see cref="PolylineOptions"/> used to define the Polyline.
    /// </summary>
    [JsonIgnore] public PolylineOptions Options { get; } = options;

    /// <inheritdoc/>
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder is null
            ? throw new System.InvalidOperationException("Cannot create Polyline object. No JavaScript binding has been set up for this object.")
            : await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.polyline", LatLngs.ToArray(), Options);
    }

    #region Methods

    /// <summary>
    /// Adds a point to the Polyline
    /// </summary>
    /// <param name="latLng">The point to add to the Polyline.</param>
    /// <returns>The Polyline.</returns>
    public async Task<Polyline> AddLatLng(LatLng latLng)
    {
        GuardAgainstNullBinding("Cannot add LatLng. No JavaScript binding has been set up.");
        var module = await JSBinder!.GetLeafletMapModule();
        await module.InvokeVoidAsync("LeafletMap.Polyline.addLatLng", JSObjectReference, latLng);
        return this;
    }

    /// <summary>
    /// Replaces all the points in the polyline with the given array of geographical points.
    /// </summary>
    /// <param name="latLngs">The given array of geographical points.</param>
    /// <returns>The Polyline.</returns>
    public async Task<Polyline> SetLatLngs(IEnumerable<LatLng> latLngs)
    {
        GuardAgainstNullBinding("Cannot set LatLngs. No JavaScript binding has been set up.");
        var module = await JSBinder!.GetLeafletMapModule();
        await module.InvokeVoidAsync("LeafletMap.Polyline.setLatLngs", JSObjectReference, latLngs.ToArray());
        return this;
    }

    /// <summary>
    /// Returns the point closest to the provided point on the Polyline.
    /// </summary>
    /// <param name="point">The provided <see cref="Point"/>.</param>
    /// <returns>The closest <see cref="Point"/>.</returns>
    public async Task<Point> ClosestLayerPoint(Point point)
    {
        GuardAgainstNullBinding("Cannot get closest layer point. No JavaScript binding has been set up.");
        var module = await JSBinder!.GetLeafletMapModule();
        return await module.InvokeAsync<Point>("LeafletMap.Polyline.closestLayerPoint", JSObjectReference, point);
    }

    /// <summary>
    /// Returns true if the Polyline has no LatLngs.
    /// </summary>
    public async Task<bool> IsEmpty()
    {
        GuardAgainstNullBinding("Cannot determine if polyline is empty. No JavaScript binding has been set up.");
        return await JSObjectReference!.InvokeAsync<bool>("isEmpty");
    }

    /// <summary>
    /// Returns the LatLngBounds of the path.
    /// </summary>
    /// <returns>The <see cref="LatLngBounds"/>.</returns>
    public async Task<LatLngBounds> GetBounds()
    {
        GuardAgainstNullBinding("Cannot get bounds of polyline. No JavaScript binding has been set up.");
        return await JSObjectReference!.InvokeAsync<LatLngBounds>("getBounds");
    }

    /// <summary>
    /// Coordinates values are rounded with formatNum function with given precision.
    /// Returns a GeoJSON representation of the polyline (as a GeoJSON LineString or MultiLineString Feature).
    /// </summary>
    /// <param name="precision">The precision to use when rounding.</param>
    /// <param name="skipPrecisionProcessing">If true, then precision processing is skipped.</param>
    /// <returns>A GeoJSON String</returns>
    public virtual async Task<object> ToGeoJson(int? precision, bool skipPrecisionProcessing)
    {
        GuardAgainstNullBinding("Cannot export GeoJSON. No JavaScript binding has been set up.");
        return !skipPrecisionProcessing
            ? await JSObjectReference!.InvokeAsync<object>("toGeoJSON", precision)
            : await JSObjectReference!.InvokeAsync<object>("toGeoJSON", false);
    }

    /// <summary>
    /// Returns the center(centroid) of the polyline.
    /// </summary>
    /// <returns>The <see cref="LatLng"/> of the Center of the Polyline.</returns>
    public virtual async Task<LatLng> GetCenter()
    {
        GuardAgainstNullBinding("Cannot get center of polyline. No JavaScript binding has been set up.");
        return await JSObjectReference!.InvokeAsync<LatLng>("getCenter");
    }

    #endregion

}