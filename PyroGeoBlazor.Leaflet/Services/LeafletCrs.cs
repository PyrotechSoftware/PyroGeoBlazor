namespace PyroGeoBlazor.Leaflet.Services;

using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.Models;

using System.Collections.Concurrent;
using System.Threading.Tasks;

internal class LeafletCrs : ILeafletCrs
{
    private readonly IJSRuntime _js;
    private readonly Lazy<Task<IJSObjectReference>> _module;
    private readonly ConcurrentDictionary<string, Task<CrsRef>> _cache = new();

    public LeafletCrs(IJSRuntime js)
    {
        _js = js;
        _module = new(() => _js.InvokeAsync<IJSObjectReference>(
            "import", "./_content/PyroGeoBlazor.Leaflet/leafletMap.js").AsTask());
    }

    public ValueTask<CrsRef> GetAsync(string name)
    {
        var task = _cache.GetOrAdd(name, async key =>
        {
            var module = await _module.Value;
            var crsObj = await module.InvokeAsync<IJSObjectReference>("getCrs", key);
            return new CrsRef(crsObj);
        });

        return new ValueTask<CrsRef>(task);
    }

    public ValueTask<CrsRef> EPSG3857Async() => GetAsync("EPSG3857");
    public ValueTask<CrsRef> EPSG4326Async() => GetAsync("EPSG4326");
    public ValueTask<CrsRef> EPSG3395Async() => GetAsync("EPSG3395");
    public ValueTask<CrsRef> SimpleAsync() => GetAsync("Simple");

    public async ValueTask DisposeAsync()
    {
        if (_module.IsValueCreated)
        {
            var m = await _module.Value;
            await m.DisposeAsync();
        }
    }
}
