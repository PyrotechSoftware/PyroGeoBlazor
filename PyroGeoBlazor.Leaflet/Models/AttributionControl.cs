namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System;
using System.Threading.Tasks;

public class AttributionControl(AttributionControlOptions options) : Control
{
    public new AttributionControlOptions Options { get; } = options;

    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder is null
            ? throw new InvalidOperationException("Cannot create attribution control. JavaScript is not setup yet.")
            : Options.Disabled
            ? await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.control.attribution", "{ 'prefix': false }" )
            : await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.control.attribution", Options);
    }
}
