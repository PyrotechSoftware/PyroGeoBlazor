# MapWorkspacePage Location Marker Feature

## Overview
The MapWorkspacePage now supports optional query string parameters for displaying a marker at a specific location and controlling the map view.

## Query String Parameters

### `loc` - Location Coordinates
The `loc` parameter uses the **Google Maps format**: `latitude,longitude`

**Important:** The order is `latitude,longitude` (not longitude,latitude!)

### `zoom` - Zoom Level (Optional)
The `zoom` parameter controls the map zoom level (0-24, where higher numbers = closer view)
- Default: 14 (if location is provided without zoom)
- Range: 0 (world view) to 24 (building level detail)
- Accepts decimals: `12.5`, `15.75`

## Usage

### Basic Example - Location Only
Navigate to the map workspace with a location parameter:

```
/map-workspace?loc=-25.98208,32.59083
```
*Map centers on the location with default zoom level 14*

### Location with Custom Zoom
Combine both parameters for precise control:

```
/map-workspace?loc=-25.98208,32.59083&zoom=18
```
*Map centers on the location with zoom level 18 (street-level view)*

### Zoom Only
You can also provide just a zoom level without a location marker:

```
/map-workspace?zoom=10
```
*Applies zoom level 10 to the default map view (no marker)*

### Valid Examples

1. **Mozambique location with default zoom:**
   ```
   /map-workspace?loc=-25.98208,32.59083
   ```

2. **Mozambique location with close-up view:**
   ```
   /map-workspace?loc=-25.98208,32.59083&zoom=18
   ```

3. **New York City with street view:**
   ```
   /map-workspace?loc=40.7128,-74.0060&zoom=16
   ```

4. **London with wide area view:**
   ```
   /map-workspace?loc=51.5074,-0.1278&zoom=10
   ```

5. **Sydney with building-level detail:**
   ```
   /map-workspace?loc=-33.8688,151.2093&zoom=19
   ```

6. **Custom zoom on default location (no marker):**
   ```
   /map-workspace?zoom=12
   ```

## Zoom Level Guide

| Zoom Level | View Type | Use Case |
|------------|-----------|----------|
| 0-3 | World | Continental view |
| 4-6 | Country | National/regional view |
| 7-10 | State/Province | State or large city view |
| 11-13 | City | City or district view |
| 14-16 | Street | **Default** - Neighborhood/street view |
| 17-19 | Building | Building or property detail |
| 20-24 | Indoor | High detail (may exceed tile data availability) |

## Features

### What Happens When You Provide Parameters

#### `loc` only
1. **Red Pin Marker:** A Google Maps-style red pin appears at the specified coordinates
2. **Map Centers:** The map automatically centers on the marker location
3. **Default Zoom:** Zoom level 14 (street view)
4. **Tooltip:** Hovering over the marker shows the coordinates
5. **Pickable:** The marker can be clicked/selected

#### `loc` + `zoom`
Same as above, but uses your custom zoom level instead of 14

#### `zoom` only
- No marker is created
- Applies the specified zoom level to the default initial view state
- Useful for setting up a specific view without a location marker

