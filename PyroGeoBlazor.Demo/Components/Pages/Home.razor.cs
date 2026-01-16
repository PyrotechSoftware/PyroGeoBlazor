namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;

using PyroGeoBlazor.Demo.Models;
using PyroGeoBlazor.Leaflet.Models;

using System.Threading.Tasks;
using System.IO;
using System.Text.Json;
using PyroGeoBlazor.Models;

public partial class Home : ComponentBase, IAsyncDisposable
{
    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;
    protected ProtobufVectorTileLayer? TownshipsLayer;
    protected ProtobufVectorTileLayer? ExtensionsLayer;
    protected ProtobufVectorTileLayer? ParcelsLayer;
    protected GeoJsonLayer? GeoJsonLayer;
    protected WfsLayer? WfsLayer;
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
                Console.WriteLine($"Mouse over feature with properties: {System.Text.Json.JsonSerializer.Serialize(args.Feature.Properties)}");
            }
        };

        ParcelsLayer.OnMouseOut += (sender, args) =>
        {
            if (args?.Feature != null)
            {
                Console.WriteLine("Mouse left feature");
            }
        };

        ParcelsLayer.OnFeatureClicked += (sender, args) =>
        {
            if (args?.Feature?.Properties != null)
            {
                Console.WriteLine($"Feature clicked: {System.Text.Json.JsonSerializer.Serialize(args.Feature.Properties)}");
            }
        };

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
            // No need to subscribe to map events manually anymore
            // WfsLayer handles this automatically when added to the map
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
            Console.WriteLine($"Raw bounds - SW.Lng={bounds.SouthWest.Lng}, NE.Lng={bounds.NorthEast.Lng}, SW.Lat={bounds.SouthWest.Lat}, NE.Lat={bounds.NorthEast.Lat}");

            // Determine the actual min/max values for longitude and latitude
            var westLng = Math.Min(bounds.SouthWest.Lng, bounds.NorthEast.Lng);
            var eastLng = Math.Max(bounds.SouthWest.Lng, bounds.NorthEast.Lng);
            var southLat = Math.Min(bounds.SouthWest.Lat, bounds.NorthEast.Lat);
            var northLat = Math.Max(bounds.SouthWest.Lat, bounds.NorthEast.Lat);
            
            Console.WriteLine($"Normalized: West={westLng}, East={eastLng}, South={southLat}, North={northLat}");

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
                            MinX = westLng,   // Westernmost longitude (smaller value)
                            MinY = southLat,  // Southernmost latitude (smaller value)
                            MaxX = eastLng,   // Easternmost longitude (larger value)
                            MaxY = northLat   // Northernmost latitude (larger value)
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
                    AutoRefresh = true,           // Automatically refresh on pan/zoom
                    IncrementalRefresh = true,    // Only add new features (default)
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
                if (args?.Feature?.Properties is not null)
                {
                    Console.WriteLine($"WFS Feature selected: {JsonSerializer.Serialize(args.Feature.Properties)}");
                    Console.WriteLine($"Total selected: {WfsLayer?.GetSelectedFeaturesCount()}");
                }
            };

            WfsLayer.OnFeatureUnselected += (sender, args) =>
            {
                Console.WriteLine($"WFS Feature unselected. Remaining: {WfsLayer?.GetSelectedFeaturesCount()}");
            };

            // Add to map (auto-refresh is automatically enabled)
            await WfsLayer.AddTo(PositionMap);
            
            // Load features from WFS
            Console.WriteLine("Loading WFS features for current map bounds...");
            await WfsLayer.LoadFeaturesAsync();
            Console.WriteLine($"WFS features loaded successfully! (within bounds)");

            // Add to layer control
            await LayersControl.AddOverlay(WfsLayer, "WFS Parcels (Auto-Refresh)");
            
            StateHasChanged();
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"Failed to load WFS data: {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error adding WFS layer: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
        }
    }

    /// <summary>
    /// Completely reloads the WFS layer, clearing all existing features first.
    /// </summary>
    public async Task ReloadWfsLayer()
    {
        if (PositionMap is null || WfsLayer is null)
        {
            return;
        }

        try
        {
            Console.WriteLine("WFS: Completely reloading layer...");
            
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

            // Create new layer with options
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
                    // HoverStyle uses default (red stroke)
                    AutoRefresh = true,
                    IncrementalRefresh = true,
                    RefreshDebounceMs = 1000
                }
            );

            // Re-subscribe to events
            WfsLayer.OnFeatureClicked += (sender, args) =>
            {
                if (args?.Feature?.Properties is not null)
                {
                    Console.WriteLine($"WFS Feature clicked: JsonSerializer.Serialize(args.Feature.Properties)");
                }
            };

            WfsLayer.OnFeatureSelected += (sender, args) =>
            {
                if (args?.Feature?.Properties is not null)
                {
                    Console.WriteLine($"WFS Feature selected: JsonSerializer.Serialize(args.Feature.Properties)");
                    Console.WriteLine($"Total selected: {WfsLayer?.GetSelectedFeaturesCount()}");
                }
            };

            WfsLayer.OnFeatureUnselected += (sender, args) =>
            {
                Console.WriteLine($"WFS Feature unselected. Remaining: {WfsLayer?.GetSelectedFeaturesCount()}");
            };

            // Add to map and load with full reload
            await WfsLayer.AddTo(PositionMap);
            await WfsLayer.LoadFeaturesAsync(clearExisting: true);
            
            Console.WriteLine("WFS: Complete reload finished!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"WFS: Error during complete reload - {ex.Message}");
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
            MultipleFeatureSelection = true, // Enable multiple feature selection
            // SelectedFeatureStyle can be omitted to use the default blue highlight style
            // Uncomment below to customize the selection style:
            //SelectedFeatureStyle = new PathOptions
            //{
            //    Color = "yellow",
            //    Weight = 3,
            //    FillOpacity = 0.7
            //}
        };
        
        // Now you can pass data in the constructor and it will use our custom addData
        GeoJsonLayer = new GeoJsonLayer(geoJsonObject, options);
        
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
        
        // No need to call AddData separately anymore when data is passed to constructor
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
