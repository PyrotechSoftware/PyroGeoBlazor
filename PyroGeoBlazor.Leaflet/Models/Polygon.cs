namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Collections.Generic;
using System.Threading.Tasks;

public class Polygon(IEnumerable<LatLng> latLngs, PolylineOptions options)
    : Polyline(latLngs, options)
{
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder is null
            ? throw new System.InvalidOperationException("Cannot create Polygon object. No JavaScript binding has been set up for this object.")
            : await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.polygon", LatLngs.ToArray(), Options);
    }

    /// <summary>
    /// Coordinates values are rounded with formatNum function with given precision.
    /// Returns a GeoJSON representation of the polygon (as a GeoJSON Polygon or MultiPolygon Feature).
    /// </summary>
    /// <param name="precision">The precision to use when rounding.</param>
    /// <param name="skipPrecisionProcessing">If true, then precision processing is skipped.</param>
    /// <returns>A GeoJSON String</returns>
    public override async Task<object> ToGeoJson(int? precision, bool skipPrecisionProcessing)
    {
        return JSObjectReference is null
            ? throw new System.InvalidOperationException("Cannot convert Polygon to GeoJSON. No JavaScript binding has been set up for this object.")
            : !skipPrecisionProcessing
            ? await JSObjectReference.InvokeAsync<object>("toGeoJSON", precision)
            : await JSObjectReference.InvokeAsync<object>("toGeoJSON", false);
    }

    /// <summary>
    /// Returns the center (centroid) of the Polygon.
    /// </summary>
    /// <returns>The <see cref="LatLng"/> of the center of the Polygon.</returns>
    public override async Task<LatLng> GetCenter()
    {
        return JSObjectReference is null
            ? throw new System.InvalidOperationException("Cannot get center of Polygon. No JavaScript binding has been set up for this object.")
            : await JSObjectReference.InvokeAsync<LatLng>("getCenter");
    }
}
