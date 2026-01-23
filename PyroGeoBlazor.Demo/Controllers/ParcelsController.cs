namespace PyroGeoBlazor.Demo.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using NetTopologySuite.Features;
using NetTopologySuite.IO;

using PyroGeoBlazor.Demo.Models;

/// <summary>
/// API controller for retrieving parcels layer data as GeoJSON.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ParcelsController : ControllerBase
{
    private readonly PlannerContext _context;
    private readonly ILogger<ParcelsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ParcelsController"/> class.
    /// </summary>
    public ParcelsController(PlannerContext context, ILogger<ParcelsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gets parcels as GeoJSON, optionally filtered by viewport bounds and zoom level.
    /// </summary>
    /// <param name="minLon">Minimum longitude (west) of viewport bounds.</param>
    /// <param name="minLat">Minimum latitude (south) of viewport bounds.</param>
    /// <param name="maxLon">Maximum longitude (east) of viewport bounds.</param>
    /// <param name="maxLat">Maximum latitude (north) of viewport bounds.</param>
    /// <param name="zoom">Current zoom level.</param>
    /// <returns>GeoJSON FeatureCollection of parcels within the specified viewport.</returns>
    [HttpGet]
    [Produces("application/json")]
    public async Task<IActionResult> Get(
        [FromQuery] double? minLon,
        [FromQuery] double? minLat,
        [FromQuery] double? maxLon,
        [FromQuery] double? maxLat,
        [FromQuery] double? zoom)
    {
        try
        {
            var query = _context.VwParcelsLayers.AsNoTracking();

            // Apply viewport culling if bounds provided
            if (minLon.HasValue && minLat.HasValue && maxLon.HasValue && maxLat.HasValue)
            {
                // Create envelope (bounding box) from viewport bounds
                var envelope = new NetTopologySuite.Geometries.Envelope(
                    minLon.Value, maxLon.Value, minLat.Value, maxLat.Value);
                
                // Create geometry factory with SRID 4326 (WGS84 - standard lat/lon)
                var geometryFactory = NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
                var envelopeGeom = geometryFactory.ToGeometry(envelope);

                // Filter features that intersect with viewport
                query = query.Where(p => p.Geometry.Intersects(envelopeGeom));

                _logger.LogDebug("Viewport culling applied: [{MinLon}, {MinLat}] to [{MaxLon}, {MaxLat}], Zoom: {Zoom}",
                    minLon, minLat, maxLon, maxLat, zoom ?? -1);
            }

            var parcels = await query
                .Select(x => new Feature
                {
                    Geometry = x.Geometry,
                    Attributes = new AttributesTable
                    {
                        { "geoPropertyId", x.GeoPropertyId },
                        { "propertyId", x.PropertyId },
                        { "customIdentifier", x.CustomIdentifier }
                    }
                })
                .ToListAsync();

            _logger.LogInformation("Returning {Count} parcels (viewport culling: {Enabled}, bounds: [{MinLon}, {MinLat}] to [{MaxLon}, {MaxLat}])",
                parcels.Count, minLon.HasValue, minLon ?? 0, minLat ?? 0, maxLon ?? 0, maxLat ?? 0);

            var featureCollection = new FeatureCollection(parcels);

            var serializer = GeoJsonSerializer.Create();
            using var stringWriter = new StringWriter();

            serializer.Serialize(stringWriter, featureCollection);
            var geoJson = stringWriter.ToString();

            return Content(geoJson, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving parcels data");
            return StatusCode(500, "An error occurred while retrieving parcels data");
        }
    }
}

