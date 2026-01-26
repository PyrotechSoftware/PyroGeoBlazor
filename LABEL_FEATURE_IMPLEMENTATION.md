# Label Feature Implementation Plan

## Overview

This document outlines the complete architecture and implementation plan for adding label support to PyroGeoBlazor.DeckGL. Labels will allow displaying text from feature properties on the map, with configurable styling, visibility controls, and special handling for tile-based layers.

## Goals

1. **Declarative Configuration** - Define labels in Razor markup with minimal code
2. **Property-Based Text** - Use any feature property as label text
3. **Zoom-Based Visibility** - Labels appear only at appropriate zoom levels
4. **Runtime Control** - Enable/disable labels through UI without recreating layers
5. **MVT Support** - Handle tile-based layers with proper deduplication
6. **Smart Positioning** - Center labels on features, handle off-screen cases

## Architecture

### Three-Layer Approach

```
┌─────────────────────────────────────────┐
│  Blazor Layer (C#)                      │
│  - LabelConfig model                    │
│  - Component parameters                 │
│  - LayerContentsControl UI              │
└─────────────────┬───────────────────────┘
                  │ JSON serialization
┌─────────────────▼───────────────────────┐
│  JavaScript Interop                     │
│  - LayerConfig with labelConfig         │
│  - DeckGLView passes to layerFactory    │
└─────────────────┬───────────────────────┘
                  │ createLayerFromConfig
┌─────────────────▼───────────────────────┐
│  TypeScript Rendering (deck.gl)         │
│  - GeoJsonLayer with getText accessor   │
│  - MVT deduplication logic              │
│  - TextLayer as overlay (optional)      │
└─────────────────────────────────────────┘
```

## Data Models

### LabelConfig Class

**Location**: `PyroGeoBlazor.DeckGL/Layers/Models/LayerConfig.cs`

```csharp
/// <summary>
/// Configuration for rendering labels on map features.
/// </summary>
public class LabelConfig
{
    /// <summary>
    /// Property name to use for label text.
    /// If the property doesn't exist or is null, no label will be displayed.
    /// Example: "name", "label", "title"
    /// </summary>
    [JsonPropertyName("textProperty")]
    public string? TextProperty { get; set; }

    /// <summary>
    /// Minimum zoom level at which labels become visible.
    /// Prevents cluttering when zoomed out.
    /// Defaults to 12 (neighborhood level).
    /// </summary>
    [JsonPropertyName("minZoom")]
    public double MinZoom { get; set; } = 12;

    /// <summary>
    /// Whether labels are currently enabled.
    /// Can be toggled at runtime.
    /// Defaults to false.
    /// </summary>
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = false;

    /// <summary>
    /// Font size in pixels.
    /// Defaults to 12px.
    /// </summary>
    [JsonPropertyName("fontSize")]
    public int FontSize { get; set; } = 12;

    /// <summary>
    /// Text color as hex string (e.g., "#000000").
    /// Defaults to black.
    /// </summary>
    [JsonPropertyName("textColor")]
    public string TextColor { get; set; } = "#000000";

    /// <summary>
    /// Background color for better readability.
    /// Supports alpha channel (e.g., "#FFFFFFCC").
    /// Defaults to semi-transparent white.
    /// </summary>
    [JsonPropertyName("backgroundColor")]
    public string BackgroundColor { get; set; } = "#FFFFFFCC";

    /// <summary>
    /// Text anchor: "start", "middle", "end".
    /// Defaults to "middle" (centered).
    /// </summary>
    [JsonPropertyName("textAnchor")]
    public string TextAnchor { get; set; } = "middle";

    /// <summary>
    /// Text alignment: "left", "center", "right".
    /// Defaults to "center".
    /// </summary>
    [JsonPropertyName("textAlignment")]
    public string TextAlignment { get; set; } = "center";
}
```

### LayerConfig Extension

Add to `LayerConfig` base class:

```csharp
/// <summary>
/// Configuration for feature labels displayed on the layer.
/// </summary>
[JsonPropertyName("labelConfig")]
public LabelConfig? LabelConfig { get; set; }
```

