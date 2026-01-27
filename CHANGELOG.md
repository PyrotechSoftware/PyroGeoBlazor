# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.3] - 2026-01-27

### Added
- Context menu for `LayerContentsControl` with right-click activation
  - "Zoom to Layer" - zooms and pans map to layer bounds (fully functional)
  - "Data Design" - placeholder for future implementation
  - "Label" - toggles feature labels on/off for the selected layer (fully functional)
- **Label support for GeoJsonLayer and MVTLayer**
  - Display text from feature properties as labels on map features
  - Configurable via `LabelProperty`, `LabelsEnabled`, and styling parameters
  - Automatic label positioning at feature centroids/bounding box centers
  - Smart boundary detection - labels only appear if text fits within polygon bounds
  - Size validation with 1.5x threshold (polygon must be 1.5x larger than estimated text size)
  - MVT-specific implementation with per-tile TextLayer overlays
  - Coordinate transformation from tile-local (0-1) to geographic (LNGLAT) coordinates
  - Configurable font size, text color, and background color
  - Works with both GeoJSON and MVT (vector tile) layers
- Bounds caching system for viewport-culled layers
  - Layers now cache their full extent as data is loaded across different viewports
  - Cached bounds expand cumulatively as you explore different areas
  - "Zoom to Layer" now works even when you've panned away from viewport-culled layers
- Comprehensive logging for bounds calculation and zoom operations (temporary, for debugging)
- Layer click to select all features in `FeatureSelectionControl`
  - Clicking a layer header now selects all features in that layer
  - Uses multi-selection system with visual feedback (background highlight and checkmark icons)
  - Provides quick way to batch-select features for editing
- Loading indicator in `MapStatusBar`
  - Small indeterminate circular progress spinner appears on the far right when data is being fetched
  - Automatically tracks all data fetch operations across all layers
  - Provides visual feedback for layer updates, viewport changes, and data loading
  - JavaScript `fetchData()` method now tracks active fetches and notifies .NET of loading state changes

### Changed
- **BREAKING**: Changed default padding from 50 pixels to 0 pixels for zoom methods (`ZoomToLayer`, `ZoomToFeature`, `ZoomToSelectedFeatures`)
- Moved viewport culling padding logic from JavaScript client to C# API controllers
  - JavaScript now sends exact viewport bounds to server
  - Server-side controllers add 50% padding when querying database for smoother panning experience
  - Cached bounds are now exact feature extents without padding
- Fixed zoom calculation formula to properly account for viewport dimensions
  - Old formula: `log2(360 / lngDiff)` - didn't consider viewport pixel size
  - New formula: `log2((viewportWidth * 360) / (lngDiff * 256))` - calculates zoom based on actual viewport
  - Added Web Mercator latitude distortion correction for accurate fitting
  - Bounds now fit exactly to viewport with no extra padding
- Improved visibility handling for layers
  - Invisible layers no longer fetch data when zooming or panning
  - Added visibility checks in `layerNeedsUpdate` and `createLayer` methods
  - Saves bandwidth and reduces unnecessary server load
- `FeatureSelectionControl` UI improvements
  - Removed collapsible/expandable layer structure (all features now always visible)
  - Features render as flat list with left indentation for better visibility
  - Layer headers are now clickable for selecting all features
- Multi-selection in `FeatureSelectionControl` now restricted to single layer
  - Attempting to Ctrl+click a feature from a different layer clears previous selection and starts new selection in the new layer
  - Prevents mixing features with different schemas in batch editing operations
  - Provides clear console feedback when this occurs

### Fixed
- Fixed MVTLoader deprecation warning by using `loadOptions.mvt.shape` instead of deprecated `options.gis`
- Fixed bug where invisible layers would still fetch data on viewport changes
- Fixed excessive padding when zooming to layer bounds
- Set Parcels layer to `Visible="false"` by default in demo for testing
- Fixed multi-select attribute editing issues in `FeatureAttributesControl`
  - Fields missing from some features are now displayed (treated as null values)
  - All unique fields across all selected features are now shown in the attribute table
  - Fields with different values now show "(Different values)" text initially
  - Click on "(Different values)" field to enter edit mode and change value for all selected features
- Fixed unselect feature issues in `FeatureSelectionControl`
  - Single feature unselect now correctly removes only that feature (not all features in layer)
  - Layer clear selection now properly clears only features from that layer
  - MVT layer clear selection now correctly updates map visual highlighting
  - JavaScript now stores full feature data with layer associations to support MVT layers
  - C# state reconciliation ensures UI and map stay in sync after unselect operations
- Fixed CSS024 validation warning in `FeatureSelectionControl`
  - Moved inline conditional style logic to helper method `GetFeatureStyle()`
  - Ensures valid CSS is always generated (no empty strings or trailing semicolons)
- **Fixed MVT label rendering coordinate system mismatch**
  - Labels now correctly convert from tile-local coordinates (0-1) to geographic coordinates (LNGLAT)
  - Fixed Y-axis inversion in MVT coordinate transformation (Y=0 is north in MVT)
  - Labels now appear at correct positions on MVT layers

### Known Limitations
- **MVT Label Duplication**: Large features spanning multiple tiles may show duplicate labels (one per tile)
  - This is an acceptable tradeoff for reliable label rendering
  - Most features don't span multiple tiles, so impact is minimal
  - Future enhancement: Implement proper de-duplication with feature ID tracking and lifecycle management

### Updated
- ParcelsController, TownshipsController, and TownshipExtensionsController to handle viewport padding server-side
- `buildViewportUrl` in TypeScript to send exact viewport bounds without client-side padding multiplication
- `FeatureSelectionControl` test selectors to find feature items specifically (with `padding-left: 32px`) instead of any clickable element
- TypeScript selection tracking in `deckGLView.ts` to store full feature data with layer associations
  - Added `selectedFeaturesData` Map to track features with their layer IDs
  - Modified `unselectFeature()` and `clearLayerSelection()` to use stored data
  - Created `getSelectedFeaturesFromData()` method for universal layer type support

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

[Unreleased]: https://github.com/PyrotechSoftware/PyroGeoBlazor/compare/v1.0.3...HEAD
[1.0.3]: https://github.com/PyrotechSoftware/PyroGeoBlazor/releases/tag/v1.0.3
[1.0.2]: https://github.com/PyrotechSoftware/PyroGeoBlazor/releases/tag/v1.0.2
[1.0.0]: https://github.com/PyrotechSoftware/PyroGeoBlazor/releases/tag/v1.0.0
