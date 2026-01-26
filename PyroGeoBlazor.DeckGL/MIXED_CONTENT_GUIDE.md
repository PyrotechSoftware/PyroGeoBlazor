# Using Structured Layer Content in DeckGLView

## Overview

The `DeckGLView` component supports two content areas for better organization:
- **`<LayersContent>`** - For map layer definitions (DeckGLLayer components only)
- **`<ChildContent>`** - For other UI content (controls, overlays, info panels, etc.)

This separation is especially useful when you want to mix map layers with controls, overlays, or other UI elements.

## Basic Syntax

```razor
<DeckGLView InitialViewState="@viewState">
    <LayersContent>
        @* Only DeckGLLayer-derived components go here *@
        <TileLayer Id="basemap" TileUrl="..." />
        <GeoJsonLayer Id="data" DataUrl="..." />
        <MVTLayer Id="parcels" GeoServerUrl="..." />
    </LayersContent>
    
    <ChildContent>
        @* Other UI content: controls, overlays, info panels, etc. *@
        <div>My Custom Controls</div>
    </ChildContent>
</DeckGLView>
```

## Why Use LayersContent?

### ✅ Benefits

1. **Clear Separation** - Visually separates layers from UI controls
2. **Better Organization** - Groups all map layers together
3. **Mixed Content** - Allows other UI elements alongside layers
4. **Explicit Structure** - Makes the component hierarchy clear
5. **Type Safety** - Only DeckGLLayer components should go in LayersContent

### When to Use

**Use `<LayersContent>` when:** You need to add UI controls, overlays, or other elements alongside your layers

**Skip it when:** You're only defining layers with no other UI content:

```razor
@* Simpler without LayersContent *@
<DeckGLView>
    <TileLayer ... />
    <GeoJsonLayer ... />
</DeckGLView>
```

## Usage Examples

### ✅ Valid Usage

**Simple - Layers Only:**
```razor
<DeckGLView>
    <TileLayer Id="basemap" TileUrl="..." />
    <GeoJsonLayer Id="data" DataUrl="..." />
</DeckGLView>
```

**Mixed Content - Layers + UI:**
```razor
<DeckGLView>
    <LayersContent>
        <TileLayer Id="basemap" TileUrl="..." />
        <GeoJsonLayer Id="data" DataUrl="..." />
    </LayersContent>
    <ChildContent>
        <div>My Controls</div>
    </ChildContent>
</DeckGLView>
```

### ❌ Invalid Usage

```razor
<LayersContent>
    @* ERROR: LayersContent must be inside DeckGLView *@
    <TileLayer Id="basemap" TileUrl="..." />
</LayersContent>
```

```razor
<DeckGLView>
    <LayersContent>
        @* ERROR: Only DeckGLLayer components allowed *@
        <div>Some content</div>
        <TileLayer Id="basemap" TileUrl="..." />
    </LayersContent>
</DeckGLView>
```

## Complete Example: Mixed Content

```razor
@page "/my-map"
@using PyroGeoBlazor.DeckGL.Components
@using PyroGeoBlazor.DeckGL.Models

<div style="height: 100vh;">
    <DeckGLView InitialViewState="@viewState" Controller="true">
        
        @* Layer definitions *@
        <LayersContent>
            <TileLayer Id="basemap"
                       TileUrl="https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png" />
            
            @if (showDataLayer)
            {
                <GeoJsonLayer Id="features"
                              DataUrl="api/features"
                              Pickable="true"
                              FillColor="@(new[] { 160, 160, 180, 100 })" />
            }
            
            <MVTLayer Id="parcels"
                      GeoServerUrl="https://geoserver.example.com/geoserver"
                      Workspace="PlannerSpatial"
                      LayerName="parcels"
                      Visible="@showParcels" />
        </LayersContent>
        
        @* UI controls and overlays *@
        <ChildContent>
            @* Floating control panel *@
            <div style="position: absolute; top: 16px; right: 16px; z-index: 1000;
                        background: white; padding: 16px; border-radius: 8px;">
                <h4>Layer Controls</h4>
                <label>
                    <input type="checkbox" @bind="showDataLayer" @onchange="UpdateLayers" />
                    Show Data Layer
                </label>
                <label>
                    <input type="checkbox" @bind="showParcels" @onchange="UpdateLayers" />
                    Show Parcels
                </label>
            </div>
            
            @* Attribution *@
            <div style="position: absolute; bottom: 8px; right: 8px; 
                        font-size: 0.75rem; color: rgba(0,0,0,0.6);">
                © OpenStreetMap contributors
            </div>
            
            @* Info panel *@
            <div style="position: absolute; bottom: 8px; left: 8px;
                        background: white; padding: 8px; border-radius: 4px;">
                Zoom: @viewState.Zoom.ToString("F2")
            </div>
        </ChildContent>
        
    </DeckGLView>
</div>

@code {
    private bool showDataLayer = true;
    private bool showParcels = true;
    
    private ViewState viewState = new()
    {
        Longitude = -123.13,
        Latitude = 49.28,
        Zoom = 11
    };
    
    private async Task UpdateLayers()
    {
        await Task.Delay(10); // Let binding update
        StateHasChanged();
    }
}
```