## Component Changes

### 1. GeoJsonLayer Component

**Location**: `PyroGeoBlazor.DeckGL/Layers/Components/GeoJsonLayer.cs`

Add parameters:

```csharp
/// <summary>
/// Property name to use for label text.
/// Labels will only display if this property exists and has a value.
/// </summary>
[Parameter]
public string? LabelProperty { get; set; }

/// <summary>
/// Whether labels are enabled for this layer.
/// Can be changed at runtime.
/// </summary>
[Parameter]
public bool LabelsEnabled { get; set; } = false;

/// <summary>
/// Minimum zoom level for label visibility.
/// Defaults to 12.
/// </summary>
[Parameter]
public double LabelMinZoom { get; set; } = 12;

/// <summary>
/// Label font size in pixels.
/// Defaults to 12.
/// </summary>
[Parameter]
public int LabelFontSize { get; set; } = 12;

/// <summary>
/// Label text color (hex format).
/// Defaults to black.
/// </summary>
[Parameter]
public string LabelTextColor { get; set; } = "#000000";

/// <summary>
/// Label background color (hex format with optional alpha).
/// Defaults to semi-transparent white.
/// </summary>
[Parameter]
public string LabelBackgroundColor { get; set; } = "#FFFFFFCC";
```

Update `CreateLayerConfig()`:

```csharp
protected override LayerConfig CreateLayerConfig()
{
    var config = new GeoJsonLayerConfig
    {
        // ... existing properties ...
    };

    // Configure labels if property specified
    if (!string.IsNullOrEmpty(LabelProperty))
    {
        config.LabelConfig = new LabelConfig
        {
            TextProperty = LabelProperty,
            Enabled = LabelsEnabled,
            MinZoom = LabelMinZoom,
            FontSize = LabelFontSize,
            TextColor = LabelTextColor,
            backgroundColor = LabelBackgroundColor
        };
    }

    return config;
}
```

### 2. MVTLayer Component

**Location**: `PyroGeoBlazor.DeckGL/Layers/Components/MVTLayer.cs`

Add identical parameters as GeoJsonLayer and update `CreateLayerConfig()` similarly.

### 3. DeckGLLayer Base Class

**Location**: `PyroGeoBlazor.DeckGL/Layers/Components/DeckGLLayer.cs`

Add method to update label state at runtime:

```csharp
/// <summary>
/// Updates the label enabled state for this layer at runtime.
/// </summary>
public async Task SetLabelsEnabled(bool enabled)
{
    if (LayerConfig.LabelConfig != null)
    {
        LayerConfig.LabelConfig.Enabled = enabled;
        await NotifyConfigChanged();
    }
}
```

## TypeScript Implementation

### 1. Layer Factory Changes

**Location**: `PyroGeoBlazor.DeckGL/Scripts/layerFactory.ts`

#### GeoJsonLayer Enhancement

```typescript
case 'geojson':
case 'geojsonlayer':
    const layerProps: any = {
        id,
        data,
        ...props,
        // ... existing properties ...
    };

    // Add label text accessor if configured
    if (config.labelConfig?.enabled && config.labelConfig?.textProperty) {
        layerProps.getText = (feature: any) => {
            const text = feature.properties?.[config.labelConfig.textProperty];
            return text ? String(text) : '';
        };
        
        layerProps.getTextSize = config.labelConfig.fontSize;
        layerProps.getTextColor = hexToRgba(config.labelConfig.textColor);
        layerProps.getTextBackgroundColor = hexToRgba(config.labelConfig.backgroundColor);
        layerProps.getTextAnchor = config.labelConfig.textAnchor;
        layerProps.getTextAlignmentBaseline = config.labelConfig.textAlignment;
        layerProps.textSizeMinPixels = config.labelConfig.fontSize;
        layerProps.textSizeMaxPixels = config.labelConfig.fontSize * 2;
    }

    return new GeoJsonLayer(layerProps);
```

#### MVTLayer Enhancement with Deduplication

