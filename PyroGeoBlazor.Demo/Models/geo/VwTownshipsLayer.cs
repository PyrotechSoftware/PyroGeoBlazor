using System;
using System.Collections.Generic;
using NetTopologySuite.Geometries;

namespace PyroGeoBlazor.Demo.Models;

public partial class VwTownshipsLayer
{
    public int GeoTownshipId { get; set; }

    public string? NationalIdentifierPrefix { get; set; }

    public string? TownCode { get; set; }

    public string? TownName { get; set; }

    public Geometry Geometry { get; set; } = null!;
}
