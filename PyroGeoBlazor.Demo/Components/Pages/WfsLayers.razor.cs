namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;
using PyroGeoBlazor.Demo.Models;
using PyroGeoBlazor.Leaflet.Models;
using System.Text.Json;

public partial class WfsLayers : ComponentBase, IAsyncDisposable
{
    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;
    protected WfsLayer? WfsLayer;
    protected LayersControl LayersControl;
    protected MapStateViewModel MapStateViewModel;
    protected List<Control> MapControls = [];

    private bool wfsLayerAdded = false;
    private int selectedCount = 0;

    public WfsLayers()
    {
        var mapCentre = new LatLng(-42, 175); // Centred on New Zealand
        MapStateViewModel = new MapStateViewModel
        {
            MapCentreLatitude = mapCentre.Lat,
            MapCentreLongitude = mapCentre.Lng,
            Zoom = 4
        };

        PositionMap = new Map("wfsMap", new MapOptions
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

    public async Task AddWfsLayer()
    {
        if (PositionMap is null)
        {
            Console.WriteLine("Cannot add WFS layer: Map not initialized");
            return;
        }

        try
        {
            // Get current map bounds
            var bounds = await PositionMap.GetBounds();

            // Check if bounds are valid
            if (bounds?.SouthWest is null || bounds?.NorthEast is null)
            {
                Console.WriteLine("Map bounds not available. Please wait for map to fully initialize and try again.");
                return;
            }

            Console.WriteLine($"Loading WFS features for bounds: SW({bounds.SouthWest.Lat}, {bounds.SouthWest.Lng}) NE({bounds.NorthEast.Lat}, {bounds.NorthEast.Lng})");

            // Normalize coordinates
            var westLng = Math.Min(bounds.SouthWest.Lng, bounds.NorthEast.Lng);
            var eastLng = Math.Max(bounds.SouthWest.Lng, bounds.NorthEast.Lng);
            var southLat = Math.Min(bounds.SouthWest.Lat, bounds.NorthEast.Lat);
            var northLat = Math.Max(bounds.SouthWest.Lat, bounds.NorthEast.Lat);

            // Create WFS layer with options
            WfsLayer = new WfsLayer(
                wfsUrl: "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows",
                options: new WfsLayerOptions
                {
                    RequestParameters = new WfsRequestParameters
                    {
                        TypeName = "PlannerSpatial:vwParcelsLayer",
                        MaxFeatures = 5000,
                        SrsName = "EPSG:4326",
                        BBox = new WfsBoundingBox
                        {
                            MinX = westLng,
                            MinY = southLat,
                            MaxX = eastLng,
                            MaxY = northLat
                        }
                    },
                    // GeoJSON layer options
                    MultipleFeatureSelection = true,
                    SelectedFeatureStyle = new PathOptions
                    {
                        Fill = true,
                        FillColor = "rgba(255,165,0,0.6)",
                        FillOpacity = 0.6,
                        Stroke = true,
                        Weight = 3,
                        Color = "rgba(255,140,0,1)",
                        Opacity = 1.0
                    },
                    // WFS-specific options
                    AutoRefresh = true,
                    IncrementalRefresh = true,
                    RefreshDebounceMs = 1000
                }
            );

            // Subscribe to events
            WfsLayer.OnFeatureClicked += (sender, args) =>
            {
                if (args?.Feature?.Properties is not null)
                {
                    Console.WriteLine($"WFS Feature clicked: {JsonSerializer.Serialize(args.Feature.Properties)}");
                }
            };

            WfsLayer.OnFeatureSelected += (sender, args) =>
            {
                if (args?.Feature?.Properties is not null && WfsLayer is not null)
                {
                    selectedCount = WfsLayer.GetSelectedFeaturesCount();
                    Console.WriteLine($"WFS Feature selected. Total: {selectedCount}");
                    StateHasChanged();
                }
            };

            WfsLayer.OnFeatureUnselected += (sender, args) =>
            {
                if (WfsLayer is not null)
                {
                    selectedCount = WfsLayer.GetSelectedFeaturesCount();
                    Console.WriteLine($"WFS Feature unselected. Remaining: {selectedCount}");
                    StateHasChanged();
                }
            };

            // Add to map
            await WfsLayer.AddTo(PositionMap);

            // Load features from WFS
            Console.WriteLine("Loading WFS features for current map bounds...");
            await WfsLayer.LoadFeaturesAsync();
            Console.WriteLine("WFS features loaded successfully!");

            // Add to layer control
            await LayersControl.AddOverlay(WfsLayer, "WFS Parcels");

            wfsLayerAdded = true;
            StateHasChanged();
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"Failed to load WFS data: {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error adding WFS layer: {ex.Message}");
        }
    }

    public async Task ReloadWfsLayer()
    {
        if (PositionMap is null || WfsLayer is null)
        {
            return;
        }

        try
        {
            Console.WriteLine("WFS: Reloading layer...");

            // Clear the feature cache
            WfsLayer.ClearLoadedFeatureCache();

            // Remove the old layer from the map
            await WfsLayer.RemoveLayer();

            // Get current bounds
            var bounds = await PositionMap.GetBounds();
            if (bounds?.SouthWest is null || bounds?.NorthEast is null)
            {
                Console.WriteLine("WFS: Cannot reload - bounds not available");
                return;
            }

            // Normalize coordinates
            var westLng = Math.Min(bounds.SouthWest.Lng, bounds.NorthEast.Lng);
            var eastLng = Math.Max(bounds.SouthWest.Lng, bounds.NorthEast.Lng);
            var southLat = Math.Min(bounds.SouthWest.Lat, bounds.NorthEast.Lat);
            var northLat = Math.Max(bounds.SouthWest.Lat, bounds.NorthEast.Lat);

            // Create new layer
            WfsLayer = new WfsLayer(
                wfsUrl: "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows",
                options: new WfsLayerOptions
                {
                    RequestParameters = new WfsRequestParameters
                    {
                        TypeName = "PlannerSpatial:vwParcelsLayer",
                        MaxFeatures = 5000,
                        SrsName = "EPSG:4326",
                        BBox = new WfsBoundingBox
                        {
                            MinX = westLng,
                            MinY = southLat,
                            MaxX = eastLng,
                            MaxY = northLat
                        }
                    },
                    MultipleFeatureSelection = true,
                    SelectedFeatureStyle = new PathOptions
                    {
                        Fill = true,
                        FillColor = "rgba(255,165,0,0.6)",
                        FillOpacity = 0.6,
                        Stroke = true,
                        Weight = 3,
                        Color = "rgba(255,140,0,1)",
                        Opacity = 1.0
                    },
                    AutoRefresh = true,
                    IncrementalRefresh = true,
                    RefreshDebounceMs = 1000
                }
            );

            // Re-subscribe to events
            WfsLayer.OnFeatureSelected += (sender, args) =>
            {
                if (WfsLayer is not null)
                {
                    selectedCount = WfsLayer.GetSelectedFeaturesCount();
                    StateHasChanged();
                }
            };

            WfsLayer.OnFeatureUnselected += (sender, args) =>
            {
                if (WfsLayer is not null)
                {
                    selectedCount = WfsLayer.GetSelectedFeaturesCount();
                    StateHasChanged();
                }
            };

            // Add to map and load
            await WfsLayer.AddTo(PositionMap);
            await WfsLayer.LoadFeaturesAsync(clearExisting: true);

            selectedCount = 0;
            Console.WriteLine("WFS: Reload complete!");
            StateHasChanged();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"WFS: Error during reload - {ex.Message}");
        }
    }

    private async Task ClearSelection()
    {
        if (WfsLayer != null)
        {
            await WfsLayer.ClearSelection();
            selectedCount = 0;
            StateHasChanged();
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