```typescript
case 'mvt':
case 'mvtlayer':
    const mvtProps: any = {
        id,
        data: props.dataUrl || data,
        ...props,
        // ... existing properties ...
    };

    // MVT label handling with deduplication
    if (config.labelConfig?.enabled && config.labelConfig?.textProperty) {
        // Track seen feature IDs to prevent duplicate labels across tiles
        const seenFeatures = new Set<string>();
        
        mvtProps.getText = (feature: any) => {
            // Get unique feature ID
            const featureId = feature.properties?.id || 
                             feature.properties?.OBJECTID || 
                             feature.id;
            
            if (!featureId) {
                // No ID - can't deduplicate, show anyway
                const text = feature.properties?.[config.labelConfig.textProperty];
                return text ? String(text) : '';
            }
            
            // Deduplicate: only show label once across all tiles
            if (seenFeatures.has(featureId)) {
                return ''; // Already shown in another tile
            }
            
            seenFeatures.add(featureId);
            const text = feature.properties?.[config.labelConfig.textProperty];
            return text ? String(text) : '';
        };
        
        mvtProps.getTextSize = config.labelConfig.fontSize;
        mvtProps.getTextColor = hexToRgba(config.labelConfig.textColor);
        mvtProps.getTextBackgroundColor = hexToRgba(config.labelConfig.backgroundColor);
        mvtProps.getTextAnchor = config.labelConfig.textAnchor;
        mvtProps.getTextAlignmentBaseline = config.labelConfig.textAlignment;
        mvtProps.textSizeMinPixels = config.labelConfig.fontSize;
        mvtProps.textSizeMaxPixels = config.labelConfig.fontSize * 2;
    }

    return new MVTLayer(mvtProps);
```

### 2. Zoom-Based Visibility

deck.gl's GeoJsonLayer automatically supports `getText` return values, and labels won't render if the function returns an empty string. For zoom-based visibility, we can enhance the getText accessor:

```typescript
getText: (feature: any) => {
    // Check current zoom level
    const currentZoom = deckInstance.viewState?.zoom ?? 0;
    if (currentZoom < config.labelConfig.minZoom) {
        return ''; // Below min zoom, don't show
    }
    
    // ... rest of logic ...
}
```

### 3. Helper Function: Hex to RGBA

Add to `layerFactory.ts`:

```typescript
/**
 * Converts hex color to RGBA array for deck.gl
 * Supports 6-char (#RRGGBB) and 8-char (#RRGGBBAA) formats
 */
function hexToRgba(hex: string): [number, number, number, number] {
    hex = hex.replace('#', '');
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = hex.length === 8 
        ? parseInt(hex.substring(6, 8), 16) 
        : 255;
    
    return [r, g, b, a];
}
```

## UI Integration

### LayerContentsControl Changes

**Location**: `PyroGeoBlazor.DeckGL/Layers/Components/LayerContentsControl.razor`

Enable the Label menu item:

```razor
<MudMenuItem OnClick="@(() => { OnToggleLabel(context); })"
             Icon="@Icons.Material.Filled.Label"
             Disabled="@(!HasLabelSupport(context))">
    Label
</MudMenuItem>
```

**Location**: `PyroGeoBlazor.DeckGL/Layers/Components/LayerContentsControl.razor.cs`

```csharp
private bool HasLabelSupport(LayerConfig layer)
{
    // Only layers with label configuration can toggle labels
    return layer.LabelConfig != null && 
           !string.IsNullOrEmpty(layer.LabelConfig.TextProperty);
}

private async Task OnToggleLabel(LayerConfig layer)
{
    if (layer.LabelConfig == null) return;
    
    // Toggle enabled state
    layer.LabelConfig.Enabled = !layer.LabelConfig.Enabled;
    
    // Notify deck.gl to update the layer
    await OnLayerConfigChanged.InvokeAsync(layer);
}
```

## Technical Considerations

### 1. MVT Deduplication Challenge

**Problem**: MVT layers load features per tile. A feature spanning multiple tiles appears in each tile, causing duplicate labels.

