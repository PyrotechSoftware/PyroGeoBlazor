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
    /// Gets all township extensions as GeoJSON.
    /// </summary>
    /// <returns>GeoJSON FeatureCollection of township extensions.</returns>
    [HttpGet]
    [Produces("application/json")]
    public async Task<IActionResult> Get()
    {
        try
        {
            var extensions = await _context.VwTownshipExtensionsLayers
                .AsNoTracking()
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