### Marker Properties
- **Icon:** Default Google Maps-style red pin (48px size)
- **Color:** Red (#FF0000)
- **Layer ID:** `location-marker`
- **Tooltip:** Shows "Location: [latitude], [longitude]"
- **Hidden from Layer Control:** The marker layer does not appear in the LayerContentsControl

## Implementation Details

### Query String Parameters
```csharp
[SupplyParameterFromQuery(Name = "loc")]
public string? LocationQueryString { get; set; }

[SupplyParameterFromQuery(Name = "zoom")]
public string? ZoomQueryString { get; set; }
```

### Format Validation

**Location String:**
- Exactly 2 comma-separated values
- Both values are valid numbers
- Latitude is between -90 and 90
- Longitude is between -180 and 180

**Zoom Level:**
- Valid number (integer or decimal)
- Between 0 and 24
- Uses `CultureInfo.InvariantCulture` for parsing (decimal point, not comma)

### Error Handling

**Invalid location format:**
- Warning logged to console
- No marker is displayed
- Map uses the default initial view state (or custom zoom if provided)

**Invalid zoom format:**
- Warning logged to console
- Uses default zoom level (14 for location, or original default for no location)

### Console Messages

**Valid location with default zoom:**
```
📍 Location marker created at: -25.98208, 32.59083 (zoom: 14)
```

**Valid location with custom zoom:**
```
🔍 Custom zoom level: 18
📍 Location marker created at: -25.98208, 32.59083 (zoom: 18)
```

**Zoom only:**
```
🔍 Applied custom zoom level: 12 to default location
```

**Invalid location:**
```
⚠️ Invalid location format: abc,def. Expected format: latitude,longitude (e.g., -25.98208,32.59083)
```

**Invalid zoom:**
```
⚠️ Invalid zoom format: abc. Expected a number between 0 and 22.
```

## Google Maps Compatibility

This implementation follows the **Google Maps URL format** for locations:

### Google Maps URL Examples
```
https://www.google.com/maps?q=-25.98208,32.59083
https://www.google.com/maps/@-25.98208,32.59083,14z
https://www.google.com/maps/@-25.98208,32.59083,18z  (with zoom level)
```

The format in Google Maps URLs is: `@latitude,longitude,{zoom}z`

### Extracting Coordinates from Google Maps
1. Open Google Maps
2. Right-click on a location
3. Click the coordinates at the top of the menu (they'll be copied)
4. Paste into your URL: `/map-workspace?loc=<coordinates>`
5. Optionally add zoom: `/map-workspace?loc=<coordinates>&zoom=16`

## Code Example

### Generating Links Programmatically
```csharp
// In your Blazor component
private string GetMapWorkspaceUrl(double latitude, double longitude, double? zoom = null)
{
    var url = $"/map-workspace?loc={latitude},{longitude}";
    if (zoom.HasValue)
    {
        url += $"&zoom={zoom.Value}";
    }
    return url;
}

// Usage in Razor markup
<MudButton Href="@GetMapWorkspaceUrl(-25.98208, 32.59083)" Color="Color.Primary">
    View on Map (Default Zoom)
</MudButton>

<MudButton Href="@GetMapWorkspaceUrl(-25.98208, 32.59083, 18)" Color="Color.Secondary">
    View on Map (Close-Up)
</MudButton>
```

### Navigation from Code
```csharp
@inject NavigationManager NavigationManager

private void NavigateToLocation(double latitude, double longitude, double zoom = 14)
{
    var url = $"/map-workspace?loc={latitude},{longitude}&zoom={zoom}";
    NavigationManager.NavigateTo(url);
}

// Usage
private void ViewProperty()
{
    NavigateToLocation(-25.98208, 32.59083, zoom: 18); // Street-level view
}
```

### Using CultureInfo for URL Building
If working with different cultures, ensure decimals use dot notation:
```csharp
using System.Globalization;

private string GetMapWorkspaceUrl(double latitude, double longitude, double? zoom = null)
{
    var latStr = latitude.ToString(CultureInfo.InvariantCulture);
    var lonStr = longitude.ToString(CultureInfo.InvariantCulture);
    var url = $"/map-workspace?loc={latStr},{lonStr}";
    
    if (zoom.HasValue)
    {
        var zoomStr = zoom.Value.ToString(CultureInfo.InvariantCulture);
        url += $"&zoom={zoomStr}";
    }
    
    return url;
}
```

## Limitations

1. **Single Marker:** Only one location marker can be displayed at a time
2. **Static Marker:** The marker position cannot be changed without reloading the page with a new URL
3. **Coordinate Format:** Only decimal degrees format is supported (not DMS - Degrees, Minutes, Seconds)

## Future Enhancements

Possible improvements for future versions:
- Support for multiple markers via comma-separated locations
- Custom marker colors via additional query parameters
- Custom marker labels/names
- Support for DMS (Degrees, Minutes, Seconds) format
- Permalink button to copy current map view with marker
