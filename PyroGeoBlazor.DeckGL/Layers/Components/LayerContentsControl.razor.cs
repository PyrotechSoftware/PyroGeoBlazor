namespace PyroGeoBlazor.DeckGL.Components;

using Microsoft.AspNetCore.Components;

using MudBlazor;
using MudBlazor.Extensions;
using MudBlazor.Extensions.Options;
using MudBlazor.Utilities;

using PyroGeoBlazor.DeckGL.Models;
using PyroGeoBlazor.Utilities;

/// <summary>
/// Component for displaying and managing layer contents in a tree view with drag-and-drop reordering.
/// </summary>
public partial class LayerContentsControl
{
    private List<LayerConfig> Layers => DeckGLView?.Layers.ToList() ?? [];
    private List<LayerConfig> LayersReverse => Layers.AsEnumerable().Reverse().ToList();

    /// <summary>
    /// Reference to the DeckGLView component. The LayerContentsControl will read layers
    /// and interact directly with the DeckGLView.
    /// </summary>
    [Parameter, EditorRequired]
    public DeckGLView? DeckGLView { get; set; }

    /// <summary>
    /// Controls whether the layer control UI is locked (read-only).
    /// When true, users cannot:
    /// - Reorder layers (drag and drop disabled)
    /// - Toggle layer visibility (checkboxes disabled)
    /// - Change layer symbology/colors (color picker disabled)
    /// 
    /// This is independent of LayerConfig.IsEditable which controls whether
    /// individual layer's feature data can be edited.
    /// </summary>
    [Parameter]
    public bool IsLocked { get; set; }

    [Inject]
    private IDialogService DialogService { get; set; } = default!;

    private async Task OnVisibilityToggled(string layerId, bool newValue)
    {
        if (DeckGLView is not null)
        {
            await DeckGLView.SetLayerVisibility(layerId, newValue);
            StateHasChanged();
        }
    }

    private async Task OnDropHandler(MudItemDropInfo<LayerConfig> dropInfo)
    {
        if (IsLocked || dropInfo?.Item is null || DeckGLView is null)
        {
            return;
        }

        var source = Layers.IndexOf(dropInfo.Item);

        // Convert the drop index from reversed display order to original order
        var count = Layers.Count;
        var target = count - 1 - dropInfo.IndexInZone; // Mathematical inverse to get the correct index to move to.

        if (source >= 0 && target >= 0 && source != target)
        {
            await DeckGLView.MoveLayerToIndex(dropInfo.Item.Id, target);
            StateHasChanged();
        }
    }

    private string GetLayerColor(LayerConfig layer)
    {
        if (layer.FeatureStyle?.FillColor != null)
        {
            return layer.FeatureStyle.FillColor;
        }

        if (layer is GeoJsonLayerConfig geoJsonLayer)
        {
            if (geoJsonLayer.FillColor is not null)
            {
                return ColorUtilities.RGBToHex(geoJsonLayer.FillColor);
            }
        }

        return "#000000";
    }

    private bool IsLayerLocked(LayerConfig layer)
    {
        // IsLocked controls whether the CONTROL UI is locked (symbology changes, reordering, etc.)
        // This is independent of layer.IsEditable which controls feature data editing
        return IsLocked;
    }

    private async Task OpenColorPicker(LayerConfig layer)
    {
        // Don't open if locked
        if (IsLayerLocked(layer))
        {
            return;
        }

        var currentColor = GetLayerColor(layer);
        var mudColor = new MudColor(currentColor);

        var parameters = new DialogParameters<LayerColorPickerDialog>
        {
            { x => x.SelectedColor, mudColor },
            { x => x.DisableAlpha, false }
        };

        var options = new DialogOptionsEx
        {
            CloseButton = true,
            MaxWidth = MaxWidth.Small,
            FullWidth = false,
            DragMode = MudDialogDragMode.Simple,
            Position = DialogPosition.Center,
            Resizeable = true
        };

        var dialog = await DialogService.ShowExAsync<LayerColorPickerDialog>(
            $"Change Color - {layer.Id}",
            parameters,
            options);

        var result = await dialog.Result;

        if (result is not null && !result.Canceled && result.Data is MudColor newColor && DeckGLView is not null)
        {
            // Update the layer's feature style
            var hexColor = newColor.ToString(MudColorOutputFormats.Hex);
            var opacity = newColor.A / 255.0;

            var featureStyle = layer.FeatureStyle ?? new FeatureStyle();
            featureStyle.LineColor = hexColor;
            featureStyle.FillColor = hexColor;
            featureStyle.FillOpacity = opacity;
            featureStyle.Opacity = 1;

            // For GeoJsonLayerConfig, also update the direct FillColor and LineColor properties
            if (layer is GeoJsonLayerConfig geoJsonLayer)
            {
                var color = System.Drawing.ColorTranslator.FromHtml(hexColor);
                geoJsonLayer.FillColor = [color.R, color.G, color.B, (int)(opacity * 255)];
                geoJsonLayer.LineColor = [color.R, color.G, color.B, 255];
            }

            // Apply the new style to the layer
            await DeckGLView.SetLayerFeatureStyle(layer.Id, featureStyle);
            StateHasChanged();
        }
    }

    private async Task OnLayerZoomTo(LayerConfig layer)
    {
        if (DeckGLView is not null)
        {
            await DeckGLView.ZoomToLayer(layer.Id);
        }
    }

    private void OnDataDesign(LayerConfig layer)
    {
        // TODO: Implement Data Design functionality
        Console.WriteLine($"Data Design clicked for layer: {layer.Id}");
    }

    private bool HasLabelSupport(LayerConfig layer)
    {
        // Only layers with label configuration can toggle labels
        return layer.LabelConfig != null && 
               !string.IsNullOrEmpty(layer.LabelConfig.TextProperty);
    }

    private async Task OnToggleLabel(LayerConfig layer)
    {
        if (layer.LabelConfig == null || DeckGLView == null)
        {
            return;
        }

        // Toggle enabled state
        layer.LabelConfig.Enabled = !layer.LabelConfig.Enabled;
        
        Console.WriteLine($"Labels {(layer.LabelConfig.Enabled ? "enabled" : "disabled")} for layer: {layer.Id}");
        
        // Update layers to apply the label config change
        await DeckGLView.UpdateLayers();
        StateHasChanged();
    }
}
