namespace PyroGeoBlazor.DeckGL.Components;

using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

using MudBlazor;
using MudBlazor.Extensions.Components.ObjectEdit;

using PyroGeoBlazor.DeckGL.Models;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

public partial class FeatureSelectionControl : IDisposable
{
    /// <summary>
    /// Reference to the DeckGLView component. The FeatureSelectionControl will read layers
    /// and interact directly with the DeckGLView for all operations.
    /// </summary>
    [Parameter, EditorRequired] public DeckGLView? DeckGLView { get; set; }

    /// <summary>
    /// Optional list of property names to exclude from the attributes display
    /// </summary>
    [Parameter] public string[]? ExcludedProperties { get; set; }

    /// <summary>
    /// Callback when attribute changes are saved
    /// </summary>
    [Parameter] public EventCallback<(string LayerId, string FeatureId, AttributeEditContext EditContext)> OnAttributesSaved { get; set; }

    /// <summary>
    /// Callback when attribute changes are reset
    /// </summary>
    [Parameter] public EventCallback OnAttributesReset { get; set; }

    /// <summary>
    /// Optional dictionary of custom render fragments for specific fields.
    /// Key is the field name, value is a render fragment that receives the field context.
    /// Passed through to FeatureAttributesControl.
    /// </summary>
    [Parameter] public Dictionary<string, RenderFragment<FeatureAttributesControl.FieldRenderContext>>? CustomFieldRenderers { get; set; }

    /// <summary>
    /// Optional child content for declaratively defining custom field edit controls.
    /// Use CustomFieldEditControl components to define custom renderers for specific fields.
    /// </summary>
    [Parameter] public RenderFragment? EditTemplates { get; set; }

    private FieldTemplateContainer? _fieldTemplateContainer;
    private DeckGLView? _previousDeckGLView;
    private Dictionary<string, LayerConfig>? _cachedLayerConfigs;
    private bool _subscribed = false;

    // Get SelectionResult directly from DeckGLView
    private FeatureSelectionResult? SelectionResult => DeckGLView?.SelectionResult;

    // Build layer configs dictionary from DeckGLView.Layers (cached to avoid rebuilding on every access)
    private Dictionary<string, LayerConfig> LayerConfigs
    {
        get
        {
            if (_cachedLayerConfigs == null && DeckGLView?.Layers != null)
            {
                _cachedLayerConfigs = DeckGLView.Layers.ToDictionary(l => l.Id, l => l);
            }
            return _cachedLayerConfigs ?? [];
        }
    }

    private record LayerGrouping(string LayerId, List<SelectedFeature> Features);

    private SelectedFeature? clickedFeature;

    // Context menu state
    private string? currentLayerContextMenu;
    private (SelectedFeature Feature, string LayerId)? currentFeatureContextMenu;
    private double contextMenuX;
    private double contextMenuY;

    protected override void OnParametersSet()
    {
        // Handle DeckGLView reference changes
        if (_previousDeckGLView != DeckGLView)
        {
            // Unsubscribe from old DeckGLView
            if (_previousDeckGLView != null)
            {
                _previousDeckGLView.SelectionChanged -= OnSelectionChanged;
                Console.WriteLine($"[FeatureSelectionControl] Unsubscribed from old DeckGLView");
            }

            // Clear subscription flag
            _subscribed = false;
            
            // Clear cached layer configs when DeckGLView changes
            _cachedLayerConfigs = null;
            _previousDeckGLView = DeckGLView;
        }
        
        // Try to subscribe if we haven't already (handles case where DeckGLView becomes available)
        EnsureSubscribed();
    }

    protected override void OnAfterRender(bool firstRender)
    {
        base.OnAfterRender(firstRender);
        
        // Try to subscribe on every render until we succeed
        // This handles the case where DeckGLView is passed later
        EnsureSubscribed();
    }

    private void EnsureSubscribed()
    {
        // Subscribe to DeckGLView if we haven't already and it's available
        if (!_subscribed && DeckGLView != null)
        {
            DeckGLView.SelectionChanged += OnSelectionChanged;
            _subscribed = true;
            Console.WriteLine($"[FeatureSelectionControl] ✅ Subscribed to DeckGLView.SelectionChanged");
        }
    }

    private void OnSelectionChanged(FeatureSelectionResult result)
    {
        Console.WriteLine($"[FeatureSelectionControl] Selection changed: {result.FeatureCount} features across {result.Features.GroupBy(f => f.LayerId).Count()} layers");
        
        // Log feature details
        foreach (var feature in result.Features)
        {
            Console.WriteLine($"  - Layer: {feature.LayerId}");
        }
        
        // Trigger re-render when selection changes in DeckGLView
        InvokeAsync(() =>
        {
            StateHasChanged();
            Console.WriteLine($"[FeatureSelectionControl] StateHasChanged called, SelectionResult has {SelectionResult?.FeatureCount ?? 0} features");
        });
    }

    public void Dispose()
    {
        // Unsubscribe from DeckGLView events to prevent memory leaks
        if (DeckGLView != null && _subscribed)
        {
            DeckGLView.SelectionChanged -= OnSelectionChanged;
            Console.WriteLine($"[FeatureSelectionControl] 🧹 Unsubscribed and disposed");
        }
    }

