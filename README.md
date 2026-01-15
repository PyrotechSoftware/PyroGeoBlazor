# PyroGeoBlazor

This is a Blazor UI Component library for integrating GIS and mapping functionalities into Blazor applications.

It provides a set of reusable components that allow developers to easily add interactive maps, geospatial data visualization, and spatial analysis features to their web applications.

## Features
- Leaflet.js wrapper

  This library is starting out by providing a wrapper for the popular Leaflet.js mapping library, enabling developers to leverage its capabilities within Blazor applications.

- Other implementations planned

  Future versions of PyroGeoBlazor will include additional GIS libraries and functionalities to further enhance the mapping capabilities available to developers.

## Building the Project

### Prerequisites
- Node.js 18+ (for TypeScript/JavaScript build)
- .NET 10 SDK (for Blazor components)

### Building TypeScript/JavaScript

The project uses **Vite** for bundling TypeScript code and **Vitest** for unit testing.

```bash
cd PyroGeoBlazor.Leaflet

# Install dependencies
npm install

# Production build (outputs to wwwroot/leafletMap.js)
npm run build

# Development mode with hot module replacement
npm run dev

# Preview production build
npm run preview
```

### Running Tests

```bash
cd PyroGeoBlazor.Leaflet

# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Building .NET Solution

The TypeScript build is automatically triggered when building the .NET solution.

```bash
# Build entire solution
dotnet build

# Run C# tests (includes xUnit and bUnit tests)
dotnet test
```

## Development Workflow

1. Make TypeScript changes in `PyroGeoBlazor.Leaflet/Scripts/`
2. Run `npm run dev` for live reloading during development
3. Write tests in `PyroGeoBlazor.Leaflet/Scripts/__tests__/`
4. Run `npm test` to verify TypeScript changes
5. Build with `dotnet build` to integrate with Blazor components
6. Run `dotnet test` to verify C# integration

## Components
- LeafletMap
  A component that encapsulates the Leaflet.js map, allowing developers to create interactive maps with various layers and controls.
- GeoJSONLayer
  A component for displaying GeoJSON data on the map, enabling easy integration of geospatial data sources.
- VectorLayer
  A component for rendering vector data on the map, allowing for advanced visualization and interaction with geospatial features.
- VectorTileLayer
  A component for displaying vector tiles, providing efficient rendering of large datasets on the map.
- LayerControl
  A component for managing map layers, allowing users to toggle visibility and switch between different layers.
- MapMarker
  A component for adding markers to the map, enabling the display of specific locations and points of interest.
- MapPopup
  A component for displaying popups on the map, providing additional information about specific locations or features.
