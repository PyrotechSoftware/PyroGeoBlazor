namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

/// <summary>
/// Base class for Coordinate Reference System used by the map.
/// <see href="https://leafletjs.com/reference.html#crs"/>
/// </summary>
public sealed class CrsRef : IAsyncDisposable
{
    private readonly IJSObjectReference _crs;    // JS object reference to the CRS

    internal CrsRef(IJSObjectReference crs)
    {
        _crs = crs;
    }

    #region Methods

    /// <summary>
    /// Projects geographical coordinates into pixel coordinates for a given zoom.
    /// </summary>
    /// <param name="latLng">The <see cref="LatLng"/>.</param>
    /// <param name="zoom">The zoom level.</param>
    /// <returns>The corresponding <see cref="Point"/>.</returns>
    public  ValueTask<Point> LatLngToPoint(LatLng latLng, int zoom)
        =>  _crs!.InvokeAsync<Point>($"latLngToPoint", latLng, zoom);

    /// <summary>
    /// The inverse of latLngToPoint. Projects pixel coordinates on a given zoom into geographical coordinates.
    /// </summary>
    /// <param name="point">The <see cref="Point"/>.</param>
    /// <param name="zoom">The zoom level.</param>
    /// <returns>The corresponding <see cref="LatLng"/>.</returns>
    public  ValueTask<LatLng> PointToLatLng(Point point, int zoom)
        =>  _crs!.InvokeAsync<LatLng>($"pointToLatLng", point, zoom);

    /// <summary>
    /// Projects geographical coordinates into coordinates in units accepted for this CRS
    /// (e.g. meters for EPSG:3857, for passing it to WMS services).
    /// </summary>
    /// <param name="latLng">The <see cref="LatLng"/></param>
    /// <returns>The corresponding <see cref="Point"/> representing the projected coordinates.</returns>
    public  ValueTask<Point> Project(LatLng latLng)
        =>  _crs!.InvokeAsync<Point>($"project", latLng);

    /// <summary>
    /// Given a projected coordinate returns the corresponding LatLng.
    /// The inverse of project.
    /// </summary>
    /// <param name="point">The <see cref="Point"/>.</param>
    /// <returns>The corresponding <see cref="LatLng"/>.</returns>
    public  ValueTask<LatLng> Unproject(Point point)
        =>  _crs!.InvokeAsync<LatLng>($"unproject", point);

    /// <summary>
    /// Returns the scale used when transforming projected coordinates into pixel coordinates for a particular zoom.
    /// For example, it returns 256 * 2^zoom for Mercator-based CRS.
    /// </summary>
    /// <param name="zoom">The zoom level.</param>
    /// <returns>The scale factor as a <see cref="double"/>.</returns>
    public  ValueTask<double> Scale(int zoom)
        =>  _crs!.InvokeAsync<double>($"scale", zoom);

    /// <summary>
    /// Inverse of Scale, returns the zoom level corresponding to a scale factor of scale.
    /// </summary>
    /// <param name="scale">The scale factor.</param>
    /// <returns>The zoom level as a <see cref="int"/>.</returns>
    public  ValueTask<int> Zoom(double scale)
        =>  _crs!.InvokeAsync<int>($"zoom", scale);

    /// <summary>
    /// Returns the projection's bounds scaled and transformed for the provided zoom.
    /// </summary>
    /// <param name="zoom">The zoom level.</param>
    /// <returns>The <see cref="Bounds"/>.</returns>
    public  ValueTask<Bounds> GetProjectedBounds(int zoom)
        =>  _crs!.InvokeAsync<Bounds>($"getProjectedBounds", zoom);

    /// <summary>
    /// Returns the distance between two geographical coordinates.
    /// </summary>
    /// <param name="latlng1">The first <see cref="LatLng"/>.</param>
    /// <param name="latlng2">The second <see cref="LatLng"/>.</param>
    /// <returns>The distance as a <see cref="double"/>.</returns>
    public  ValueTask<double> Distance(LatLng latlng1, LatLng latlng2)
        =>  _crs!.InvokeAsync<double>($"distance", latlng1, latlng2);

    /// <summary>
    /// Returns a LatLng where lat and lng has been wrapped according to the CRS's wrapLat and wrapLng properties,
    /// if they are outside the CRS's bounds.
    /// </summary>
    /// <param name="latLng">The <see cref="LatLng"/> to wrap.</param>
    /// <returns>The wrapped <see cref="LatLng"/>.</returns>
    public  ValueTask<LatLng> WrapLatLng(LatLng latLng)
        =>  _crs!.InvokeAsync<LatLng>($"wrapLatLng", latLng);

    /// <summary>
    /// Returns a LatLngBounds with the same size as the given one, ensuring that its center is within the CRS's bounds.
    /// Only accepts actual LatLngBounds instances, not arrays.
    /// </summary>
    /// <param name="latLngBounds">The <see cref="LatLngBounds"/> to wrap.</param>
    /// <returns>The wrapped <see cref="LatLngBounds"/>.</returns>
    public  ValueTask<LatLngBounds> WrapLatLngBounds(LatLngBounds latLngBounds)
        =>  _crs!.InvokeAsync<LatLngBounds>($"wrapLatLngBounds", latLngBounds);

    #endregion

    public async ValueTask DisposeAsync()
    {
        await _crs.DisposeAsync();
    }
}
