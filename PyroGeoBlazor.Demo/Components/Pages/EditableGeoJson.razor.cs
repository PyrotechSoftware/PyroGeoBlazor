namespace PyroGeoBlazor.Demo.Components.Pages;

using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

using PyroGeoBlazor.Leaflet.Models;

public partial class EditableGeoJson : ComponentBase, IAsyncDisposable
{
    [Inject]
    private IJSRuntime JS { get; set; } = default!;

    protected Map? PositionMap;
    protected TileLayer OpenStreetMapsTileLayer;
    protected TileLayer SatelliteTileLayer;
    protected EditableGeoJsonLayer? EditableLayer;
    protected LayersControl LayersControl;
    protected List<Control> MapControls = [];
    
    private PyroGeoBlazor.Leaflet.Models.EditingControl? editingControl;
    private bool isDrawing = false;
    private int selectedCount = 0;

    public EditableGeoJson()
    {
        var mapCentre = new LatLng(-42, 175); // Centred on New Zealand
        PositionMap = new Map("editableGeoJsonMap", new MapOptions
        {
            Center = mapCentre,
            Zoom = 6,
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
                    @"<a href=""https://creativecommons.org/licenses/by-sa/2.0/"">CC-BY-SA</a>",
                MinZoom = 0,
                MaxZoom = 25
            }
        );

        SatelliteTileLayer = new TileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            new TileLayerOptions
            {
                Attribution = @"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
                MinZoom = 0,
                MaxZoom = 25
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

    private async Task HandleMapReady()
    {
        // Map is fully initialized and ready to use
        // Add base layers to the control now
        if (PositionMap != null)
        {
            await OpenStreetMapsTileLayer.AddTo(PositionMap);
            await SatelliteTileLayer.AddTo(PositionMap);
            await LayersControl.AddBaseLayer(OpenStreetMapsTileLayer, "Street Map");
            await LayersControl.AddBaseLayer(SatelliteTileLayer, "Satellite");
        }
        
        await AddEditableLayer();
        await StartEditing();
    }

    private async Task AddEditableLayer()
    {
        if (PositionMap == null)
        {
            return;
        }

        try
        {
            var options = new EditableGeoJsonLayerOptions
            {
                EnableFeatureSelection = true,
                MultipleFeatureSelection = true,
                EnableHoverStyle = true,
                DrawingStyle = new PathOptions
                {
                    Color = "#ff7800",
                    Weight = 3,
                    Opacity = 0.8,
                    FillOpacity = 0.3,
                    DashArray = "5, 5"
                },
                EditingStyle = new PathOptions
                {
                    Color = "#ff0000",
                    Weight = 3,
                    Opacity = 1.0,
                    FillOpacity = 0.4
                },
                SelectedFeatureStyle = new PathOptions
                {
                    Color = "purple",
                    Weight = 4,
                    FillColor = "purple",
                    FillOpacity = 0.6,
                    Opacity = 1.0
                },
                HoverStyle = new PathOptions
                {
                    Color = "orange",
                    Weight = 3,
                    Opacity = 1.0
                },
                EnableSnapping = true,
                SnapDistance = 15,
                ShowDrawingGuides = true,
                AllowDoubleClickFinish = true
            };

            EditableLayer = new EditableGeoJsonLayer(null, options);

            // Subscribe to events
            EditableLayer.OnFeatureSelected += async (sender, args) =>
            {
                if (EditableLayer != null)
                {
                    selectedCount = EditableLayer.GetSelectedFeaturesCount();
                    if (editingControl != null)
                    {
                        await editingControl.SetSelectedCount(selectedCount);
                    }
                    await InvokeAsync(StateHasChanged);
                }
            };

            EditableLayer.OnFeatureUnselected += async (sender, args) =>
            {
                if (EditableLayer != null)
                {
                    selectedCount = EditableLayer.GetSelectedFeaturesCount();
                    if (editingControl != null)
                    {
                        await editingControl.SetSelectedCount(selectedCount);
                    }
                    await InvokeAsync(StateHasChanged);
                }
            };

            EditableLayer.OnDrawingCancelled += async (sender, args) =>
            {
                isDrawing = false;
                if (editingControl != null)
                {
                    await editingControl.SetDrawing(false);
                }
                await InvokeAsync(StateHasChanged);
            };

            await EditableLayer.AddTo(PositionMap);
            await LayersControl.AddOverlay(EditableLayer, "Editable Layer");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating layer: {ex}");
        }
    }

    private async Task StartEditing()
    {
        if (EditableLayer != null && PositionMap != null)
        {
            await EditableLayer.StartEditing();
            
            // Create and add Leaflet control using the proper Control infrastructure
            if (editingControl == null)
            {
                try
                {
                    editingControl = new PyroGeoBlazor.Leaflet.Models.EditingControl("bottomleft");
                    
                    editingControl.OnPolygonClick += async (s, e) => await DrawPolygon();
                    editingControl.OnLineClick += async (s, e) => await DrawLine();
                    editingControl.OnConfirmClick += async (s, e) => await ConfirmDrawing();
                    editingControl.OnCancelClick += async (s, e) => await CancelDrawing();
                    editingControl.OnDeleteClick += async (s, e) => await DeleteSelected();
                    
                    await PositionMap.AddControl(editingControl);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"ERROR creating control: {ex.Message}");
                }
            }
            
            await InvokeAsync(StateHasChanged);
        }
    }

    private async Task DrawPolygon()
    {
        if (EditableLayer != null && editingControl != null)
        {
            await EditableLayer.AddPolygon();
            isDrawing = true;
            await editingControl.SetDrawing(true);
            await InvokeAsync(StateHasChanged);
        }
    }

    private async Task DrawLine()
    {
        if (EditableLayer != null && editingControl != null)
        {
            await EditableLayer.AddLine();
            isDrawing = true;
            await editingControl.SetDrawing(true);
            await InvokeAsync(StateHasChanged);
        }
    }

    private async Task ConfirmDrawing()
    {
        if (EditableLayer != null && editingControl != null)
        {
            await EditableLayer.ConfirmDrawing();
            isDrawing = false;
            await editingControl.SetDrawing(false);
            await InvokeAsync(StateHasChanged);
        }
    }

    private async Task CancelDrawing()
    {
        if (EditableLayer != null && editingControl != null)
        {
            await EditableLayer.CancelDrawing();
            isDrawing = false;
            await editingControl.SetDrawing(false);
            await InvokeAsync(StateHasChanged);
        }
    }

    private async Task DeleteSelected()
    {
        if (EditableLayer != null && editingControl != null)
        {
            await EditableLayer.DeleteSelectedFeatures();
            await InvokeAsync(StateHasChanged);
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (editingControl != null)
        {
            await editingControl.DisposeAsync();
        }
        
        await OpenStreetMapsTileLayer.DisposeAsync();
        if (PositionMap != null)
        {
            await PositionMap.DisposeAsync();
        }

        GC.SuppressFinalize(this);
    }
}
