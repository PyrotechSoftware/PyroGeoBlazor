namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System;
using System.Threading.Tasks;

public class ScaleControl(ScaleControlOptions? options) : Control
{
    public new ScaleControlOptions? Options { get; } = options;

    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder is null
            ? throw new InvalidOperationException("Cannot create scale control. JavaScript is not setup yet.")
            : await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.control.scale", Options);
    }
}
