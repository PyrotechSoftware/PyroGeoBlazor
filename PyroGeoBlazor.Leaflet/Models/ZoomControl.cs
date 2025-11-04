namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Threading.Tasks;

public class ZoomControl(ZoomControlOptions options) : Control(options)
{
    public new ZoomControlOptions Options { get; } = options;

    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder is null
            ? throw new InvalidOperationException("Cannot create ZoomControl. JavaScript is not setup yet.")
            : await JSBinder!.JSRuntime.InvokeAsync<IJSObjectReference>("L.ZoomControl", Options);
    }
}
