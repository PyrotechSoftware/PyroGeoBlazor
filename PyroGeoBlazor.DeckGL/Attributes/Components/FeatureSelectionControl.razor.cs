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
    /// Callback when attribute changes are saved.
    /// For single feature: (string LayerId, string FeatureId, AttributeEditContext EditContext)
    /// For multi-feature: (List<(string LayerId, string FeatureId)> Features, MultiFeatureEditContext EditContext)
    /// </summary>
    [Parameter] public EventCallback<object> OnAttributesSaved { get; set; }

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
    
    // Multi-select state
    private readonly HashSet<(string LayerId, string FeatureId)> _multiSelectedFeatures = new();
    private List<SelectedFeature>? _multiSelectedFeatureList;

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
        
        // Reconcile multi-selection state with the new SelectionResult
        // Remove any features from multi-select that are no longer in the SelectionResult
        var currentSelectionIds = new HashSet<(string LayerId, string FeatureId)>();
        foreach (var feature in result.Features)
        {
            var featureId = GetFeatureId(feature, feature.LayerId);
            if (!string.IsNullOrEmpty(featureId))
            {
                currentSelectionIds.Add((feature.LayerId, featureId));
            }
        }
        
        // Remove features from multi-selection that are no longer selected
        var featuresToRemove = _multiSelectedFeatures
            .Where(f => !currentSelectionIds.Contains(f))
            .ToList();
            
        foreach (var feature in featuresToRemove)
        {
            _multiSelectedFeatures.Remove(feature);
            Console.WriteLine($"[FeatureSelectionControl] Removed {feature.FeatureId} from multi-select (no longer in SelectionResult)");
        }
        
        // Update the multi-selected feature list
        if (_multiSelectedFeatures.Count > 0)
        {
            UpdateMultiSelectedFeatureList();
        }
        else
        {
            _multiSelectedFeatureList = null;
        }
        
        // Clear clicked feature if it's no longer in the selection
        if (clickedFeature != null)
        {
            var clickedId = GetFeatureId(clickedFeature, clickedFeature.LayerId);
            if (!string.IsNullOrEmpty(clickedId) && !currentSelectionIds.Contains((clickedFeature.LayerId, clickedId)))
            {
                clickedFeature = null;
                Console.WriteLine($"[FeatureSelectionControl] Cleared clicked feature (no longer in SelectionResult)");
            }
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

    private async Task OnFeatureClickInternal(SelectedFeature feature, MouseEventArgs? e = null)
    {
        // For multi-selection, we need a feature ID
        if (e?.CtrlKey == true)
        {
            var featureId = GetFeatureId(feature, feature.LayerId);
            if (string.IsNullOrEmpty(featureId))
            {
                Console.WriteLine($"[FeatureSelectionControl] Cannot identify feature for multi-select - feature has no ID");
                // Fall through to normal single-select behavior
            }
            else
            {
                var featureKey = (feature.LayerId, featureId);
                
                // Check if we already have features selected from a different layer
                if (_multiSelectedFeatures.Count > 0)
                {
                    var firstSelectedLayer = _multiSelectedFeatures.First().LayerId;
                    if (firstSelectedLayer != feature.LayerId)
                    {
                        // Trying to multi-select from a different layer - clear previous selection and start fresh
                        Console.WriteLine($"[FeatureSelectionControl] Cannot multi-select across layers. Clearing previous selection from '{firstSelectedLayer}' and starting new selection in '{feature.LayerId}'");
                        _multiSelectedFeatures.Clear();
                    }
                }
                
                // Ctrl+Click: Toggle multi-selection
                if (_multiSelectedFeatures.Contains(featureKey))
                {
                    _multiSelectedFeatures.Remove(featureKey);
                    Console.WriteLine($"[FeatureSelectionControl] Removed feature from multi-select: {featureId}");
                }
                else
                {
                    _multiSelectedFeatures.Add(featureKey);
                    Console.WriteLine($"[FeatureSelectionControl] Added feature to multi-select: {featureId}");
                }

                // Update the multi-selected feature list
                UpdateMultiSelectedFeatureList();
                StateHasChanged();
                return;
            }
        }

        // Normal click: Clear multi-selection and set single clicked feature
        _multiSelectedFeatures.Clear();
        _multiSelectedFeatureList = null;
        clickedFeature = feature;
        Console.WriteLine($"[FeatureSelectionControl] Single-select feature");

        StateHasChanged();
    }

    private void UpdateMultiSelectedFeatureList()
    {
        if (_multiSelectedFeatures.Count == 0)
        {
            _multiSelectedFeatureList = null;
            return;
        }

        if (SelectionResult == null)
        {
            _multiSelectedFeatureList = null;
            return;
        }

        _multiSelectedFeatureList = new List<SelectedFeature>();
        
        foreach (var feature in SelectionResult.Features)
        {
            var featureId = GetFeatureId(feature, feature.LayerId);
            if (!string.IsNullOrEmpty(featureId) && _multiSelectedFeatures.Contains((feature.LayerId, featureId)))
            {
                _multiSelectedFeatureList.Add(feature);
            }
        }

        Console.WriteLine($"[FeatureSelectionControl] Updated multi-select list: {_multiSelectedFeatureList.Count} features");
    }

    private bool IsFeatureMultiSelected(SelectedFeature feature, string layerId)
    {
        var featureId = GetFeatureId(feature, layerId);
        if (string.IsNullOrEmpty(featureId))
            return false;

        return _multiSelectedFeatures.Contains((layerId, featureId));
    }

    private string GetFeatureStyle(SelectedFeature feature, string layerId)
    {
        var isSelected = IsFeatureMultiSelected(feature, layerId);
        return isSelected 
            ? "cursor: pointer; background-color: var(--mud-palette-action-selected);" 
            : "cursor: pointer;";
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
                // Call DeckGLView to unselect (this will also update the visual highlighting)
                // This will trigger OnFeaturesSelected callback which will update SelectionResult
                // and trigger OnSelectionChanged, which will clean up multi-selection state
                await DeckGLView.UnselectFeature(featureId);
                
                // StateHasChanged will be called by OnSelectionChanged
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

    private void OnLayerClick(string layerId)
    {
        if (SelectionResult == null)
            return;

        Console.WriteLine($"[FeatureSelectionControl] Layer clicked: {layerId}");

        // Get all features in this layer
        var layerFeatures = SelectionResult.Features
            .Where(f => f.LayerId == layerId)
            .ToList();

        if (layerFeatures.Count == 0)
        {
            Console.WriteLine($"[FeatureSelectionControl] No features found in layer {layerId}");
            return;
        }

        // Clear any existing multi-selection and clicked feature
        _multiSelectedFeatures.Clear();
        clickedFeature = null;

        // Add all features from this layer to multi-selection
        foreach (var feature in layerFeatures)
        {
            var featureId = GetFeatureId(feature, layerId);
            if (!string.IsNullOrEmpty(featureId))
            {
                _multiSelectedFeatures.Add((layerId, featureId));
            }
        }

        Console.WriteLine($"[FeatureSelectionControl] Selected all {_multiSelectedFeatures.Count} features in layer {layerId}");

        // Update the multi-selected feature list
        UpdateMultiSelectedFeatureList();
        StateHasChanged();
    }

    private async Task OnLayerClearSelection(string layerId)
    {
        if (DeckGLView != null)
        {
            // Call DeckGLView to clear layer selection
            // This will trigger OnFeaturesSelected callback which will update SelectionResult
            // and trigger OnSelectionChanged, which will clean up multi-selection state
            await DeckGLView.ClearLayerSelection(layerId);
            
            // StateHasChanged will be called by OnSelectionChanged
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
    /// Determines if the currently clicked feature's (or multi-selected features') layer is locked (not editable)
    /// </summary>
    private bool IsClickedFeatureLocked()
    {
        if (LayerConfigs == null)
            return false;

        // In multi-select mode, check the first selected feature's layer
        if (_multiSelectedFeatureList != null && _multiSelectedFeatureList.Count > 0)
        {
            var firstFeature = _multiSelectedFeatureList[0];
            if (LayerConfigs.TryGetValue(firstFeature.LayerId, out var layerConfig))
            {
                return !layerConfig.IsEditable;
            }
        }
        // In single-select mode, check the clicked feature's layer
        else if (clickedFeature != null)
        {
            if (LayerConfigs.TryGetValue(clickedFeature.LayerId, out var layerConfig))
            {
                return !layerConfig.IsEditable;
            }
        }

        // Default to locked if we can't find the layer config (safe default)
        return true;
    }

    /// <summary>
    /// Gets the editable fields configuration for the currently clicked feature's (or multi-selected features') layer
    /// </summary>
    private List<AttributeFieldConfig>? GetEditableFieldsConfig()
    {
        if (LayerConfigs == null)
            return null;

        // In multi-select mode, use the first selected feature's layer config
        if (_multiSelectedFeatureList != null && _multiSelectedFeatureList.Count > 0)
        {
            var firstFeature = _multiSelectedFeatureList[0];
            if (LayerConfigs.TryGetValue(firstFeature.LayerId, out var layerConfig))
            {
                return layerConfig.EditableFields;
            }
        }
        // In single-select mode, use the clicked feature's layer config
        else if (clickedFeature != null)
        {
            if (LayerConfigs.TryGetValue(clickedFeature.LayerId, out var layerConfig))
            {
                return layerConfig.EditableFields;
            }
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

        // In multi-select mode, use the first selected feature's layer config
        if (_multiSelectedFeatureList != null && _multiSelectedFeatureList.Count > 0 && LayerConfigs != null)
        {
            var firstFeature = _multiSelectedFeatureList[0];
            if (LayerConfigs.TryGetValue(firstFeature.LayerId, out var layerConfig))
            {
                return layerConfig.ExcludedProperties;
            }
        }
        // In single-select mode, use the clicked feature's layer config
        else if (clickedFeature != null && LayerConfigs != null)
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
    private async Task HandleAttributesSaved(object editContextObj)
    {
        if (!OnAttributesSaved.HasDelegate)
            return;

        // Handle multi-feature edit
        if (editContextObj is MultiFeatureEditContext multiEditContext)
        {
            if (_multiSelectedFeatureList == null || _multiSelectedFeatureList.Count == 0)
            {
                Console.WriteLine("Cannot save attributes: No features in multi-select list");
                return;
            }

            // Build list of (LayerId, FeatureId) tuples
            var featureIds = new List<(string LayerId, string FeatureId)>();
            
            foreach (var feature in _multiSelectedFeatureList)
            {
                var featureId = GetFeatureId(feature, feature.LayerId);
                if (!string.IsNullOrEmpty(featureId))
                {
                    featureIds.Add((feature.LayerId, featureId));
                }
            }

            if (featureIds.Count == 0)
            {
                Console.WriteLine("Cannot save attributes: No valid feature IDs found");
                return;
            }

            // Invoke callback with multi-feature data
            await OnAttributesSaved.InvokeAsync((featureIds, multiEditContext));
            Console.WriteLine($"[FeatureSelectionControl] Saved batch edit to {featureIds.Count} features");
        }
        // Handle single-feature edit
        else if (editContextObj is AttributeEditContext editContext)
        {
            if (clickedFeature == null)
            {
                Console.WriteLine("Cannot save attributes: No clicked feature");
                return;
            }

            var featureId = GetFeatureId(clickedFeature, clickedFeature.LayerId);
            if (string.IsNullOrEmpty(featureId))
            {
                Console.WriteLine("Cannot save attributes: No feature ID found");
                return;
            }

            // Invoke callback with single-feature data
            await OnAttributesSaved.InvokeAsync((clickedFeature.LayerId, featureId, editContext));
            Console.WriteLine($"[FeatureSelectionControl] Saved single feature: {featureId}");
        }
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
