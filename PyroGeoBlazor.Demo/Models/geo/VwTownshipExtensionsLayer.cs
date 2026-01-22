using System;
using System.Collections.Generic;
using NetTopologySuite.Geometries;

namespace PyroGeoBlazor.Demo.Models;

public partial class VwTownshipExtensionsLayer
{
    public int GeoTownshipExtensionOrFarmId { get; set; }

    public string? TownshipExtensionOrFarmName { get; set; }

    public string? NationalIdentifierPrefix { get; set; }

    public Geometry Geometry { get; set; } = null!;
}
