using System;
using System.Collections.Generic;
using NetTopologySuite.Geometries;

namespace PyroGeoBlazor.Demo.Models;

public partial class VwParcelsLayer
{
    public int GeoPropertyId { get; set; }

    public int? PropertyId { get; set; }

    public string? Source { get; set; }

    public string? Lpi { get; set; }

    public string? Unit { get; set; }

    public string? CustomIdentifier { get; set; }

    public string? InspectionStateCode { get; set; }

    public int? InspectionProjectId { get; set; }

    public Geometry Geometry { get; set; } = null!;

    public double? LocationLatitude { get; set; }

    public double? LocationLongitude { get; set; }
}
