namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;

using PyroGeoBlazor.Demo.Models;
using PyroGeoBlazor.Leaflet.Models;

using System.Threading.Tasks;
using System.IO;
using System.Text.Json;

public partial class Home : ComponentBase, IAsyncDisposable
{
    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;
    protected MapboxVectorTileLayer? TownshipsLayer;
    protected MapboxVectorTileLayer? ExtensionsLayer;
    protected MapboxVectorTileLayer? ParcelsLayer;
    protected GeoJsonLayer? GeoJsonLayer;
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

    private async Task AddGeoJson()
    {
        if (PositionMap == null)
        {
            return;
        }

        var text = File.ReadAllText("./Township.json");
        // Deserialize the GeoJSON text into a CLR object so it is passed as JSON to the JS runtime
        var geoJsonObject = JsonSerializer.Deserialize<object>(text);

        var options = new GeoJsonLayerOptions(OnEachFeatureCreated, OnPointToLayer, OnStyle, OnFeatureFilter, OnCoordsToLatLng)
        {
            DebugLogging = false, // Set to true when debugging, false for production
            MultipleFeatureSelection = true // Enable multiple feature selection
            // SelectedFeatureStyle can be omitted to use the default blue highlight style
            // Uncomment below to customize the selection style:
            // SelectedFeatureStyle = new PathOptions
            // {
            //     Color = "yellow",
            //     Weight = 3,
            //     FillOpacity = 0.7
            // }
        };
        GeoJsonLayer = new GeoJsonLayer(null, options);
        
        // Subscribe to selection events
        GeoJsonLayer.OnFeatureSelected += (sender, args) =>
        {
            if (args?.Feature != null && GeoJsonLayer != null)
            {
                Console.WriteLine($"Feature selected. Total selected: {GeoJsonLayer.GetSelectedFeaturesCount()}");
                
                // Example: Get all selected feature IDs
                var selectedIds = GeoJsonLayer.GetSelectedFeatureIds();
                Console.WriteLine($"Selected IDs: {string.Join(", ", selectedIds.Where(id => id != null))}");
                
                // Example: Check if a specific feature is selected
                if (args.Feature.Id != null)
                {
                    var isSelected = GeoJsonLayer.IsFeatureSelected(args.Feature.Id);
                    Console.WriteLine($"Feature {args.Feature.Id} is selected: {isSelected}");
                }
            }
        };
        
        GeoJsonLayer.OnFeatureUnselected += (sender, args) =>
        {
            if (GeoJsonLayer != null)
            {
                Console.WriteLine($"Feature unselected. Total selected: {GeoJsonLayer.GetSelectedFeaturesCount()}");
                
                // Example: Check if any features are still selected
                if (GeoJsonLayer.HasSelectedFeatures())
                {
                    var selectedFeatures = GeoJsonLayer.GetSelectedFeatures();
                    Console.WriteLine($"Remaining features: {selectedFeatures.Count}");
                }
                else
                {
                    Console.WriteLine("No features selected");
                }
            }
        };
        
        await GeoJsonLayer.AddTo(PositionMap);
        await LayersControl.AddOverlay(GeoJsonLayer, "GeoJson");
        if (geoJsonObject != null)
        {
            await GeoJsonLayer.AddData(geoJsonObject);
        }
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

    private void OnEachFeatureCreated(GeoJsonFeature feature, LayerInfo layer)
    {
        // Handle each feature as it is created
        // Now you have strongly-typed access to:
        // - feature.Id
        // - feature.Properties (Dictionary<string, object?>)
        // - feature.Geometry (with Type and Coordinates)
        // - layer.LeafletId
        // - layer.Type (e.g., "Marker", "Polyline", etc.)
    }

    private bool OnFeatureFilter(GeoJsonFeature feature)
    {
        // Example: Only include features with a specific property value
        //if (feature.Properties != null)
        //{
        //    if (feature.Properties.TryGetValue("TownCode", out var includeValue))
        //    {
        //        return includeValue?.ToString() == "010"; // Replace with your actual condition
        //    }
        //}

        return true; // Default to including the feature
    }

    private Marker OnPointToLayer(GeoJsonFeature feature, LatLng latlng)
    {
        // Example: Create a custom marker based on feature properties
        var markerOptions = new MarkerOptions
        {
            Title = feature.Properties != null && feature.Properties.TryGetValue("name", out var nameValue) ? nameValue?.ToString() : "Unnamed Feature"
        };
        return new Marker(latlng, markerOptions);
    }

    private PathOptions OnStyle(GeoJsonFeature feature)
    {
        // Example: Style features based on a property
        var pathOptions = new PathOptions();
        if (feature.Properties != null &&
            feature.Properties.TryGetValue("TownCode", out var importantValue) &&
            importantValue?.ToString() == "010")
        {
            pathOptions.Color = "red";
            pathOptions.FillColor = "red";
            pathOptions.FillOpacity = 0.5;
            pathOptions.Weight = 3;
        }
        else
        {
            pathOptions.Color = "blue";
            pathOptions.Weight = 1;
        }
        return pathOptions;
    }

    private LatLng OnCoordsToLatLng(double[] coords)
    {
        // Assuming coords are in [longitude, latitude] order
        if (coords.Length >= 2)
        {
            return new LatLng(coords[1], coords[0]);
        }
        return new LatLng(0, 0); // Default fallback
    }
}
