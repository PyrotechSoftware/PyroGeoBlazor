# PyroGeoBlazor.DeckGL

A Blazor bridge library for [deck.gl](https://deck.gl) - a WebGL-powered framework for visual exploratory data analysis of large datasets.

## Architecture Philosophy

This library follows an **imperative facade pattern** that keeps Blazor in control while letting JavaScript handle the heavy lifting:

✅ **Zero large GeoJSON payloads over interop** - JS fetches data directly from APIs  
✅ **JS owns WebGL rendering & data fetching** - Performance-critical operations stay in JavaScript  
✅ **Blazor owns configuration, lifecycle, and callbacks** - Declarative control from C#

## Key Features

- **Declarative layer configuration** from Blazor/C#
- **JavaScript-side data fetching** - Provide API URLs instead of data payloads
- **Built-in data caching** - Avoid redundant network requests
- **Event callbacks** - Click, hover, and view state change events
- **Multiple layer types** - GeoJSON, Scatterplot, Arc, and more
- **TypeScript implementation** - Type-safe JavaScript interop

## Getting Started

### 1. Installation

Add a project reference to `PyroGeoBlazor.DeckGL`:

```xml
<ProjectReference Include="..\PyroGeoBlazor.DeckGL\PyroGeoBlazor.DeckGL.csproj" />
```

### 2. Build the JavaScript Module

From the `PyroGeoBlazor.DeckGL` directory:

```bash
npm install
npm run build
```

This builds the TypeScript code and outputs `wwwroot/deckGL.js`.

### 3. Basic Usage

```razor
@page "/map"
@using PyroGeoBlazor.DeckGL.Components
@using PyroGeoBlazor.DeckGL.Models

<DeckGLView @ref="deckGLView"
            ContainerId="my-map"
            InitialViewState="@initialViewState"
            Layers="@layers"
            OnLayerClick="@OnLayerClick" />

@code {
    private DeckGLView? deckGLView;
    
    private ViewState initialViewState = new()
    {
        Longitude = -122.45,
        Latitude = 37.8,
        Zoom = 12
    };

    private List<LayerConfig> layers = new()
    {
        new GeoJsonLayerConfig
        {
            Id = "my-geojson-layer",
            // JavaScript will fetch this data - no interop overhead!
            DataUrl = "https://api.example.com/data.geojson",
            Pickable = true,
            FillColor = [160, 160, 180, 200]
        }
    };

    private void OnLayerClick(LayerClickEventArgs args)
    {
        Console.WriteLine($"Clicked: {args.LayerId}");
    }
}
```

## Layer Types

### GeoJsonLayerConfig

Renders GeoJSON features as points, lines, and polygons.

```csharp
var layer = new GeoJsonLayerConfig
{
    Id = "buildings",
    DataUrl = "https://api.example.com/buildings.geojson",
    Extruded = true,  // 3D buildings
    Elevation = 30,
    FillColor = [160, 160, 180, 200],
    LineColor = [0, 0, 0, 255]
};
```

### ScatterplotLayerConfig

Renders circles at given coordinates.

```csharp
var layer = new ScatterplotLayerConfig
{
    Id = "points-of-interest",
    DataUrl = "https://api.example.com/points.json",
    RadiusScale = 6,
    FillColor = [255, 140, 0]
};
```

### ArcLayerConfig

Renders arcs between pairs of coordinates.

```csharp
var layer = new ArcLayerConfig
{
    Id = "connections",
    DataUrl = "https://api.example.com/arcs.json",
    Width = 5,
    SourceColor = [0, 128, 255],
    TargetColor = [255, 0, 128]
};
```

## Data Fetching

### Option 1: DataUrl (Recommended)

Let JavaScript fetch the data directly:

```csharp
var layer = new GeoJsonLayerConfig
{
    DataUrl = "https://api.example.com/data.geojson"
};
```

### Option 2: Inline Data

For small datasets or when data is already available:

```csharp
var layer = new ScatterplotLayerConfig
{
    Data = new[]
    {
        new { position = new[] { -122.45, 37.8 }, radius = 100 }
    }
};
```

## Events

### View State Changes

Called when the camera moves:

```razor
<DeckGLView OnViewStateChanged="@OnViewStateChanged" />

@code {
    private void OnViewStateChanged(ViewState viewState)
    {
        Console.WriteLine($"Zoom: {viewState.Zoom}");
    }
}
```

### Layer Clicks

Called when a pickable layer feature is clicked:

```razor
<DeckGLView OnLayerClick="@OnLayerClick" />

@code {
    private void OnLayerClick(LayerClickEventArgs args)
    {
        Console.WriteLine($"Layer: {args.LayerId}");
        Console.WriteLine($"Coordinate: [{args.Coordinate[0]}, {args.Coordinate[1]}]");
    }
}
```

### Layer Hover

Called when hovering over a pickable layer feature:

```razor
<DeckGLView OnLayerHover="@OnLayerHover" />

@code {
    private void OnLayerHover(LayerHoverEventArgs args)
    {
        // Update UI to show feature details
    }
}
```

## API Methods

### UpdateLayers()

Update the layers after changing the configuration:

```csharp
layers.Add(new GeoJsonLayerConfig { ... });
await deckGLView.UpdateLayers();
```

### SetViewState()

Programmatically move the camera:

```csharp
await deckGLView.SetViewState(new ViewState
{
    Longitude = -122.45,
    Latitude = 37.8,
    Zoom = 15,
    Pitch = 45,
    Bearing = 30
});
```

### ClearCache()

Clear the JavaScript-side data cache:

```csharp
await deckGLView.ClearCache();
```

## Development

### Build TypeScript

```bash
npm run build          # Production build
npm run dev           # Development mode with hot reload
```

### Run Tests

```bash
# TypeScript tests
npm test

# C# tests
dotnet test
```

## Architecture Details

### TypeScript Modules

- **deckGLView.ts** - Manages deck.gl instances and view state
- **dataProvider.ts** - Handles API data fetching and caching
- **layerFactory.ts** - Creates deck.gl layers from configuration objects

### C# Components

- **DeckGLView.razor** - Main Blazor component
- **DeckGLInteropObject.cs** - Base class for JS interop
- **LayerConfig.cs** - Base class for layer configurations
- **\*LayerConfig.cs** - Specific layer type configurations

## Design Principles

1. **Blazor controls what to render** (configuration)
2. **JavaScript handles how to render it** (WebGL + data fetching)
3. **No large data over interop** (use DataUrl, not Data)
4. **Caching by default** (avoid redundant network requests)
5. **Type safety** (TypeScript on JS side, C# models on Blazor side)

## Comparison with Full Wrapper

Unlike a full wrapper that exposes every deck.gl API:

- ✅ Simpler API surface
- ✅ Better performance (less interop)
- ✅ Easier to maintain
- ✅ Doesn't fight deck.gl's architecture
- ⚠️ Less flexibility (add layer types as needed)

## Contributing

When adding a new layer type:

1. Create a `*LayerConfig.cs` class inheriting from `LayerConfig`
2. Add the layer creation logic to `layerFactory.ts`
3. Add tests in both C# and TypeScript
4. Update this README with usage examples

## License

[Your License Here]

## See Also

- [deck.gl documentation](https://deck.gl)
- [PyroGeoBlazor.Leaflet](../PyroGeoBlazor.Leaflet) - Leaflet.js wrapper
