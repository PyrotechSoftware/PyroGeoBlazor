namespace PyroGeoBlazor.Leaflet;

using Microsoft.JSInterop;

using System;
using System.Threading.Tasks;

internal class LeafletMapJSBinder(IJSRuntime jsRuntime) : IAsyncDisposable
{
    internal IJSRuntime JSRuntime = jsRuntime;
    private Task<IJSObjectReference>? _leafletMapModule;

    internal async Task<IJSObjectReference> GetLeafletMapModule()
    {
        return await (_leafletMapModule ??= JSRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/PyroGeoBlazor.Leaflet/leafletMap.js").AsTask());
    }

    /// <inheritdoc />
    public async ValueTask DisposeAsync()
    {
        if (_leafletMapModule is not null)
        {
            var module = await _leafletMapModule;
            await module.DisposeAsync();
        }
    }
}
