namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System.Collections.Generic;
using System.Threading.Tasks;

public class Rectangle(IEnumerable<LatLng> latLngs, PolylineOptions options)
    : Polygon(latLngs, options)
{
    protected override async Task<IJSObjectReference> CreateJsObjectRef()
    {
        return JSBinder is null
            ? throw new System.InvalidOperationException("Cannot create Rectangle object. No JavaScript binding has been set up for this object.")
            : await JSBinder.JSRuntime.InvokeAsync<IJSObjectReference>("L.Rectangle", LatLngs, Options);
    }

    #region Methods

    public async Task<Rectangle> SetBounds(LatLngBounds bounds)
    {
        GuardAgainstNullBinding("Cannot call SetBounds on Rectangle object. No JavaScript binding has been set up for this object.");
        var module = await JSBinder!.GetLeafletMapModule();
        await module.InvokeVoidAsync("LeafletMap.Rectangle.setBounds", JSObjectReference, bounds);
        return this;
    }

    #endregion
}