## Architecture

### Component Hierarchy

```
DeckGLView (CascadingValue)
├── LayersContent
│   ├── TileLayer (DeckGLLayer)
│   ├── GeoJsonLayer (DeckGLLayer)
│   └── MVTLayer (DeckGLLayer)
└── ChildContent (other UI)
    ├── Controls
    ├── Overlays
    └── Info panels
```

### How It Works

1. **DeckGLView** provides itself as a `CascadingValue`
2. **LayersContent** contains only DeckGLLayer-derived components
3. **Layer components** register themselves with DeckGLView via the cascading parameter
4. **ChildContent** can contain any UI elements

### Registration Flow

```
┌─────────────┐
│ DeckGLView  │ ← Provides CascadingValue
└──────┬──────┘
       │
   ┌───┴────────────────┐
   │                    │
┌──▼────┐        ┌──────▼─────┐
│Layers │        │ChildContent│
└──┬────┘        └────────────┘
   │
   ├── TileLayer ───► Registers with DeckGLView
   ├── GeoJsonLayer ─► Registers with DeckGLView
   └── MVTLayer ─────► Registers with DeckGLView
```

## Best Practices

### ✅ DO

- Use `<LayersContent>` when mixing with other content
- Group all layer definitions inside `<LayersContent>`
- Put UI controls in `<ChildContent>`
- Use conditional rendering (`@if`) for dynamic layers

### ❌ DON'T

- Mix layers with non-layer content inside `<LayersContent>`
- Put layer components in `<ChildContent>` (they won't work)
- Use `<LayersContent>` if you have no other content (unnecessary nesting)

## Comparison: Simple vs Mixed Content

### Simple (Layers Only)

```razor
<DeckGLView>
    <TileLayer ... />
    <GeoJsonLayer ... />
</DeckGLView>
```

**Use when:** Only defining layers, no other UI

### Mixed Content (Layers + UI)

```razor
<DeckGLView>
    <LayersContent>
        <TileLayer ... />
        <GeoJsonLayer ... />
    </LayersContent>
    <ChildContent>
        <div>Controls and UI</div>
    </ChildContent>
</DeckGLView>
```

**Use when:** Adding controls, overlays, or other UI elements

## Error Messages

### "GeoJsonLayer must be a child of a DeckGLView component or inside a <Layers> component"

**Cause:** Layer component not properly nested in DeckGLView

**Fix:**
```razor
<DeckGLView>
    <GeoJsonLayer ... />
    @* or *@
    <LayersContent>
        <GeoJsonLayer ... />
    </LayersContent>
</DeckGLView>
```

## Examples

See these demo pages for working examples:

- `/mixed-content-example` - Complete example with floating controls
- `/simple-razor-layers` - Simple example without wrapper
- `/deckgl-razor-layers` - Full-featured example with wrapper

## Summary

The `<LayersContent>` / `<ChildContent>` pattern provides:
- ✅ Clear separation of concerns
- ✅ Better organization for complex maps
- ✅ Support for mixed content (layers + UI)
- ✅ Clean, explicit structure
- ✅ No performance overhead

Choose the approach that best fits your needs:
- **Simple maps (layers only)**: Put layers directly in DeckGLView
- **Complex maps with UI**: Use LayersContent + ChildContent pattern
