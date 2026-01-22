namespace PyroGeoBlazor.DeckGL.Tests.Unit.Models;

using FluentAssertions;
using PyroGeoBlazor.DeckGL.Models;
using Xunit;

public class LayerConfigWithRendererTests
{
    [Fact]
    public void GeoJsonLayerConfig_CanHaveUniqueValueRenderer()
    {
        // Arrange & Act
        var layer = new GeoJsonLayerConfig
        {
            Id = "test-layer",
            UniqueValueRenderer = new UniqueValueRenderer
            {
                Attribute = "category",
                ValueStyles = new Dictionary<string, FeatureStyle>
                {
                    ["A"] = FeatureStyle.Red,
                    ["B"] = FeatureStyle.Blue
                }
            }
        };

        // Assert
        layer.UniqueValueRenderer.Should().NotBeNull();
        layer.UniqueValueRenderer!.Attribute.Should().Be("category");
        layer.UniqueValueRenderer.ValueStyles.Should().HaveCount(2);
    }

    [Fact]
    public void UniqueValueRenderer_WorksWithFeatureStyle()
    {
        // Arrange & Act
        var layer = new GeoJsonLayerConfig
        {
            Id = "test-layer",
            FeatureStyle = FeatureStyle.Blue, // Base style
            UniqueValueRenderer = new UniqueValueRenderer // Override with renderer
            {
                Attribute = "type",
                ValueStyles = new Dictionary<string, FeatureStyle>
                {
                    ["special"] = FeatureStyle.Red
                }
            }
        };

        // Assert
        layer.FeatureStyle.Should().NotBeNull();
        layer.UniqueValueRenderer.Should().NotBeNull();
    }

    [Fact]
    public void UniqueValueRenderer_WorksWithSelectionStyle()
    {
        // Arrange & Act
        var layer = new GeoJsonLayerConfig
        {
            Id = "test-layer",
            UniqueValueRenderer = new UniqueValueRenderer
            {
                Attribute = "status",
                ValueStyles = new Dictionary<string, FeatureStyle>
                {
                    ["active"] = FeatureStyle.Green
                }
            },
            SelectionStyle = FeatureStyle.Yellow // Selection overrides renderer
        };

        // Assert
        layer.UniqueValueRenderer.Should().NotBeNull();
        layer.SelectionStyle.Should().NotBeNull();
    }

    [Fact]
    public void Layer_CanSerializeWithUniqueValueRenderer()
    {
        // Arrange
        var layer = new GeoJsonLayerConfig
        {
            Id = "parcels",
            DataUrl = "/api/parcels.geojson",
            Pickable = true,
            UniqueValueRenderer = new UniqueValueRenderer
            {
                Attribute = "zoning",
                ValueStyles = new Dictionary<string, FeatureStyle>
                {
                    ["Residential"] = FeatureStyle.Blue,
                    ["Commercial"] = FeatureStyle.Red
                },
                DefaultStyle = FeatureStyle.Gray
            }
        };

        // Act
        var json = System.Text.Json.JsonSerializer.Serialize(layer);

        // Assert
        json.Should().Contain("\"id\":\"parcels\"");
        json.Should().Contain("\"uniqueValueRenderer\"");
        json.Should().Contain("\"attribute\":\"zoning\"");
        json.Should().Contain("\"valueStyles\"");
    }

    [Fact]
    public void Layer_CanDeserializeWithUniqueValueRenderer()
    {
        // Arrange
        var json = @"{
            ""id"": ""test-layer"",
            ""type"": ""GeoJsonLayer"",
            ""dataUrl"": ""/api/data.json"",
            ""uniqueValueRenderer"": {
                ""attribute"": ""category"",
                ""valueStyles"": {
                    ""A"": {
                        ""fillColor"": ""#FF0000""
                    },
                    ""B"": {
                        ""fillColor"": ""#0000FF""
                    }
                }
            }
        }";

        // Act
        var layer = System.Text.Json.JsonSerializer.Deserialize<GeoJsonLayerConfig>(json);

        // Assert
        layer.Should().NotBeNull();
        layer!.Id.Should().Be("test-layer");
        layer.UniqueValueRenderer.Should().NotBeNull();
        layer.UniqueValueRenderer!.Attribute.Should().Be("category");
        layer.UniqueValueRenderer.ValueStyles.Should().HaveCount(2);
    }

    [Fact]
    public void MultipleLayersWithDifferentRenderers_ShouldBeIndependent()
    {
        // Arrange & Act
        var layer1 = new GeoJsonLayerConfig
        {
            Id = "layer1",
            UniqueValueRenderer = UniqueValueRenderer.ForZoning()
        };

        var layer2 = new GeoJsonLayerConfig
        {
            Id = "layer2",
            UniqueValueRenderer = UniqueValueRenderer.ForLandUse()
        };

        // Assert
        layer1.UniqueValueRenderer!.Attribute.Should().Be("zoning");
        layer2.UniqueValueRenderer!.Attribute.Should().Be("landuse");
        layer1.UniqueValueRenderer.ValueStyles.Should().NotEqual(layer2.UniqueValueRenderer.ValueStyles);
    }

    [Fact]
    public void Layer_WithoutRenderer_ShouldHaveNullRenderer()
    {
        // Arrange & Act
        var layer = new GeoJsonLayerConfig
        {
            Id = "simple-layer",
            FeatureStyle = FeatureStyle.Blue
        };

        // Assert
        layer.UniqueValueRenderer.Should().BeNull();
    }

    [Fact]
    public void ScatterplotLayer_CanHaveUniqueValueRenderer()
    {
        // Arrange & Act
        var layer = new ScatterplotLayerConfig
        {
            Id = "points-layer",
            UniqueValueRenderer = new UniqueValueRenderer
            {
                Attribute = "magnitude",
                ValueStyles = new Dictionary<string, FeatureStyle>
                {
                    ["small"] = new FeatureStyle { RadiusScale = 0.5 },
                    ["large"] = new FeatureStyle { RadiusScale = 2.0 }
                }
            }
        };

        // Assert
        layer.UniqueValueRenderer.Should().NotBeNull();
        layer.UniqueValueRenderer!.ValueStyles["small"].RadiusScale.Should().Be(0.5);
        layer.UniqueValueRenderer.ValueStyles["large"].RadiusScale.Should().Be(2.0);
    }
}