**Solution**: Track feature IDs in a Set during label rendering. Only render label for first occurrence.

**Limitation**: Set persists for session. Consider clearing on zoom level change:

```typescript
let lastZoom = 0;
const seenFeatures = new Set<string>();

getText: (feature) => {
    const currentZoom = Math.floor(deckInstance.viewState.zoom);
    if (currentZoom !== lastZoom) {
        seenFeatures.clear(); // New zoom level, reset
        lastZoom = currentZoom;
    }
    // ... deduplication logic ...
}
```

### 2. Label Positioning

**deck.gl Default Behavior**:
- Labels render at feature centroid
- For large polygons, centroid may be off-screen
- deck.gl handles this automatically by not rendering off-screen labels

**Custom Enhancement** (Optional Future Work):
- Calculate visible polygon center within viewport
- Use `getTextPixelOffset` for fine-tuning
- Implement label collision detection

For initial implementation, rely on deck.gl's built-in handling.

### 3. Performance

**Considerations**:
- getText accessor called for every feature on every render
- Keep logic minimal and fast
- Consider caching text values if property parsing is complex

**Optimization**:
```typescript
// Cache parsed text values
const textCache = new Map<string, string>();

getText: (feature) => {
    const cacheKey = feature.id || JSON.stringify(feature.properties);
    if (textCache.has(cacheKey)) {
        return textCache.get(cacheKey)!;
    }
    
    const text = /* ... parse text ... */;
    textCache.set(cacheKey, text);
    return text;
}
```

### 4. Null/Undefined Handling

Always check property existence:

```typescript
const text = feature?.properties?.[textProperty];
if (text === null || text === undefined || text === '') {
    return ''; // No label
}
return String(text); // Ensure string type
```

## Usage Examples

### Basic GeoJSON Layer with Labels

```razor
<GeoJsonLayer Id="Counties"
              DataUrl="/api/counties"
              FillColor="@(new[] { 0, 150, 255, 77 })"
              LabelProperty="NAME"
              LabelsEnabled="true"
              LabelMinZoom="8"
              LabelFontSize="14"
              LabelTextColor="#000000" />
```

### MVT Layer with Labels

```razor
<MVTLayer Id="Parcels"
          GeoServerUrl="http://localhost:8080/geoserver"
          Workspace="MyWorkspace"
          LayerName="parcels"
          LabelProperty="PARCEL_ID"
          LabelsEnabled="false"
          LabelMinZoom="14"
          LabelFontSize="10" />
```

### Runtime Toggle

```csharp
// In LayerContentsControl or other component
await deckGLView.UpdateLayerConfig(layerId, config => 
{
    if (config.LabelConfig != null)
    {
        config.LabelConfig.Enabled = !config.LabelConfig.Enabled;
    }
});
```

## Implementation Phases

### Phase 1: Core Implementation (Essential)
1. ✅ Add LabelConfig model to LayerConfig
2. ✅ Add label parameters to GeoJsonLayer component
3. ✅ Add label parameters to MVTLayer component
4. ✅ Implement getText accessor in layerFactory (GeoJsonLayer)
5. ✅ Implement hexToRgba helper function
6. ✅ Wire up LayerContentsControl toggle

### Phase 2: MVT Support (Important)
1. Implement MVT deduplication logic
2. Add zoom-based clear for deduplication Set
3. Test with various MVT layers

### Phase 3: Polish (Nice to Have)
1. Add label text truncation for long strings
2. Implement label collision detection
3. Add font family configuration
4. Add label outline/halo for better contrast
5. Support multi-line labels

### Phase 4: Advanced (Future)
1. Custom label positioning algorithms
2. Label priority/importance ranking
3. Dynamic font size based on zoom
4. Label rotation to match feature orientation

## Testing Checklist

