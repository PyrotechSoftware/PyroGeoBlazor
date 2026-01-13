namespace PyroGeoBlazor.Demo.Examples;

using PyroGeoBlazor.Leaflet.Models;

/// <summary>
/// Example usage of tracking modified and deleted parcels in EditableGeoJsonLayer.
/// This example demonstrates how to use the new tracking features.
/// </summary>
public class EditableLayerTrackingExample
{
    public async Task DemoTrackingFeaturesAsync()
    {
        // Example assumes you have geoJsonData and options defined
        object geoJsonData = null!; // Your GeoJSON data
        EditableGeoJsonLayerOptions? options = null; // Your options
        
        // 1. Create an EditableGeoJsonLayer
        var editableLayer = new EditableGeoJsonLayer(geoJsonData, options);

        // 2. Subscribe to the modification events (optional - tracking happens automatically)
        editableLayer.OnFeatureCreated += (sender, args) =>
        {
            Console.WriteLine($"Feature created and added to modified collection. Total changes: {editableLayer.ModifiedFeatures.Count} modified, {editableLayer.DeletedFeatures.Count} deleted");
        };

        editableLayer.OnFeatureModified += (sender, args) =>
        {
            if (editableLayer.HasUnsavedChanges)
            {
                Console.WriteLine($"Feature modified. Total changes: {editableLayer.ModifiedFeatures.Count} modified, {editableLayer.DeletedFeatures.Count} deleted");
            }
        };

        editableLayer.OnFeatureDeleted += (sender, args) =>
        {
            Console.WriteLine($"Feature deleted. Total changes: {editableLayer.ModifiedFeatures.Count} modified, {editableLayer.DeletedFeatures.Count} deleted");
        };

        // 3. When user is ready to save, get all changes
        if (editableLayer.HasUnsavedChanges)
        {
            var changes = editableLayer.GetChangesSummary();
            
            // Access modified features (includes both created and edited features)
            foreach (var feature in changes.ModifiedFeatures)
            {
                Console.WriteLine($"Modified/Created feature ID: {feature.Id}");
                // Send to backend for saving (backend should use upsert logic)
                // await SaveModifiedFeature(feature);
            }
            
            // Access deleted features
            foreach (var feature in changes.DeletedFeatures)
            {
                Console.WriteLine($"Deleted feature ID: {feature.Id}");
                // Send to backend for deletion
                // await DeleteFeature(feature.Id);
            }
            
            Console.WriteLine($"Total changes: {changes.ModifiedCount} modified/created, {changes.DeletedCount} deleted");
        }

        // 4. After successfully saving to the backend, clear the tracked changes
        await SaveChangesToBackend(editableLayer.GetChangesSummary());
        editableLayer.ClearTrackedChanges();

        // Alternative: Clear only modified or deleted features separately
        // editableLayer.ClearModifiedFeatures();
        // editableLayer.ClearDeletedFeatures();

        // 5. Direct access to collections if needed
        var modifiedFeatureIds = editableLayer.ModifiedFeatures.Keys.ToList();
        var deletedFeatureIds = editableLayer.DeletedFeatures.Keys.ToList();
    }

    // Example backend save method
    private async Task SaveChangesToBackend(ChangesSummary changes)
    {
        if (changes.ModifiedCount > 0)
        {
            // Use upsert logic on backend - insert new features, update existing ones
            // await httpClient.PostAsJsonAsync("api/parcels/upsert", changes.ModifiedFeatures);
        }
        
        if (changes.DeletedCount > 0)
        {
            var deletedIds = changes.DeletedFeatures.Select(f => f.Id).ToList();
            // await httpClient.PostAsJsonAsync("api/parcels/delete", deletedIds);
        }
        
        await Task.CompletedTask;
    }
}
