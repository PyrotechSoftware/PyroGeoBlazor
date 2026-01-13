namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.Demo.Models;
using PyroGeoBlazor.Leaflet.Models;
using System.Text.Json;

public partial class VectorTiles : ComponentBase, IAsyncDisposable
{
    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;
    protected ProtobufVectorTileLayer? TownshipsLayer;
    protected ProtobufVectorTileLayer? ExtensionsLayer;
    protected ProtobufVectorTileLayer? ParcelsLayer;
    protected LayersControl LayersControl;
    protected MapStateViewModel MapStateViewModel;
    protected List<Control> MapControls = [];

    private bool layersAdded = false;
    private bool isInteractive = true;
    private bool selectionEnabled = true;
    private bool multiSelectEnabled = false;

    public VectorTiles()
    {
        var mapCentre = new LatLng(-42, 175); // Centred on New Zealand
        MapStateViewModel = new MapStateViewModel
        {
            MapCentreLatitude = mapCentre.Lat,
            MapCentreLongitude = mapCentre.Lng,
            Zoom = 4
        };

        PositionMap = new Map("vectorTilesMap", new MapOptions
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

        // Initialize vector tile layers
        TownshipsLayer = new ProtobufVectorTileLayer(
            "https://lims.koleta.co.mz/geoserver/PlannerSpatial/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER={LayerName}&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}",
            new ProtobufVectorTileLayerOptions
            {
                Attribution = "",
                TileSize = 256,
                Opacity = 0.6,
                MinZoom = 1,
                Interactive = true,
                LayerName = "PlannerSpatial:Township",
                VectorTileLayerStyles = new Dictionary<string, PathOptions>
                {
                    ["PlannerSpatial:Township"] = new PathOptions
                    {
                        Fill = true,
                        FillColor = "#88cc88",
                        FillOpacity = 0.4,
                        Stroke = true,
                        Color = "#44aa44",
                        Weight = 2,
                        Opacity = 1.0
                    }
                },
                SelectedFeatureStyle = new PathOptions
                {
                    Fill = true,
                    FillColor = "rgba(50,150,250,0.5)",
                    FillOpacity = 0.5,
                    Stroke = true,
                    Weight = 3,
                    Color = "rgba(50,150,250,0.9)",
                    Opacity = 1.0
                }
            }
        );

        ExtensionsLayer = new ProtobufVectorTileLayer(
            "https://lims.koleta.co.mz/geoserver/PlannerSpatial/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=PlannerSpatial:TownshipExtensionOrFarm&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}",
            new ProtobufVectorTileLayerOptions
            {
                Attribution = "",
                Opacity = 0.6,
                TileSize = 256,
                MinZoom = 1,
                Interactive = true,
                VectorTileLayerStyles = new Dictionary<string, PathOptions>
                {
                    ["PlannerSpatial:TownshipExtensionOrFarm"] = new PathOptions
                    {
                        Fill = true,
                        FillColor = "#ffcc88",
                        FillOpacity = 0.4,
                        Stroke = true,
                        Color = "#ff8844",
                        Weight = 2,
                        Opacity = 1.0
                    }
                },
                SelectedFeatureStyle = new PathOptions
                {
                    Fill = true,
                    FillColor = "rgba(50,150,250,0.5)",
                    FillOpacity = 0.5,
                    Stroke = true,
                    Weight = 3,
                    Color = "rgba(50,150,250,0.9)",
                    Opacity = 1.0
                }
            }
        );

        ParcelsLayer = new ProtobufVectorTileLayer(
            "https://lims.koleta.co.mz/geoserver/PlannerSpatial/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=PlannerSpatial:vwParcelsLayer&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}",
            new ProtobufVectorTileLayerOptions
            {
                Attribution = "",
                Opacity = 0.6,
                TileSize = 256,
                MinZoom = 1,
                Interactive = true,
                EnableFeatureSelection = true,
                VectorTileLayerStyles = new Dictionary<string, PathOptions>
                {
                    ["vwParcelsLayer"] = new PathOptions
                    {
                        Fill = true,
                        FillColor = "#ccccff",
                        FillOpacity = 0.3,
                        Stroke = true,
                        Color = "#8888ff",
                        Weight = 1,
                        Opacity = 0.8
                    }
                },
                SelectedFeatureStyle = new PathOptions
                {
                    Fill = true,
                    FillColor = "yellow",
                    FillOpacity = 0.5,
                    Stroke = true,
                    Weight = 3,
                    Color = "yellow",
                    Opacity = 1.0
                }
            }
        );

        // Subscribe to interactive events
        ParcelsLayer.OnMouseOver += (sender, args) =>
        {
            if (args?.Feature?.Properties != null)
            {
                Console.WriteLine($"Mouse over feature: {JsonSerializer.Serialize(args.Feature.Properties)}");
            }
        };

        ParcelsLayer.OnFeatureClicked += (sender, args) =>
        {
            if (args?.Feature?.Properties != null)
            {
                Console.WriteLine($"Feature clicked: {JsonSerializer.Serialize(args.Feature.Properties)}");
            }
        };

        ParcelsLayer.OnFeatureSelected += (sender, args) =>
        {
            if (args?.Feature?.Properties != null)
            {
                Console.WriteLine($"Feature selected. Total: {ParcelsLayer?.GetSelectedFeaturesCount()}");
            }
        };

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

    public async Task AddVectorTileLayers()
    {
        if (PositionMap == null || TownshipsLayer == null)
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

        layersAdded = true;
        StateHasChanged();
    }

    private async Task ToggleInteractive(ChangeEventArgs e)
    {
        isInteractive = (bool)(e.Value ?? false);
        
        if (TownshipsLayer != null)
        {
            await TownshipsLayer.SetInteractive(isInteractive);
        }
        if (ExtensionsLayer != null)
        {
            await ExtensionsLayer.SetInteractive(isInteractive);
        }
        if (ParcelsLayer != null)
        {
            await ParcelsLayer.SetInteractive(isInteractive);
        }
    }

    private async Task ToggleSelection(ChangeEventArgs e)
    {
        selectionEnabled = (bool)(e.Value ?? false);
        
        if (TownshipsLayer != null)
        {
            await TownshipsLayer.SetEnableFeatureSelection(selectionEnabled);
        }
        if (ExtensionsLayer != null)
        {
            await ExtensionsLayer.SetEnableFeatureSelection(selectionEnabled);
        }
        if (ParcelsLayer != null)
        {
            await ParcelsLayer.SetEnableFeatureSelection(selectionEnabled);
        }
    }

    private async Task ToggleMultiSelect(ChangeEventArgs e)
    {
        multiSelectEnabled = (bool)(e.Value ?? false);
        
        if (TownshipsLayer != null)
        {
            await TownshipsLayer.SetMultipleFeatureSelection(multiSelectEnabled);
        }
        if (ExtensionsLayer != null)
        {
            await ExtensionsLayer.SetMultipleFeatureSelection(multiSelectEnabled);
        }
        if (ParcelsLayer != null)
        {
            await ParcelsLayer.SetMultipleFeatureSelection(multiSelectEnabled);
        }
    }

    private async Task ClearSelection()
    {
        if (TownshipsLayer != null)
        {
            await TownshipsLayer.ClearSelection();
        }
        if (ExtensionsLayer != null)
        {
            await ExtensionsLayer.ClearSelection();
        }
        if (ParcelsLayer != null)
        {
            await ParcelsLayer.ClearSelection();
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
}
