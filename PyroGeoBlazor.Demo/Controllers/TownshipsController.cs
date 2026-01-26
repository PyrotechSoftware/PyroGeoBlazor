namespace PyroGeoBlazor.Demo.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using NetTopologySuite.Features;
using NetTopologySuite.IO;

using PyroGeoBlazor.Demo.Models;

/// <summary>
/// API controller for retrieving townships layer data as GeoJSON.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TownshipsController : ControllerBase
{
    private readonly PlannerContext _context;
    private readonly ILogger<TownshipsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="TownshipsController"/> class.
    /// </summary>
    public TownshipsController(PlannerContext context, ILogger<TownshipsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gets townships as GeoJSON, optionally filtered by viewport bounds and zoom level.
    /// </summary>
    /// <param name="minLon">Minimum longitude (west) of viewport bounds.</param>
    /// <param name="minLat">Minimum latitude (south) of viewport bounds.</param>
    /// <param name="maxLon">Maximum longitude (east) of viewport bounds.</param>
    /// <param name="maxLat">Maximum latitude (north) of viewport bounds.</param>
    /// <param name="zoom">Current zoom level.</param>
    /// <returns>GeoJSON FeatureCollection of townships within the specified viewport.</returns>
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
            var query = _context.VwTownshipsLayers.AsNoTracking();

            // Apply viewport culling if bounds provided
            if (minLon.HasValue && minLat.HasValue && maxLon.HasValue && maxLat.HasValue)
            {
                // Add 50% padding to viewport bounds to load features near edges
                // This provides a buffer for smooth panning without visible data loading
                var lonRange = maxLon.Value - minLon.Value;
                var latRange = maxLat.Value - minLat.Value;
                var paddingFactor = 0.5; // 50% padding on each side
                
                var paddedMinLon = minLon.Value - (lonRange * paddingFactor);
                var paddedMaxLon = maxLon.Value + (lonRange * paddingFactor);
                var paddedMinLat = minLat.Value - (latRange * paddingFactor);
                var paddedMaxLat = maxLat.Value + (latRange * paddingFactor);
                
                // Create envelope (bounding box) from padded viewport bounds
                var envelope = new NetTopologySuite.Geometries.Envelope(
                    paddedMinLon, paddedMaxLon, paddedMinLat, paddedMaxLat);
                
                // Create a polygon from the envelope with SRID 4326 (WGS84 - standard lat/lon)
                var geometryFactory = NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
                var envelopeGeom = geometryFactory.ToGeometry(envelope);

                // Filter features that intersect with viewport
                query = query.Where(t => t.Geometry.Intersects(envelopeGeom));

                _logger.LogDebug("Viewport culling applied with {PaddingFactor}x padding: [{MinLon}, {MinLat}] to [{MaxLon}, {MaxLat}] -> [{PaddedMinLon}, {PaddedMinLat}] to [{PaddedMaxLon}, {PaddedMaxLat}], Zoom: {Zoom}",
                    paddingFactor, minLon, minLat, maxLon, maxLat, paddedMinLon, paddedMinLat, paddedMaxLon, paddedMaxLat, zoom ?? -1);
            }

            var townships = await query
                .Select(x => new Feature
                {
                    Geometry = x.Geometry,
                    Attributes = new AttributesTable
                    {
                        { "geoTownshipId", x.GeoTownshipId },
                        { "nationalIdentifierPrefix", x.NationalIdentifierPrefix },
                        { "townCode", x.TownCode },
                        { "townName", x.TownName }
                    }
                })
                .ToListAsync();

            _logger.LogInformation("Returning {Count} townships (viewport culling: {Enabled})",
                townships.Count, minLon.HasValue);

            var featureCollection = new FeatureCollection(townships);

            var serializer = GeoJsonSerializer.Create();
            using var stringWriter = new StringWriter();

            serializer.Serialize(stringWriter, featureCollection);
            var geoJson = stringWriter.ToString();

            return Content(geoJson, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving townships data");
            return StatusCode(500, "An error occurred while retrieving townships data");
        }
    }
}
