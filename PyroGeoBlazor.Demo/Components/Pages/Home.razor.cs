namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;

using PyroGeoBlazor.Demo.Models;
using PyroGeoBlazor.Leaflet.Models;

using System.Threading.Tasks;

public partial class Home : ComponentBase, IAsyncDisposable
{
    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;
    protected MapboxVectorTileLayer? TownshipsLayer;
    protected MapboxVectorTileLayer? ExtensionsLayer;
    protected MapboxVectorTileLayer? ParcelsLayer;
    protected LayersControl LayersControl;

    protected MapStateViewModel MapStateViewModel;
    protected MarkerViewModel MarkerViewModel;

    protected List<Control> MapControls = [];

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

        TownshipsLayer = new MapboxVectorTileLayer(
            "https://lims.koleta.co.mz/geoserver/PlannerSpatial/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER={LayerName}&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}",
            new MapboxVectorTileLayerOptions
            {
                Format = "MVT",
                Attribution = "",
                TileSize = 256,
                Opacity = 0.6,
                MinZoom = 1,
                LayerName = "PlannerSpatial:Township",
                SelectedFeatureStyle = new FeatureStyle
                {
                    Fill = "rgba(50,150,250,0.25)",
                    LineWidth = 2,
                    Stroke = "rgba(50,150,250,0.9)"
                }
            }
        );

        ExtensionsLayer = new MapboxVectorTileLayer(
            "https://lims.koleta.co.mz/geoserver/PlannerSpatial/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=PlannerSpatial:TownshipExtensionOrFarm&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}",
            new MapboxVectorTileLayerOptions
            {
                Format = "MVT",
                Attribution = "",
                Opacity = 0.6,
                TileSize = 256,
                MinZoom = 1,
                SelectedFeatureStyle = new FeatureStyle
                {
                    Fill = "rgba(50,150,250,0.25)",
                    LineWidth = 2,
                    Stroke = "rgba(50,150,250,0.9)"
                }
            }
        );

        ParcelsLayer = new MapboxVectorTileLayer(
            "https://lims.koleta.co.mz/geoserver/PlannerSpatial/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=PlannerSpatial:vwParcelsLayer&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}",
            new MapboxVectorTileLayerOptions
            {
                Format = "MVT",
                Attribution = "",
                Opacity = 0.6,
                TileSize = 256,
                MinZoom = 1,
                SelectedFeatureStyle = new FeatureStyle
                {
                    Fill = "rgba(150,150,250,0.25)",
                    LineWidth = 2,
                    Stroke = "rgba(150,150,250,0.9)"
                }
            }
        );

        MarkerViewModel = new MarkerViewModel();
        LayersControl = new LayersControl(
            baseLayers: [],
            overlays: [],
            options: new LayersControlOptions()
            {
                Collapsed = false,
                Position = "topright",
                HideSingleBase = false,
                AutoZIndex = true,
                SortLayers = false
            }
        );

        MapControls.Add(LayersControl);
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
        }

        await base.OnAfterRenderAsync(firstRender);
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
        await LayersControl.AddOverlay(TownshipsLayer, "Townships");

        if (ExtensionsLayer != null)
        {
            await ExtensionsLayer.AddTo(PositionMap);
            await LayersControl.AddOverlay(ExtensionsLayer, "Extensions");
        }

        if (ParcelsLayer != null)
        {
            await ParcelsLayer.AddTo(PositionMap);
            await LayersControl.AddOverlay(ParcelsLayer, "Parcels");
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
