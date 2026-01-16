namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;

using PyroGeoBlazor.Demo.Models;
using PyroGeoBlazor.Leaflet.Models;

using System.IO;
using System.Text.Json;

public partial class GeoJsonLayers : ComponentBase, IAsyncDisposable
{
    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;
    protected GeoJsonLayer? GeoJsonLayer;
    protected LayersControl LayersControl;
    protected MapStateViewModel MapStateViewModel;
    protected List<Control> MapControls = [];

    private bool geoJsonLayerAdded = false;
    private bool selectionEnabled = true;
    private bool multiSelectEnabled = true;
    private int selectedCount = 0;

    public GeoJsonLayers()
    {
        var mapCentre = new LatLng(-42, 175); // Centred on New Zealand
        MapStateViewModel = new MapStateViewModel
        {
            MapCentreLatitude = mapCentre.Lat,
            MapCentreLongitude = mapCentre.Lng,
            Zoom = 6
        };

        PositionMap = new Map("geoJsonMap", new MapOptions
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

    private async Task AddGeoJsonLayer()
    {
        if (PositionMap == null)
        {
            return;
        }

        try
        {
            var text = File.ReadAllText("./Township.json");
            var geoJsonObject = JsonSerializer.Deserialize<object>(text);

            // Try to compute bounds from the raw GeoJSON on the server side so we can fit immediately
            LatLngBounds? computedBounds = null;
            try
            {
                using var doc = JsonDocument.Parse(text);
                double? minLat = null, maxLat = null, minLng = null, maxLng = null;

                void CollectCoords(JsonElement el)
                {
                    if (el.ValueKind == JsonValueKind.Array)
                    {
                        // If the first element is a number, treat this as a coordinate [lng, lat, ...]
                        if (el.GetArrayLength() >= 2 && el[0].ValueKind == JsonValueKind.Number && el[1].ValueKind == JsonValueKind.Number)
                        {
                            try
                            {
                                var lng = el[0].GetDouble();
                                var lat = el[1].GetDouble();
                                if (!minLat.HasValue || lat < minLat) minLat = lat;
                                if (!maxLat.HasValue || lat > maxLat) maxLat = lat;
                                if (!minLng.HasValue || lng < minLng) minLng = lng;
                                if (!maxLng.HasValue || lng > maxLng) maxLng = lng;
                            }
                            catch
                            {
                                // ignore parse errors
                            }
                        }
                        else
                        {
                            foreach (var child in el.EnumerateArray())
                            {
                                CollectCoords(child);
                            }
                        }
                    }
                    else if (el.ValueKind == JsonValueKind.Object)
                    {
                        foreach (var prop in el.EnumerateObject())
                        {
                            CollectCoords(prop.Value);
                        }
                    }
                }

                CollectCoords(doc.RootElement);

                if (minLat.HasValue && maxLat.HasValue && minLng.HasValue && maxLng.HasValue)
                {
                    var ne = new LatLng(maxLat.Value, maxLng.Value);
                    var sw = new LatLng(minLat.Value, minLng.Value);

                    // Guard against degenerate bounds (NE == SW) which Leaflet rejects as invalid
                    if (Math.Abs(ne.Lat - sw.Lat) < 1e-9 && Math.Abs(ne.Lng - sw.Lng) < 1e-9)
                    {
                        // Expand bounds slightly so fitBounds will succeed
                        const double delta = 0.01; // ~1km depending on latitude
                        ne = new LatLng(ne.Lat + delta, ne.Lng + delta);
                        sw = new LatLng(sw.Lat - delta, sw.Lng - delta);
                    }

                    computedBounds = new LatLngBounds(ne, sw);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error computing GeoJSON bounds locally: {ex.Message}");
            }

            var options = new GeoJsonLayerOptions(
                )
            {
                DebugLogging = true, // enable JS-side debug logging to help diagnose bounds/loading
                MultipleFeatureSelection = multiSelectEnabled,
                EnableHoverStyle = true,
                HoverStyle = new PathOptions
                {
                    Color = "orange",
                    Weight = 3,
                    Opacity = 1.0
                },
                SelectedFeatureStyle = new PathOptions
                {
                    Color = "purple",
                    Weight = 4,
                    FillColor = "purple",
                    FillOpacity = 0.6,
                    Opacity = 1.0
                }
            };

            GeoJsonLayer = new GeoJsonLayer(geoJsonObject, options);

            // Sync selection count when JS notifies of selection changes
            GeoJsonLayer.OnSelectionChanged += (s, e) =>
            {
                if (GeoJsonLayer != null)
                {
                    selectedCount = GeoJsonLayer.GetSelectedFeaturesCount();
                    StateHasChanged();
                }
            };

            // Subscribe to selection events
            GeoJsonLayer.OnFeatureSelected += (sender, args) =>
            {
                if (args?.Feature != null && GeoJsonLayer != null)
                {
                    selectedCount = GeoJsonLayer.GetSelectedFeaturesCount();
                    Console.WriteLine($"Feature selected. Total selected: {selectedCount}");

                    // Log selected feature IDs
                    var selectedIds = GeoJsonLayer.GetSelectedFeatureIds();
                    Console.WriteLine($"Selected IDs: {string.Join(", ", selectedIds.Where(id => id != null))}");

                    // Check if specific feature is selected
                    if (args.Feature.Id != null)
                    {
                        var isSelected = GeoJsonLayer.IsFeatureSelected(args.Feature.Id);
                        Console.WriteLine($"Feature {args.Feature.Id} is selected: {isSelected}");
                    }

                    StateHasChanged();
                }
            };

            GeoJsonLayer.OnFeatureUnselected += (sender, args) =>
            {
                if (GeoJsonLayer != null)
                {
                    selectedCount = GeoJsonLayer.GetSelectedFeaturesCount();
                    Console.WriteLine($"Feature unselected. Total selected: {selectedCount}");

                    if (GeoJsonLayer.HasSelectedFeatures())
                    {
                        var selectedFeatures = GeoJsonLayer.GetSelectedFeatures();
                        Console.WriteLine($"Remaining features: {selectedFeatures.Count}");
                    }
                    else
                    {
                        Console.WriteLine("No features selected");
                    }

                    StateHasChanged();
                }
            };

            GeoJsonLayer.OnFeatureClicked += (sender, args) =>
            {
                if (args?.Feature?.Properties != null)
                {
                    Console.WriteLine($"Feature clicked: {JsonSerializer.Serialize(args.Feature.Properties)}");
                }
            };

            await GeoJsonLayer.AddTo(PositionMap);
            // Ensure the GeoJSON data is added via the interop wrapper so bounds are available immediately
            // (the JS implementation may add initial data asynchronously when provided to the constructor)
            // Listen for a layeradd event to know when features are being added to the feature group
            TaskCompletionSource<bool>? layerAddTcs = null;
            EventHandler<PyroGeoBlazor.Leaflet.EventArgs.LeafletLayerEventArgs>? layerAddHandler = null;
            try
            {
                layerAddTcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
                layerAddHandler = (s, e) => layerAddTcs.TrySetResult(true);
                GeoJsonLayer.OnLayerAdd += layerAddHandler;

                await GeoJsonLayer.AddData(geoJsonObject!);

                // Wait up to 3s for the first layeradd event before falling back to polling bounds
                var signalled = await Task.WhenAny(layerAddTcs.Task, Task.Delay(3000)) == layerAddTcs.Task;
                if (!signalled)
                {
                    Console.WriteLine("Warning: did not receive layeradd event within timeout; will poll for bounds.");
                }
            }
            finally
            {
                if (layerAddHandler != null)
                {
                    GeoJsonLayer.OnLayerAdd -= layerAddHandler;
                }
            }
            await LayersControl.AddOverlay(GeoJsonLayer, "GeoJSON (Townships)");
            // Ensure JS and .NET selection state are reconciled by applying current toggle settings
            await GeoJsonLayer.SetEnableFeatureSelection(selectionEnabled);
            await GeoJsonLayer.SetMultipleFeatureSelection(multiSelectEnabled);

            // Zoom and pan the map to the bounds of the newly added GeoJSON layer.
            try
            {
                if (PositionMap != null)
                {
                    if (computedBounds != null)
                    {
                        Console.WriteLine($"Computed server-side bounds NE={computedBounds.NorthEast}, SW={computedBounds.SouthWest}");
                        await PositionMap.FitBounds(computedBounds);
                    }
                    else if (GeoJsonLayer != null)
                    {
                        // Fallback: try getting bounds from the JS layer (retry a few times)
                        LatLngBounds? bounds = null;
                        const int maxAttempts = 10;
                        for (int attempt = 0; attempt < maxAttempts; attempt++)
                        {
                            bounds = await GeoJsonLayer.GetBounds();
                            Console.WriteLine($"GetBounds attempt {attempt}: bounds={(bounds == null ? "null" : bounds.ToString())}");
                            if (bounds?.NorthEast != null && bounds?.SouthWest != null)
                            {
                                // If NE and SW are the same point, bounds are probably empty/not ready
                                if (!(bounds.NorthEast.Lat == bounds.SouthWest.Lat && bounds.NorthEast.Lng == bounds.SouthWest.Lng))
                                {
                                    await PositionMap.FitBounds(bounds);
                                    break;
                                }
                            }
                            await Task.Delay(100);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fitting map to GeoJSON bounds: {ex.Message}");
            }

            geoJsonLayerAdded = true;
            Console.WriteLine("GeoJSON layer loaded successfully");
            // Refresh selected count (JS will also invoke selectionchanged which triggers the OnSelectionChanged handler)
            selectedCount = GeoJsonLayer?.GetSelectedFeaturesCount() ?? 0;
            StateHasChanged();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error loading GeoJSON: {ex.Message}");
        }
    }

    private async Task ToggleSelection(bool enabled)
    {
        selectionEnabled = enabled;

        if (GeoJsonLayer != null)
        {
            try
            {
                await GeoJsonLayer.SetEnableFeatureSelection(selectionEnabled);

                // If disabling selection, clear any existing selections immediately
                if (!selectionEnabled)
                {
                    await GeoJsonLayer.ClearSelection();
                    selectedCount = 0;
                }
                else
                {
                    // Refresh selected count from layer (JS will also sync state back to C#)
                    selectedCount = GeoJsonLayer.GetSelectedFeaturesCount();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error toggling feature selection: {ex.Message}");
            }
        }

        StateHasChanged();
    }

    private async Task ToggleMultiSelect(bool enabled)
    {
        multiSelectEnabled = enabled;

        if (GeoJsonLayer != null)
        {
            try
            {
                await GeoJsonLayer.SetMultipleFeatureSelection(multiSelectEnabled);

                // Optionally clear selection when switching modes to avoid confusion
                await GeoJsonLayer.ClearSelection();
                selectedCount = 0;
                Console.WriteLine($"Multi-select mode changed to: {multiSelectEnabled}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting multiple selection mode: {ex.Message}");
            }
        }

        StateHasChanged();
    }

    private async Task ClearSelection()
    {
        if (GeoJsonLayer != null)
        {
            await GeoJsonLayer.ClearSelection();
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
