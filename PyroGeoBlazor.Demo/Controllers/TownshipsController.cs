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
    /// Gets all townships as GeoJSON.
    /// </summary>
    /// <returns>GeoJSON FeatureCollection of townships.</returns>
    [HttpGet]
    [Produces("application/json")]
    public async Task<IActionResult> Get()
    {
        try
        {
            var townships = await _context.VwTownshipsLayers
                .AsNoTracking()
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
