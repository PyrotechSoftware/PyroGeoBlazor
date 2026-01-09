namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System;

public class GeoJsonLayerInterop
{
    private readonly Action<object, object>? _onEachFeature;

    public GeoJsonLayerInterop(Action<object, object>? onEachFeature)
    {
        _onEachFeature = onEachFeature;
    }

    [JSInvokable]
    public void OnEachFeature(object feature, Layer layer)
    {
        _onEachFeature?.Invoke(feature, layer);
    }
}
