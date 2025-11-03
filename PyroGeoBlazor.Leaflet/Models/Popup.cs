namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Threading.Tasks;

public sealed class Popup : DivOverlay
{
    private new readonly DomEventHandlerMapping<Popup>? InteractionOptions;

    public LatLng LatLng { get; }
    public PopupOptions? Options { get; }

    public Popup(LatLng latLng, PopupOptions? options = null)
        : base (options)
    {
        LatLng = latLng;
        Options = options;
        if (options is null || options.Interactive)
        {
            var dotnetReference = DotNetObjectReference.Create(this);
            InteractionOptions = new DomEventHandlerMapping<Popup>(dotnetReference, new Dictionary<string, string>
            {
                { "click", nameof(this.Click) }
            });
            if (base.InteractionOptions != null)
            {
                foreach (var eventMapping in base.InteractionOptions.Events)
                {
                    InteractionOptions.Events.Add(eventMapping.Key, eventMapping.Value);
                }
            }
        }
    }

    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        GuardAgainstNullBinding("Cannot create popup. JavaScript is not setup yet.");
        var module = await JSBinder!.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("Popup.createPopup", LatLng, Options, InteractionOptions);
    }

    #region Methods

    /// <summary>
    /// Alternative to Map.OpenPopup(popup).
    /// Adds the popup to the map and closes the previous one.
    /// </summary>
    /// <param name="map">The map to add the popup to.</param>
    /// <returns>The popup</returns>
    public async Task<Popup> OpenOn(Map map)
    {
        GuardAgainstNullBinding("Cannot open popup. JavaScript object reference is null.");
        await JSObjectReference!.InvokeVoidAsync("L.openOn", map.JSObjectReference);
        return this;
    }

    #endregion

}
