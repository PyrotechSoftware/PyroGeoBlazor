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
    /// Gets all parcels as GeoJSON.
    /// </summary>
    /// <returns>GeoJSON FeatureCollection of parcels.</returns>
    [HttpGet]
    [Produces("application/json")]
    public async Task<IActionResult> Get()
    {
        try
        {
            var parcels = await _context.VwParcelsLayers
                .AsNoTracking()
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