- [ ] GeoJSON layer with simple property ("name")
- [ ] GeoJSON layer with null/undefined property values
- [ ] GeoJSON layer with numeric properties
- [ ] MVT layer with labels (verify no duplicates across tiles)
- [ ] Toggle labels on/off at runtime (LayerContentsControl)
- [ ] Zoom in/out across minZoom threshold
- [ ] Large dataset (10,000+ features) - performance
- [ ] Features with very long label text
- [ ] Features where centroid is off-screen
- [ ] Multiple layers with labels enabled simultaneously

## Deck.gl API Reference

**GeoJsonLayer Text Properties**:
- `getText`: `(feature) => string` - Accessor for text content
- `getTextSize`: `number | (feature) => number` - Font size in pixels
- `getTextColor`: `Color | (feature) => Color` - RGBA array
- `getTextBackgroundColor`: `Color | (feature) => Color` - Background RGBA
- `getTextAnchor`: `string` - "start", "middle", "end"
- `getTextAlignmentBaseline`: `string` - "top", "center", "bottom"
- `getTextPixelOffset`: `[number, number]` - X/Y offset in pixels
- `textSizeMinPixels`: `number` - Minimum rendered size
- `textSizeMaxPixels`: `number` - Maximum rendered size
- `textCharacterSet`: `string | string[]` - Character set for font atlas

**Color Format**: `[r, g, b, a]` where values are 0-255

## Open Questions

1. **Font Family**: Should we support custom fonts, or stick with deck.gl default?
   - **Decision**: Start with default, add parameter later if needed

2. **Multi-line Labels**: Support for line breaks (`\n`) in text?
   - **Decision**: deck.gl supports this automatically

3. **Label Clustering**: Group nearby labels at low zoom levels?
   - **Decision**: Defer to future enhancement

4. **Label Layer Ordering**: Labels above or below other layers?
   - **Decision**: Labels render as part of their layer (z-index controlled by layer order)

5. **Text Wrapping**: Wrap long labels to multiple lines?
   - **Decision**: No automatic wrapping initially, use `\n` manually

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| MVT duplicate labels | High | Implement deduplication Set |
| Performance with many labels | Medium | Add zoom-based visibility, getText caching |
| Off-screen centroids | Low | Rely on deck.gl built-in handling |
| Memory leak (deduplication Set) | Medium | Clear Set on zoom change |
| Label overlap/collision | Medium | Accept initially, add collision detection later |

## Success Criteria

1. ✅ Can configure labels declaratively in Razor markup
2. ✅ Labels only show for features with non-null property values
3. ✅ Labels respect minZoom setting
4. ✅ Labels can be toggled at runtime via UI
5. ✅ MVT layers show each label only once (no duplicates)
6. ✅ Performance acceptable with 10,000+ labeled features
7. ✅ Labels readable with background color
8. ✅ No console errors or warnings

## Future Enhancements

- **Label boundary detection** - Don't render label if text doesn't fit inside polygon bounds (Started implementing but not working yet)
- Icon labels (combine icon + text)
- Label fade-in/out animations
- Smart label placement to avoid occlusion
- Label LOD (Level of Detail) - different properties at different zooms
- Label callouts/leader lines
- Interactive labels (click to show tooltip)
- Label filtering by attribute values
- Expression-based label text (e.g., "{FIRSTNAME} {LASTNAME}")

---

## Next Steps

After document approval, implement in this order:

1. **Phase 1A**: Models and Component Parameters (30 min)
   - LabelConfig class
   - GeoJsonLayer parameters
   - MVTLayer parameters

2. **Phase 1B**: TypeScript Core (45 min)
   - hexToRgba helper
   - GeoJsonLayer getText implementation
   - Basic label rendering

3. **Phase 1C**: UI Integration (20 min)
   - Enable Label menu item
   - Wire up toggle handler
   - Test runtime enable/disable

4. **Phase 2**: MVT Deduplication (30 min)
   - Implement Set-based deduplication
   - Add zoom-based clearing
   - Test with MVT layers

5. **Testing & Polish** (30 min)
   - Test all scenarios
   - Fix any issues
   - Update CHANGELOG

**Total Estimated Time**: ~2.5 hours

Ready to begin implementation? 🚀
