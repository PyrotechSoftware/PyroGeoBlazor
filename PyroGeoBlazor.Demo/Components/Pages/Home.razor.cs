namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;

using PyroGeoBlazor.Demo.Models;
using PyroGeoBlazor.Leaflet.Models;

using System.Threading.Tasks;

public partial class Home : ComponentBase, IAsyncDisposable
{
    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;

    protected MapStateViewModel MapStateViewModel;
    protected MarkerViewModel MarkerViewModel;

    public Home()
    {
        var mapCentre = new LatLng(-42, 175); // Centred on New Zealand
        MapStateViewModel = new MapStateViewModel
        {
            MapCentreLatitude = mapCentre.Lat,
            MapCentreLongitude = mapCentre.Lng,
            Zoom = 4
        };
        PositionMap = new Map("testMap", new MapOptions
        {
            Center = mapCentre,
            Zoom = MapStateViewModel.Zoom,
            EventOptions = new MapEventOptions
            {
                ContextMenu = true
            }
        }, true);
        OpenStreetMapsTileLayer = new TileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                new TileLayerOptions
                {
                    Attribution = @"Map data &copy; <a href=""https://www.openstreetmap.org/"">OpenStreetMap</a> contributors, " +
                        @"<a href=""https://creativecommons.org/licenses/by-sa/2.0/"">CC-BY-SA</a>"
                }
            );


        MarkerViewModel = new MarkerViewModel();
    }

    protected async void GetMapState()
    {
        if (PositionMap == null)
        {
            return;
        }

        var mapCentre = await PositionMap.GetCenter();
        MapStateViewModel.MapCentreLatitude = mapCentre.Lat;
        MapStateViewModel.MapCentreLongitude = mapCentre.Lng;
        MapStateViewModel.Zoom = await PositionMap.GetZoom();
        MapStateViewModel.MapContainerSize = await PositionMap.GetSize();
        MapStateViewModel.MapViewPixelBounds = await PositionMap.GetPixelBounds();
        MapStateViewModel.MapLayerPixelOrigin = await PositionMap.GetPixelOrigin();
        StateHasChanged();
    }

    protected async void SetMapState()
    {
        if (PositionMap == null)
        {
            return;
        }

        var mapCentre = new LatLng(MapStateViewModel.MapCentreLatitude, MapStateViewModel.MapCentreLongitude);
        await PositionMap.SetView(mapCentre, MapStateViewModel.Zoom);
    }

    protected async void AddMarkerAtMapCenter()
    {
        if (PositionMap == null)
        {
            return;
        }

        var mapCentre = await PositionMap.GetCenter();
        var marker = new Marker(mapCentre, new MarkerOptions
        {
            Keyboard = MarkerViewModel.Keyboard,
            Title = MarkerViewModel.Title,
            Alt = MarkerViewModel.Alt,
            ZIndexOffset = MarkerViewModel.ZIndexOffset,
            Opacity = MarkerViewModel.Opacity,
            RiseOnHover = MarkerViewModel.RiseOnHover,
            RiseOffset = MarkerViewModel.RiseOffset,
        });

        await marker.AddTo(PositionMap);
    }

    public async ValueTask DisposeAsync()
    {
        await OpenStreetMapsTileLayer.DisposeAsync();
        await PositionMap.DisposeAsync();
    }
}
