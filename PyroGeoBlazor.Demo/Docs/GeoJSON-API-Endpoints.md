# GeoJSON API Endpoints Documentation

## Overview
Three new API endpoints have been added to the PyroGeoBlazor.Demo project to serve GeoJSON data from the PlannerContext database.

## Endpoints

### 1. Townships Endpoint
**URL:** `GET /api/townships`  
**Description:** Returns all townships as GeoJSON FeatureCollection  
**Response Content-Type:** `application/json`

**GeoJSON Properties:**
- `geoTownshipId` - Township ID
- `nationalIdentifierPrefix` - National identifier prefix
- `townCode` - Town code
- `townName` - Town name
- `geometry` - GeoJSON geometry (Polygon/MultiPolygon)

---

### 2. Township Extensions Endpoint
**URL:** `GET /api/townshipextensions`  
**Description:** Returns all township extensions/farms as GeoJSON FeatureCollection  
**Response Content-Type:** `application/json`

**GeoJSON Properties:**
- `geoTownshipExtensionOrFarmId` - Extension/Farm ID
- `townshipExtensionOrFarmName` - Extension/Farm name
- `nationalIdentifierPrefix` - National identifier prefix
- `geometry` - GeoJSON geometry (Polygon/MultiPolygon)

---

### 3. Parcels Endpoint
**URL:** `GET /api/parcels`  
**Description:** Returns all parcels as GeoJSON FeatureCollection  
**Response Content-Type:** `application/json`

**GeoJSON Properties:**
- `geoPropertyId` - Property ID
- `propertyId` - Property ID (nullable)
- `source` - Data source
- `lpi` - Legal Property Identifier
- `unit` - Unit identifier
- `customIdentifier` - Custom identifier
- `inspectionStateCode` - Inspection state code
- `inspectionProjectId` - Inspection project ID (nullable)
- `locationLatitude` - Location latitude (nullable)
- `locationLongitude` - Location longitude (nullable)
- `geometry` - GeoJSON geometry (Polygon/MultiPolygon)

## Database Configuration

The endpoints require a properly configured SQL Server database connection. The connection string is configured in `appsettings.json` and `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "PlannerDatabase": "Server=(localdb)\\mssqllocaldb;Database=PlannerDatabase;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

**Note:** Update the connection string to match your database server and database name.

## Technical Details

### Technologies Used
- **NetTopologySuite.IO.GeoJSON** - For GeoJSON serialization
- **NetTopologySuite.Features** - For Feature and FeatureCollection support
- **Entity Framework Core** - For database access
- **Microsoft.EntityFrameworkCore.SqlServer.NetTopologySuite** - For spatial type support

### Error Handling
All endpoints include error handling that:
- Logs errors using `ILogger`
- Returns HTTP 500 status with a generic error message on failure
- Uses `AsNoTracking()` for read-only queries to improve performance

### Example Usage

#### Using Fetch API (JavaScript)
```javascript
// Fetch townships
const response = await fetch('/api/townships');
const geojson = await response.json();

// Add to your map (example with Leaflet)
L.geoJSON(geojson).addTo(map);
```

#### Using HttpClient (C#)
```csharp
using var client = new HttpClient();
var geojson = await client.GetStringAsync("https://localhost:5001/api/townships");
```

#### Direct Browser Access
Simply navigate to:
- `https://localhost:5001/api/townships`
- `https://localhost:5001/api/townshipextensions`
- `https://localhost:5001/api/parcels`

## Files Modified/Created

### Created
- `PyroGeoBlazor.Demo\Controllers\TownshipsController.cs`
- `PyroGeoBlazor.Demo\Controllers\TownshipExtensionsController.cs`
- `PyroGeoBlazor.Demo\Controllers\ParcelsController.cs`

### Modified
- `PyroGeoBlazor.Demo\Program.cs` - Added PlannerContext registration
- `PyroGeoBlazor.Demo\PyroGeoBlazor.Demo.csproj` - Added NuGet package
- `PyroGeoBlazor.Demo\appsettings.json` - Added connection string
- `PyroGeoBlazor.Demo\appsettings.Development.json` - Added connection string

## Next Steps

1. **Update Connection String:** Modify the connection string in `appsettings.json` to point to your actual database
2. **Test Endpoints:** Run the application and test each endpoint in a browser or API testing tool
3. **Integration:** Use these endpoints in your map components to load local data instead of external URLs

## Integration Example with DeckGLView

To use these endpoints with the MapWorkspacePage, update the layer configuration:

```csharp
var geoJsonLayer = new GeoJsonLayerConfig
{
    Id = "townships-layer",
    DataUrl = "/api/townships",  // Use your new endpoint!
    Pickable = true,
    Stroked = true,
    Filled = true,
    // ... other properties
};
```
