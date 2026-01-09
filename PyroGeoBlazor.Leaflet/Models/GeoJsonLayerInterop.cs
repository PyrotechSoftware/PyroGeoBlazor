namespace PyroGeoBlazor.Leaflet.Models;

using Microsoft.JSInterop;

using System;

public class GeoJsonLayerInterop
{
    internal Action<GeoJsonFeature, LayerInfo>? OnEachFeatureAction { get; }
    internal Func<GeoJsonFeature, LatLng, Marker>? PointToLayerFunc { get; }
    internal Func<GeoJsonFeature, PathOptions>? StyleFunc { get; }
    internal Func<GeoJsonFeature, bool>? FilterFunc { get; }
    internal Func<double[], LatLng>? CoordsToLatLngFunc { get; }

    public GeoJsonLayerInterop(
        Action<GeoJsonFeature, LayerInfo>? onEachFeature,
        Func<GeoJsonFeature, LatLng, Marker>? pointToLayer,
        Func<GeoJsonFeature, PathOptions>? style,
        Func<GeoJsonFeature, bool>? filter,
        Func<double[], LatLng>? coordsToLatLng)
    {
        OnEachFeatureAction = onEachFeature;
        PointToLayerFunc = pointToLayer;
        StyleFunc = style;
        FilterFunc = filter;
        CoordsToLatLngFunc = coordsToLatLng;
    }

    [JSInvokable]
    public void OnEachFeature(GeoJsonFeature feature, LayerInfo layer)
    {
        OnEachFeatureAction?.Invoke(feature, layer);
    }

    [JSInvokable]
    public MarkerOptions? PointToLayer(GeoJsonFeature feature, LatLng latlng)
    {
        if (PointToLayerFunc == null) return null;
        var marker = PointToLayerFunc(feature, latlng);
        // Return marker options that JS can use to create a marker
        return marker.Options;
    }

    [JSInvokable]
    public PathOptions? Style(GeoJsonFeature feature)
    {
        return StyleFunc?.Invoke(feature);
    }

    [JSInvokable]
    public bool Filter(GeoJsonFeature feature, LayerInfo? layer)
    {
        return FilterFunc?.Invoke(feature) ?? true;
    }

    [JSInvokable]
    public LatLng? CoordsToLatLng(double[] coords)
    {
        return CoordsToLatLngFunc?.Invoke(coords);
    }
}
