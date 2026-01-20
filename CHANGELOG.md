# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.2] - 2026-01-20

### Added
- Layer visibility control methods: `SetVisibility`, `Show`, `Hide`, and `ToggleVisibility` with JavaScript interop support
- `IsVisible` property on `Layer` class to track layer visibility state
- `ManagedLayers` enumerable property on `Map` for ordered iteration of layers
- `ColorUtilities` static class in PyroGeoBlazor library for random color generation and HSL to HEX conversion
- Layer visibility toggle UI in VectorTiles demo with eye icon indicators
- New tests for layer visibility features in `MapManagedLayerTests`

### Changed
- **BREAKING**: Unified managed layer API - replaced `AddLayerManaged`/`RemoveLayerManaged` with `AddLayer`/`RemoveLayer`
- **BREAKING**: Updated layer ordering methods for improved consistency (`MoveUpManaged`, `MoveDownManaged`, `RemoveFromManaged`)
- Refactored VectorTiles demo UI to use new managed layer registry and visibility controls
- Updated LayerStyle component for improved integration with new API
- Enhanced managed layer system with improved ordering and visibility management
- Updated all tests to use new unified layer management API
- Restored CustomWfsLayerSelector.razor with full WFS layer selection and configuration UI using MudBlazor
- Updated PyroGeoBlazor.Leaflet.csproj to exclude npm/build files from NuGet package, preventing unnecessary dev dependencies for consumers

### Removed
- Deleted Nuget.png and Nuget2.png image files

## [1.0.0] - 2026-01-16

### Added
- Initial release of PyroGeoBlazor
- Blazor wrapper for Leaflet.js mapping library
- Leaflet map component with interactive controls
- GeoJSON layer support with feature selection and styling
- Vector tile layer support (Protobuf and Slicer implementations)
- WFS (Web Feature Service) layer with map-bounds filtering and auto-refresh
- WMTS (Web Map Tile Service) layer support
- Editable GeoJSON features with custom Leaflet editing control
- Feature editing capabilities:
  - Drawing polygons and polylines
  - Vertex editing (add, remove, move)
  - Feature selection (single and multi-select)
  - Snapping support
  - Pre-delete confirmation with cancellation
  - Automatic change tracking
- Factory-based WMTS and WFS layer selector components with automatic implementation resolution
- MudBlazor UI components for modern Material Design interface
- Custom layer selector components with extensibility support
- Comprehensive documentation:
  - Copilot instructions following GitHub best practices
  - Implementation summary
  - End-to-end examples
  - Feature editing documentation
  - Vertex editing modes documentation
  - Usage examples
- Unit test infrastructure with bUnit and xUnit
- TypeScript testing infrastructure with Vite and Vitest
- Vite bundler for TypeScript/JavaScript code
- CI/CD workflow with GitHub Actions
- Release workflow for automated NuGet publishing
- .NET 10 support

### Changed
- Migrated from esbuild to Vite + Vitest for TypeScript bundling and testing
- Migrated UI from Bootstrap to MudBlazor components
- Improved GeoJSON bounds handling and Leaflet interop
- Enhanced null safety and UI consistency across components
- Refactored NuGet publish to use NuGet/login@v1 action

### Fixed
- Improved NuGet API key retrieval and error diagnostics in release workflow
- Fixed multi-segment feature selection in vector tiles
- Fixed GeoJSON selection with two-way sync and runtime toggling
- Improved JS install logic in CI workflow

[Unreleased]: https://github.com/PyrotechSoftware/PyroGeoBlazor/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/PyrotechSoftware/PyroGeoBlazor/releases/tag/v1.0.2
[1.0.0]: https://github.com/PyrotechSoftware/PyroGeoBlazor/releases/tag/v1.0.0
