using FluentAssertions;
using PyroGeoBlazor.Models;
using Xunit;

namespace PyroGeoBlazor.Tests.Unit;

public class ModelTests
{
    [Fact]
    public void WmtsLayerInfo_InitializesWithDefaults()
    {
        // Act
        var layer = new WmtsLayerInfo();

        // Assert
        layer.Identifier.Should().BeEmpty();
        layer.Title.Should().BeEmpty();
        layer.Abstract.Should().BeEmpty();
        layer.TileMatrixSets.Should().BeEmpty();
        layer.Formats.Should().BeEmpty();
        layer.Styles.Should().BeEmpty();
        layer.BoundingBox.Should().BeNull();
    }

    [Fact]
    public void WfsLayerInfo_InitializesWithDefaults()
    {
        // Act
        var layer = new WfsLayerInfo();

        // Assert
        layer.Name.Should().BeEmpty();
        layer.Title.Should().BeEmpty();
        layer.Abstract.Should().BeEmpty();
        layer.DefaultCrs.Should().BeEmpty();
        layer.OtherCrs.Should().BeEmpty();
        layer.BoundingBox.Should().BeNull();
        layer.OutputFormats.Should().BeEmpty();
    }

    [Fact]
    public void WmtsUrlTemplate_CanBePopulated()
    {
        // Act
        var template = new WmtsUrlTemplate
        {
            UrlTemplate = "https://test.com/{z}/{x}/{y}.png",
            Layer = "test-layer",
            TileMatrixSet = "EPSG:3857",
            Format = "image/png",
            Style = "default"
        };

        // Assert
        template.UrlTemplate.Should().Be("https://test.com/{z}/{x}/{y}.png");
        template.Layer.Should().Be("test-layer");
        template.TileMatrixSet.Should().Be("EPSG:3857");
        template.Format.Should().Be("image/png");
        template.Style.Should().Be("default");
    }

    [Fact]
    public void WfsLayerConfig_CanBePopulated()
    {
        // Arrange
        var boundingBox = new WfsBoundingBox
        {
            MinX = -180,
            MinY = -90,
            MaxX = 180,
            MaxY = 90,
            Crs = "EPSG:4326"
        };

        // Act
        var config = new WfsLayerConfig
        {
            ServiceUrl = "https://test.com/wfs",
            TypeName = "test:layer",
            Version = "2.0.0",
            SrsName = "EPSG:4326",
            BoundingBox = boundingBox,
            MaxFeatures = 1000
        };

        // Assert
        config.ServiceUrl.Should().Be("https://test.com/wfs");
        config.TypeName.Should().Be("test:layer");
        config.Version.Should().Be("2.0.0");
        config.SrsName.Should().Be("EPSG:4326");
        config.BoundingBox.Should().Be(boundingBox);
        config.MaxFeatures.Should().Be(1000);
    }

    [Fact]
    public void WfsBoundingBox_DefaultsToEPSG4326()
    {
        // Act
        var bbox = new WfsBoundingBox();

        // Assert
        bbox.Crs.Should().Be("EPSG:4326");
    }
}
