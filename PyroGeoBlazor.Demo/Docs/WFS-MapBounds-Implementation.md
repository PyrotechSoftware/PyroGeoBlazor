# WFS with Map Bounds Filtering - Implementation Guide

## Overview

This implementation demonstrates how to load WFS features dynamically based on the current map viewport. This is essential for:
- **Performance** - Only load visible features
- **Data efficiency** - Reduce network bandwidth
- **User experience** - Faster loading times

## Implementation

### 1. Load WFS Based on Current Map Bounds

The `AddWfsLayer()` method now:
1. Gets the current map bounds using `GetBounds()`
2. Creates a `WfsBoundingBox` from the map extent
3. Passes it to the WFS request

```csharp
public async Task AddWfsLayer()
{
    if (PositionMap is null) return;

    // Get current map bounds
    var bounds = await PositionMap.GetBounds();
    
    // Create WFS layer with bounding box filter
    WfsLayer = new WfsLayer(
        wfsUrl: "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows",
        wfsParameters: new WfsRequestParameters
        {
            TypeName = "PlannerSpatial:vwParcelsLayer",
            MaxFeatures = 5000,
            SrsName = "EPSG:4326",
            BBox = new WfsBoundingBox
            {
                MinX = bounds.SouthWest.Lng,  // West
                MinY = bounds.SouthWest.Lat,  // South
                MaxX = bounds.NorthEast.Lng,  // East
                MaxY = bounds.NorthEast.Lat,  // North
                Srs = "EPSG:4326"
            }
        },
        options: new GeoJsonLayerOptions { ... }
    );

    await WfsLayer.AddTo(PositionMap);
    await WfsLayer.LoadFeaturesAsync();
}
```

### 2. Refresh WFS After Pan/Zoom

The `RefreshWfsLayer()` method:
1. Gets updated map bounds
2. Removes the old layer
3. Creates a new layer with updated bounds
4. Loads fresh data

```csharp
public async Task RefreshWfsLayer()
{
    if (PositionMap is null || WfsLayer is null) return;

    // Get NEW bounds after pan/zoom
    var bounds = await PositionMap.GetBounds();
    
    // Remove old layer
    await WfsLayer.RemoveLayer();

    // Create new layer with updated bounds
    WfsLayer = new WfsLayer(
        wfsUrl: "https://lims.koleta.co.mz/geoserver/PlannerSpatial/ows",
        wfsParameters: new WfsRequestParameters
        {
            TypeName: "PlannerSpatial:vwParcelsLayer",
            MaxFeatures = 5000,
            SrsName = "EPSG:4326",
            BBox = new WfsBoundingBox
            {
                MinX = bounds.SouthWest.Lng,
                MinY = bounds.SouthWest.Lat,
                MaxX = bounds.NorthEast.Lng,
                MaxY = bounds.NorthEast.Lat,
                Srs = "EPSG:4326"
            }
        },
        options: new GeoJsonLayerOptions { ... }
    );

    await WfsLayer.AddTo(PositionMap);
    await WfsLayer.LoadFeaturesAsync();
}
```

## UI Buttons

```razor
<button class="btn btn-primary" @onclick="AddWfsLayer">
    Add WFS Layer (Bounded to View)
</button>
<button class="btn btn-success" @onclick="RefreshWfsLayer">
    Refresh WFS Layer (Update Bounds)
</button>
```

## How the WFS Request Works

### Without BBox (Loads ALL features)
```
GET https://server.com/geoserver/ows?
  service=WFS&
  version=1.0.0&
  request=GetFeature&
  typeName=Workspace:Layer&
  outputFormat=application/json&
  maxFeatures=5000
```

### With BBox (Loads ONLY visible features)
```
GET https://server.com/geoserver/ows?
  service=WFS&
  version=1.0.0&
  request=GetFeature&
  typeName=Workspace:Layer&
  outputFormat=application/json&
  maxFeatures=5000&
  bbox=174.0,-43.0,175.0,-42.0,EPSG:4326
```

## Usage Workflow

1. **User clicks "Add WFS Layer"**
   - Gets current map bounds
   - Loads features within view
   - Features appear immediately

2. **User pans/zooms the map**
   - Map shows different area
   - Old features still visible

3. **User clicks "Refresh WFS Layer"**
   - Gets NEW map bounds
   - Removes old features
   - Loads features for new view
   - Updates display

## Console Output Example

