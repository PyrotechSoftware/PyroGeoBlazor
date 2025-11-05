namespace PyroGeoBlazor.Leaflet.Services;

using PyroGeoBlazor.Leaflet.Models;

using System.Threading.Tasks;

internal interface ILeafletCrs : IAsyncDisposable
{
    ValueTask<CrsRef> GetAsync(string name); // e.g. "EPSG3857", "EPSG4326"
    ValueTask<CrsRef> EPSG3395Async();
    ValueTask<CrsRef> EPSG3857Async();
    ValueTask<CrsRef> EPSG4326Async();
    ValueTask<CrsRef> SimpleAsync();
}
