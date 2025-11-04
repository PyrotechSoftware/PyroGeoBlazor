namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Threading.Tasks;

public class Tooltip : DivOverlay
{
    protected new readonly DomEventHandlerMapping<Tooltip>? EventHandlerMapping;

    public Tooltip(LatLng latlng, TooltipOptions? options = null)
        : base(options)
    {
        LatLng = latlng;
        Options = options;
        var dotnetReference = DotNetObjectReference.Create(this);
        if (Options is null || Options.EnableEvents)
        {
            EventHandlerMapping = new DomEventHandlerMapping<Tooltip>(dotnetReference, []);
        }
    }

    public LatLng LatLng { get; }
    public TooltipOptions? Options { get; }

    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        GuardAgainstNullBinding("Cannot create tooltip. JavaScript is not setup yet.");
        var module = await JSBinder!.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("Tooltip.createTooltip", LatLng, Options, EventHandlerMapping);
    }
}
