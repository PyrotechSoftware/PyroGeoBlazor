# EditableGeoJsonLayer Change Tracking

## Overview
The EditableGeoJsonLayer now automatically tracks created, modified, and deleted features, making it easy for client applications to implement save functionality.

## Key Changes

### 1. Modified Features Collection
- **Includes**: Both newly created features AND edited features
- **Reason**: Both need to be saved to the backend (use upsert logic)
- **Access**: `editableLayer.ModifiedFeatures` (read-only dictionary)

### 2. Deleted Features Collection
- **Includes**: Features that have been deleted from the layer
- **Access**: `editableLayer.DeletedFeatures` (read-only dictionary)

### 3. Automatic Tracking
All tracking happens automatically when:
- A feature is created → Added to `ModifiedFeatures`
- A feature is modified → Added/Updated in `ModifiedFeatures`
- A feature is deleted → Added to `DeletedFeatures`, removed from `ModifiedFeatures`

## Usage Pattern

```csharp
// Check if there are unsaved changes
if (editableLayer.HasUnsavedChanges)
{
    // Get summary of all changes
    var changes = editableLayer.GetChangesSummary();
    
    // Save modified features (includes created and edited)
    await SaveModifiedFeatures(changes.ModifiedFeatures);
    
    // Delete removed features
    await DeleteFeatures(changes.DeletedFeatures);
    
    // Clear tracked changes after successful save
    editableLayer.ClearTrackedChanges();
}
```

## API Reference

### Properties
- `ModifiedFeatures`: Read-only collection of created and modified features
- `DeletedFeatures`: Read-only collection of deleted features
- `HasUnsavedChanges`: Boolean indicating if there are any unsaved changes

### Methods
- `GetChangesSummary()`: Returns a `ChangesSummary` object with all changes
- `ClearTrackedChanges()`: Clears all tracked changes (call after successful save)
- `ClearModifiedFeatures()`: Clears only modified features
- `ClearDeletedFeatures()`: Clears only deleted features

### ChangesSummary Class
```csharp
public class ChangesSummary
{
    public List<GeoJsonFeature> ModifiedFeatures { get; set; }
    public List<GeoJsonFeature> DeletedFeatures { get; set; }
    public int ModifiedCount { get; set; }
    public int DeletedCount { get; set; }
    public bool HasChanges { get; }
}
```

## Backend Integration

Your backend should implement:

1. **Upsert endpoint** for modified features:
   - If feature ID exists → UPDATE
   - If feature ID doesn't exist → INSERT

2. **Delete endpoint** for deleted features:
   - Delete by feature ID

## Example

See `PyroGeoBlazor.Demo\Examples\EditableLayerTrackingExample.cs` for a complete working example.
