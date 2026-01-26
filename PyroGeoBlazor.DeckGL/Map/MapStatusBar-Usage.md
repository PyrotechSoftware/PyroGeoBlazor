# Map Status Bar Component

The `MapStatusBar` component displays real-time information about the current map view state in a compact, fixed status bar at the bottom of the DeckGLView.

## Features

- **Right-aligned display** of view state information
- **Small footprint** - default 35px height, configurable
- **Always visible** - locked at the bottom of the map
- **Automatic updates** when the camera moves
- Displays:
  - Longitude (5 decimal places)
  - Latitude (5 decimal places)
  - Zoom level (2 decimal places)
  - Pitch (when set, in degrees)
  - Bearing (when set, in degrees)

## Usage

The status bar is enabled by default in the `DeckGLView` component. It automatically updates as the user interacts with the map.

### Basic Usage (Default - Status Bar Enabled)

```razor
<DeckGLView InitialViewState="@initialViewState">
    <LayersContent>
        <Layers>
            <GeoJsonLayer Data="@geoJsonData" />
        </Layers>
    </LayersContent>
</DeckGLView>
```

### Disable Status Bar

```razor
<DeckGLView InitialViewState="@initialViewState" ShowStatusBar="false">
    <LayersContent>
        <Layers>
            <GeoJsonLayer Data="@geoJsonData" />
        </Layers>
    </LayersContent>
</DeckGLView>
```

### Standalone Usage (Advanced)

You can also use the `MapStatusBar` component standalone:

```razor
<MapStatusBar CurrentViewState="@myViewState" 
              Height="45" 
              CssClass="my-custom-style" />
```

## Properties

### DeckGLView Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ShowStatusBar` | `bool` | `true` | Whether to display the status bar |

### MapStatusBar Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `CurrentViewState` | `ViewState?` | `null` | The current view state to display |
| `Height` | `int` | `35` | Height of the status bar in pixels |
| `CssClass` | `string?` | `null` | Optional custom CSS class |

## Accessing Current View State

The current view state is available from the `DeckGLView` component:

```csharp
@code {
    private DeckGLView? _deckGLView;
    private ViewState? _currentViewState;

    // Access the current view state from the DeckGLView
    private async Task LogCurrentView()
    {
        if (_deckGLView != null)
        {
            _currentViewState = _deckGLView.CurrentViewState;
            Console.WriteLine($"Current position: {_currentViewState?.Longitude}, {_currentViewState?.Latitude}");
        }
    }
}
```

## Styling

The status bar uses a semi-transparent white background by default and is positioned absolutely at the bottom of the map container. You can customize its appearance by:

1. Using the `Height` parameter to adjust the height
2. Using the `CssClass` parameter to add custom styling
3. Overriding the CSS classes in your own stylesheet:

```css
/* Custom status bar styling */
.map-status-bar {
    background-color: rgba(0, 0, 0, 0.8) !important;
    color: white !important;
}

.map-status-bar .status-item strong {
    color: #ffcc00 !important;
}
```

## Example

```razor
@page "/deck-gl-demo"
@using PyroGeoBlazor.DeckGL.Components
@using PyroGeoBlazor.DeckGL.Models

<div style="height: 100vh; width: 100vw; display: flex; flex-direction: column;">
    <DeckGLView @ref="_deckGLView"
                InitialViewState="@_initialViewState"
                ShowStatusBar="true"
                OnViewStateChanged="OnViewStateChanged">
        <LayersContent>
            <Layers>
                <GeoJsonLayer Id="my-layer" Data="@_geoJsonData" />
            </Layers>
        </LayersContent>
    </DeckGLView>
</div>

@code {
    private DeckGLView? _deckGLView;
    private ViewState _initialViewState = new ViewState
    {
        Longitude = -122.45,
        Latitude = 37.8,
        Zoom = 12,
        Pitch = 0,
        Bearing = 0
    };

    private string _geoJsonData = "{}";

    private async Task OnViewStateChanged(ViewState newState)
    {
        Console.WriteLine($"View changed: Lon={newState.Longitude:F5}, Lat={newState.Latitude:F5}, Zoom={newState.Zoom:F2}");
        // The status bar will automatically update with the new state
    }
}
```

## Implementation Details

The status bar:
- Is positioned using `position: absolute` within the `DeckGLView` container
- Has a `z-index` of 1000 to stay above map layers
- Updates automatically when the `DeckGLView` receives view state changes from JavaScript
- Only renders when the `CurrentViewState` is not null
- Uses culture-aware number formatting based on the user's locale