    private List<LayerGrouping> GetGroupedFeatures()
    {
        return SelectionResult?.Features == null || SelectionResult.Features.Length == 0
            ? []
            : [.. SelectionResult.Features
            .GroupBy(f => f.LayerId)
            .Select(g => new LayerGrouping(g.Key, [.. g]))
            .OrderBy(g => g.LayerId)];
    }

    private string GetFeatureDisplayName(SelectedFeature feature, string layerId)
    {
        // Get the layer config if available
        var layerConfig = LayerConfigs?.GetValueOrDefault(layerId);

        // Try to get display property first
        if (!string.IsNullOrEmpty(layerConfig?.DisplayProperty))
        {
            var displayValue = GetPropertyValue(feature.Feature, layerConfig.DisplayProperty);
            if (!string.IsNullOrEmpty(displayValue))
                return displayValue;
        }

        // Fall back to unique ID property
        if (!string.IsNullOrEmpty(layerConfig?.UniqueIdProperty))
        {
            var idValue = GetPropertyValue(feature.Feature, layerConfig.UniqueIdProperty);
            if (!string.IsNullOrEmpty(idValue))
                return idValue;
        }

        // Try common properties
        var commonProps = new[] { "name", "title", "label", "id", "ID", "CustomIdentifier", "OBJECTID" };
        foreach (var prop in commonProps)
        {
            var value = GetPropertyValue(feature.Feature, prop);
            if (!string.IsNullOrEmpty(value))
                return value;
        }

        // Last resort: return a generic name with index
        return $"Feature";
    }

    private string? GetPropertyValue(JsonElement feature, string propertyName)
    {
        try
        {
            // Try to get from properties object
            if (feature.TryGetProperty("properties", out var properties) &&
                properties.TryGetProperty(propertyName, out var propValue))
            {
                return propValue.ToString();
            }

            // Try to get directly from feature
            if (feature.TryGetProperty(propertyName, out var directValue))
            {
                return directValue.ToString();
            }
        }
        catch
        {
            // Ignore errors and return null
        }

        return null;
    }

    private string GetFeatureId(SelectedFeature feature, string layerId)
    {
        // Get the layer config if available
        var layerConfig = LayerConfigs?.GetValueOrDefault(layerId);

        // Try unique ID property first
        if (!string.IsNullOrEmpty(layerConfig?.UniqueIdProperty))
        {
            var idValue = GetPropertyValue(feature.Feature, layerConfig.UniqueIdProperty);
            if (!string.IsNullOrEmpty(idValue))
            {
                Console.WriteLine($"[FeatureSelectionControl] Using UniqueIdProperty '{layerConfig.UniqueIdProperty}': {idValue}");
                return idValue;
            }
        }

        // Try common ID properties
        var commonProps = new[] { "id", "ID", "CustomIdentifier", "OBJECTID", "fid", "FID" };
        foreach (var prop in commonProps)
        {
            var value = GetPropertyValue(feature.Feature, prop);
            if (!string.IsNullOrEmpty(value))
            {
                Console.WriteLine($"[FeatureSelectionControl] Using common property '{prop}': {value}");
                return value;
            }
        }

        Console.WriteLine($"[FeatureSelectionControl] ⚠️ No ID found for feature in layer {layerId}");
        Console.WriteLine($"[FeatureSelectionControl] Feature JSON: {feature.Feature}");
        return string.Empty;
    }

    private async Task OnFeatureClickInternal(SelectedFeature feature)
    {
        // Update the clicked feature for attributes display
        clickedFeature = feature;
        StateHasChanged();
    }

    private async Task OnFeatureFlash(SelectedFeature feature, string layerId)
    {
        if (DeckGLView != null)
        {
            var featureId = GetFeatureId(feature, layerId);
            if (!string.IsNullOrEmpty(featureId))
            {
                await DeckGLView.FlashFeature(layerId, featureId);
            }
        }
    }

    private async Task OnFeatureZoomTo(SelectedFeature feature, string layerId)
    {
        if (DeckGLView != null)
        {
            var featureId = GetFeatureId(feature, layerId);
            if (!string.IsNullOrEmpty(featureId))
            {
                await DeckGLView.ZoomToFeature(layerId, featureId);
            }
        }
    }

    private async Task OnFeatureUnselect(SelectedFeature feature, string layerId)
    {
        if (DeckGLView != null)
        {
            var featureId = GetFeatureId(feature, layerId);
            if (!string.IsNullOrEmpty(featureId))
            {
                await DeckGLView.UnselectFeature(featureId);
                StateHasChanged();
            }
        }
    }

    private async Task OnLayerZoomTo(string layerId)
    {
        if (DeckGLView != null && SelectionResult != null)
        {
            // Get all features for this layer
            var layerFeatures = SelectionResult.Features
                .Where(f => f.LayerId == layerId)
                .ToArray();

            if (layerFeatures.Length > 0)
            {
                await DeckGLView.ZoomToSelectedFeatures(layerFeatures);
            }
        }
    }

