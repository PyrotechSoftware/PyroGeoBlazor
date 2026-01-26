# Quick Start: DeckGL Razor Layer Syntax

## Simple Example

```razor
<DeckGLView InitialViewState="@viewState">
    <TileLayer Id="basemap"
               TileUrl="https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png" />
    
    <GeoJsonLayer Id="data"
                  DataUrl="https://example.com/data.geojson"
                  Pickable="true"
                  FillColor="@(new[] { 160, 160, 180, 100 })"
                  LineColor="@(new[] { 80, 80, 80, 255 })" />
</DeckGLView>
```

## Available Components

- `<TileLayer>` - Basemaps (OpenStreetMap, Carto, etc.)
- `<GeoJsonLayer>` - Vector features (points, lines, polygons)
- `<MVTLayer>` - Mapbox Vector Tiles (GeoServer, etc.)
- `<ScatterplotLayer>` - Points as circles
- `<ArcLayer>` - Lines between points

## Features

✅ Clean, readable syntax  
✅ IntelliSense support  
✅ Type safety  
✅ Conditional rendering with `@if`  
✅ Works alongside existing code  
✅ No performance overhead  

## Learn More

See `RAZOR_LAYER_SYNTAX.md` for complete documentation.

## Try It

Run the demo app and navigate to:
- `/simple-razor-layers` - Minimal example
- `/deckgl-razor-layers` - Full-featured demo
