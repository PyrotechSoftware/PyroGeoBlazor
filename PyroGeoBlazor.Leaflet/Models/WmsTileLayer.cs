namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Threading.Tasks;

public class WmsTileLayer : TileLayer
{
    protected new readonly DomEventHandlerMapping<WmsTileLayer>? EventHandlerMapping;

    public WmsTileLayer(string urlTemplate, WmsTileLayerOptions options)
        : base(urlTemplate, options)
    {
        Options = options;
        if (Options.EventsEnabled)
        {
            var dotNetObjectRef = DotNetObjectReference.Create(this);
            EventHandlerMapping = new DomEventHandlerMapping<WmsTileLayer>(dotNetObjectRef, []);
            if (base.EventHandlerMapping != null)
            {
                foreach (var eventMapping in base.EventHandlerMapping.Events)
                {
                    EventHandlerMapping.Events.Add(eventMapping.Key, eventMapping.Value);
                }
            }
        }
    }

    public new WmsTileLayerOptions Options { get; }

    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        if (JSBinder == null)
        {
            throw new InvalidOperationException("JavaScript binder is not set.");
        }

        var module = await JSBinder.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.WmsTileLayer.createWmsTileLayer", UrlTemplate, Options, EventHandlerMapping);
    }

    #region Methods

    public async Task<WmsTileLayer> SetParams(object parameters)
    {
        if (JSObjectReference == null)
        {
            throw new InvalidOperationException("JavaScript object reference is not bound.");
        }

        await JSObjectReference.InvokeVoidAsync("setParams", parameters);
        return this;
    }

    #endregion
}