    private async Task OnLayerClearSelection(string layerId)
    {
        if (DeckGLView != null)
        {
            await DeckGLView.ClearLayerSelection(layerId);
            StateHasChanged();
        }
    }

    // Context menu methods
    private void OpenLayerContextMenu(MouseEventArgs e, string layerId)
    {
        currentLayerContextMenu = layerId;
        currentFeatureContextMenu = null;
        contextMenuX = e.ClientX;
        contextMenuY = e.ClientY;
        StateHasChanged();
    }

    private void OpenFeatureContextMenu(MouseEventArgs e, SelectedFeature feature, string layerId)
    {
        currentFeatureContextMenu = (feature, layerId);
        currentLayerContextMenu = null;
        contextMenuX = e.ClientX;
        contextMenuY = e.ClientY;
        StateHasChanged();
    }

    private bool IsFeatureContextMenuOpen(SelectedFeature feature, string layerId)
    {
        return currentFeatureContextMenu.HasValue &&
               currentFeatureContextMenu.Value.Feature == feature &&
               currentFeatureContextMenu.Value.LayerId == layerId;
    }

    private void CloseContextMenu()
    {
        currentLayerContextMenu = null;
        currentFeatureContextMenu = null;
        StateHasChanged();
    }

    private string GetPopoverStyle()
    {
        return $"position: fixed; left: {contextMenuX}px; top: {contextMenuY}px;";
    }

    /// <summary>
    /// Determines if the currently clicked feature's layer is locked (not editable)
    /// </summary>
    private bool IsClickedFeatureLocked()
    {
        if (clickedFeature == null || LayerConfigs == null)
            return false;

        // Get the layer config for the clicked feature's layer
        if (LayerConfigs.TryGetValue(clickedFeature.LayerId, out var layerConfig))
        {
            // Return the inverse of IsEditable (if not editable, it's locked)
            return !layerConfig.IsEditable;
        }

        // Default to locked if we can't find the layer config (safe default)
        return true;
    }

    /// <summary>
    /// Gets the editable fields configuration for the currently clicked feature's layer
    /// </summary>
    private List<AttributeFieldConfig>? GetEditableFieldsConfig()
    {
        if (clickedFeature == null || LayerConfigs == null)
            return null;

        // Get the layer config for the clicked feature's layer
        if (LayerConfigs.TryGetValue(clickedFeature.LayerId, out var layerConfig))
        {
            return layerConfig.EditableFields;
        }

        return null;
    }

    /// <summary>
    /// Gets the effective excluded properties list, combining the explicit parameter with layer config.
    /// If ExcludedProperties parameter is set, it takes precedence.
    /// Otherwise, uses the ExcludedProperties from the layer config.
    /// </summary>
    private string[]? GetEffectiveExcludedProperties()
    {
        // If explicitly set via parameter, use that
        if (ExcludedProperties != null && ExcludedProperties.Length > 0)
            return ExcludedProperties;

        // Otherwise, try to get from layer config
        if (clickedFeature != null && LayerConfigs != null)
        {
            if (LayerConfigs.TryGetValue(clickedFeature.LayerId, out var layerConfig))
            {
                return layerConfig.ExcludedProperties;
            }
        }

        return null;
    }

    /// <summary>
    /// Handles attribute save callback from FeatureAttributesControl
    /// </summary>
    private async Task HandleAttributesSaved(AttributeEditContext editContext)
    {
        if (clickedFeature == null || !OnAttributesSaved.HasDelegate)
            return;

        // Get the feature ID
        var featureId = GetFeatureId(clickedFeature, clickedFeature.LayerId);
        if (string.IsNullOrEmpty(featureId))
        {
            Console.WriteLine("Cannot save attributes: No feature ID found");
            return;
        }

        // Invoke the parent callback with layer ID, feature ID, and edit context
        await OnAttributesSaved.InvokeAsync((clickedFeature.LayerId, featureId, editContext));
    }

    /// <summary>
    /// Handles attribute reset callback from FeatureAttributesControl
    /// </summary>
    private async Task HandleAttributesReset()
    {
        if (OnAttributesReset.HasDelegate)
        {
            await OnAttributesReset.InvokeAsync();
        }
    }

    /// <summary>
    /// Merges custom field renderers from both the dictionary parameter and EditTemplates child content.
    /// EditTemplates (declarative) takes precedence over dictionary entries.
    /// </summary>
    private Dictionary<string, RenderFragment<FeatureAttributesControl.FieldRenderContext>>? GetMergedCustomRenderers()
    {
        var merged = new Dictionary<string, RenderFragment<FeatureAttributesControl.FieldRenderContext>>();

        // Add dictionary-based renderers first
        if (CustomFieldRenderers != null)
        {
            foreach (var kvp in CustomFieldRenderers)
            {
                merged[kvp.Key] = kvp.Value;
            }
        }

        // Add template-based renderers (these override dictionary entries)
        if (_fieldTemplateContainer?.FieldTemplates != null)
        {
            foreach (var kvp in _fieldTemplateContainer.FieldTemplates)
            {
                merged[kvp.Key] = kvp.Value;
            }
        }

        return merged.Count > 0 ? merged : null;
    }
}
