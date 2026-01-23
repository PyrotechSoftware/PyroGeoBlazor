namespace PyroGeoBlazor.Demo.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using NetTopologySuite.Features;
using NetTopologySuite.IO;

using PyroGeoBlazor.Demo.Models;

/// <summary>
/// API controller for retrieving township extensions layer data as GeoJSON.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TownshipExtensionsController : ControllerBase
{
    private readonly PlannerContext _context;
    private readonly ILogger<TownshipExtensionsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="TownshipExtensionsController"/> class.
    /// </summary>
    public TownshipExtensionsController(PlannerContext context, ILogger<TownshipExtensionsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gets township extensions as GeoJSON, optionally filtered by viewport bounds and zoom level.
    /// </summary>
    /// <param name="minLon">Minimum longitude (west) of viewport bounds.</param>
    /// <param name="minLat">Minimum latitude (south) of viewport bounds.</param>
    /// <param name="maxLon">Maximum longitude (east) of viewport bounds.</param>
    /// <param name="maxLat">Maximum latitude (north) of viewport bounds.</param>
    /// <param name="zoom">Current zoom level.</param>
    /// <returns>GeoJSON FeatureCollection of township extensions within the specified viewport.</returns>
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
            var query = _context.VwTownshipExtensionsLayers.AsNoTracking();

            // Apply viewport culling if bounds provided
            if (minLon.HasValue && minLat.HasValue && maxLon.HasValue && maxLat.HasValue)
            {
                var envelope = new NetTopologySuite.Geometries.Envelope(
                    minLon.Value, maxLon.Value, minLat.Value, maxLat.Value);
                
                // Create geometry factory with SRID 4326 (WGS84 - standard lat/lon)
                var geometryFactory = NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
                var envelopeGeom = geometryFactory.ToGeometry(envelope);

                query = query.Where(t => t.Geometry.Intersects(envelopeGeom));

                _logger.LogDebug("Viewport culling applied: [{MinLon}, {MinLat}] to [{MaxLon}, {MaxLat}], Zoom: {Zoom}",
                    minLon, minLat, maxLon, maxLat, zoom ?? -1);
            }

            var extensions = await query
                .Select(x => new Feature
                {
                    Geometry = x.Geometry,
                    Attributes = new AttributesTable
                    {
                        { "geoTownshipExtensionOrFarmId", x.GeoTownshipExtensionOrFarmId },
                        { "townshipExtensionOrFarmName", x.TownshipExtensionOrFarmName },
                        { "nationalIdentifierPrefix", x.NationalIdentifierPrefix }
                    }
                })
                .ToListAsync();

            _logger.LogInformation("Returning {Count} township extensions (viewport culling: {Enabled})",
                extensions.Count, minLon.HasValue);

            var featureCollection = new FeatureCollection(extensions);

            var serializer = GeoJsonSerializer.Create();
            using var stringWriter = new StringWriter();

            serializer.Serialize(stringWriter, featureCollection);
            var geoJson = stringWriter.ToString();

            return Content(geoJson, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving township extensions data");
            return StatusCode(500, "An error occurred while retrieving township extensions data");
        }
    }
}

