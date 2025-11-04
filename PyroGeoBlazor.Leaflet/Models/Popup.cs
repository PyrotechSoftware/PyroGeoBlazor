namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Threading.Tasks;

/// <summary>
/// Used to open popups in certain places of the map.
/// Use Map.openPopup to open popups while making sure that only one popup is open at one time (recommended for usability),
/// or use Map.addLayer to open as many as you want.
/// <see href="https://leafletjs.com/reference.html#popup"/>
/// </summary>
public class Popup : DivOverlay
{
    protected new readonly DomEventHandlerMapping<Popup>? EventHandlerMapping;

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
            EventHandlerMapping = new DomEventHandlerMapping<Popup>(dotnetReference, new Dictionary<string, string>
            {
                { "click", nameof(this.Click) }
            });
            if (base.EventHandlerMapping != null)
            {
                foreach (var eventMapping in base.EventHandlerMapping.Events)
                {
                    EventHandlerMapping.Events.Add(eventMapping.Key, eventMapping.Value);
                }
            }
        }
    }

    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        GuardAgainstNullBinding("Cannot create popup. JavaScript is not setup yet.");
        var module = await JSBinder!.GetLeafletMapModule();
        return await module.InvokeAsync<IJSObjectReference>("LeafletMap.Popup.createPopup", LatLng, Options, EventHandlerMapping);
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
        if (JSBinder is null)
        {
            await BindJsObjectReference(map.JSBinder!);
        }
        await JSObjectReference!.InvokeVoidAsync("openOn", map);
        return this;
    }

    #endregion
}
