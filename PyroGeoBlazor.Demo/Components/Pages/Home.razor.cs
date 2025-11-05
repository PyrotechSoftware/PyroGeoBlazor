namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

using PyroGeoBlazor.Demo.Models;
using PyroGeoBlazor.Leaflet.Models;

using System.Threading.Tasks;

public partial class Home : ComponentBase, IAsyncDisposable
{
    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;
    protected WmsTileLayer? TownshipsLayer;
    protected WmsTileLayer? ExtensionsLayer;

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

        TownshipsLayer = new WmsTileLayer(
            "https://lims.koleta.co.mz/geoserver/ows",
            new WmsTileLayerOptions
            {
                Layers = "PlannerSpatial:Township",
                Format = "image/png",
                Transparent = true,
                Attribution = "",
                Version = "1.3.0",
                Opacity = 0.6
            }
        );

        ExtensionsLayer = new WmsTileLayer(
            "https://lims.koleta.co.mz/geoserver/ows",
            new WmsTileLayerOptions
            {
                Layers = "PlannerSpatial:TownshipExtensionOrFarm",
                Format = "image/png",
                Transparent = true,
                Attribution = "",
                Version = "1.3.0",
                Opacity = 0.6,
            }
        );


        MarkerViewModel = new MarkerViewModel();
    }

    protected override Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
        }
        return base.OnAfterRenderAsync(firstRender);
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

    public async Task AddTownshipsLayer()
    {
        if (PositionMap == null)
        {
            return;
        }

        if (TownshipsLayer == null)
        {
            return;
        }

        await TownshipsLayer.AddTo(PositionMap);

        if (ExtensionsLayer != null)
        {
            await ExtensionsLayer.AddTo(PositionMap);
        }
    }

    public async ValueTask DisposeAsync()
    {
        await OpenStreetMapsTileLayer.DisposeAsync();
        if (PositionMap != null)
        {
            await PositionMap.DisposeAsync();
        }

        GC.SuppressFinalize(this);
    }

    private async Task Locate()
    {
        if (PositionMap == null)
        {
            return;
        }

        PositionMap.OnLocationFound += OnUserLocationFound;
        PositionMap.OnLocationError += OnUserLocationError;
        await PositionMap.Locate();
    }

    private void OnUserLocationError(object? sender, Leaflet.EventArgs.LeafletErrorEventArgs e)
    {
        PositionMap!.OnLocationFound -= OnUserLocationFound;
        PositionMap!.OnLocationError -= OnUserLocationError;
    }

    private async void OnUserLocationFound(object? sender, Leaflet.EventArgs.LeafletLocationEventArgs e)
    {
        if (PositionMap is null)
        {
            return;
        }

        if (e.LatLng is not null)
        {
            await PositionMap.FlyTo(e.LatLng, 18);
            var marker = new Marker(e.LatLng, new MarkerOptions()
            {
                Title = "Detected User location",
                Draggable = true,
                AutoPan = true,
                RiseOnHover = true, RiseOffset = 10
            });
            await marker.AddTo(PositionMap);
        }

        PositionMap!.OnLocationFound -= OnUserLocationFound;
        PositionMap!.OnLocationError -= OnUserLocationError;
    }
}