```
Loading WFS features for bounds: SW(-43.2, 174.5) NE(-42.8, 175.1)
Loading WFS features for current map bounds...
WFS features loaded successfully! (within bounds)

// User pans map to different area

Refreshing WFS features for new bounds: SW(-41.5, 173.2) NE(-41.1, 173.8)
WFS layer refreshed with new bounds!
```

## Performance Optimization Tips

### 1. **Use Appropriate MaxFeatures**
```csharp
// For dense urban areas
MaxFeatures = 1000

// For rural areas
MaxFeatures = 5000

// Adjust based on zoom level
MaxFeatures = zoomLevel > 15 ? 500 : 2000
```

### 2. **Combine with CQL Filter**
```csharp
wfsParameters: new WfsRequestParameters
{
    TypeName = "PlannerSpatial:vwParcelsLayer",
    MaxFeatures = 5000,
    CqlFilter = "area > 1000",  // Only large parcels
    BBox = new WfsBoundingBox { ... }
}
```

### 3. **Limit Properties**
```csharp
wfsParameters: new WfsRequestParameters
{
    TypeName = "PlannerSpatial:vwParcelsLayer",
    PropertyName = "parcel_id,owner,geometry",  // Only these fields
    BBox = new WfsBoundingBox { ... }
}
```

## Advanced: Auto-Refresh on Map Move

To automatically refresh when the user stops panning:

```csharp
private System.Timers.Timer? _refreshTimer;

protected override async Task OnAfterRenderAsync(bool firstRender)
{
    if (firstRender && PositionMap is not null)
    {
        // Subscribe to map move events
        PositionMap.OnMoveEnd += OnMapMoveEnd;
    }
}

private void OnMapMoveEnd(object? sender, LeafletEventArgs e)
{
    // Debounce: wait 500ms after user stops moving
    _refreshTimer?.Stop();
    _refreshTimer = new System.Timers.Timer(500);
    _refreshTimer.Elapsed += async (s, args) =>
    {
        await RefreshWfsLayer();
        _refreshTimer.Stop();
    };
    _refreshTimer.Start();
}
```

## Comparison: WFS with BBox vs Vector Tiles

| Feature | WFS + BBox | Vector Tiles |
|---------|------------|--------------|
| **Setup** | Simple | Requires GeoWebCache |
| **Performance** | Good for <5K features | Excellent for any size |
| **Dynamic Filtering** | ✅ Full WFS capabilities | ⚠️ Limited to tile spec |
| **Complete Features** | ✅ Yes | ⚠️ Split at tile boundaries |
| **Server Load** | ⚠️ One request per refresh | ✅ Cached tiles |
| **Best For** | Dynamic queries, small-medium datasets | Large static datasets |

## When to Use Each Approach

### Use WFS with BBox when:
- Dataset is <10,000 features total
- Need real-time data (no caching)
- Need complex CQL filtering
- Features must be complete (not split)
- Server can handle request load

### Use Vector Tiles when:
- Dataset is >50,000 features
- Data is relatively static
- Need maximum performance
- Have GeoWebCache configured
- Feature splitting is acceptable

## Common Issues & Solutions

### Issue: Too many features returned
**Solution**: Reduce `MaxFeatures` or zoom in before loading

### Issue: Slow refresh
**Solution**: Add `PropertyName` to limit attributes, use CQL filter

### Issue: Features disappear after panning
**Expected**: Click "Refresh" to load features for new area

### Issue: Duplicate features at tile edges
**Solution**: This doesn't happen with WFS - that's a Vector Tile issue!

## Files Modified

- `PyroGeoBlazor.Demo\Components\Pages\Home.razor.cs`
  - Updated `AddWfsLayer()` - Added BBox from map bounds
  - Added `RefreshWfsLayer()` - New method for refreshing

- `PyroGeoBlazor.Demo\Components\Pages\Home.razor`
  - Updated button label: "Add WFS Layer (Bounded to View)"
  - Added button: "Refresh WFS Layer (Update Bounds)"

## Testing Checklist

- [ ] Click "Add WFS Layer" - Features load for current view
- [ ] Console shows current bounds
- [ ] Features appear on map
- [ ] Pan to different area
- [ ] Click "Refresh WFS Layer"
- [ ] Old features removed, new features load
- [ ] Console shows new bounds
- [ ] Zoom in/out and refresh - Different feature density

## Summary

✅ **WFS now loads only visible features**  
✅ **Refresh button updates for current view**  
✅ **Console logs show bounds for debugging**  
✅ **Performance optimized with MaxFeatures**  
✅ **Complete features (no tile splitting)**  

The implementation is complete and ready to use! 🎉
