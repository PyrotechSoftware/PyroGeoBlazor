namespace PyroGeoBlazor.DeckGL.Tests.Unit.Models;

using FluentAssertions;
using PyroGeoBlazor.DeckGL.Models;
using Xunit;

public class UniqueValueRendererTests
{
    [Fact]
    public void Constructor_ShouldInitializeWithDefaults()
    {
        // Arrange & Act
        var renderer = new UniqueValueRenderer();

        // Assert
        renderer.Attribute.Should().BeEmpty();
        renderer.ValueStyles.Should().NotBeNull();
        renderer.ValueStyles.Should().BeEmpty();
        renderer.DefaultStyle.Should().BeNull();
    }

    [Fact]
    public void Attribute_CanBeSet()
    {
        // Arrange
        var renderer = new UniqueValueRenderer();

        // Act
        renderer.Attribute = "zoning";

        // Assert
        renderer.Attribute.Should().Be("zoning");
    }

    [Fact]
    public void ValueStyles_CanAddMultipleEntries()
    {
        // Arrange
        var renderer = new UniqueValueRenderer
        {
            Attribute = "category"
        };

        // Act
        renderer.ValueStyles["A"] = FeatureStyle.Red;
        renderer.ValueStyles["B"] = FeatureStyle.Blue;
        renderer.ValueStyles["C"] = FeatureStyle.Green;

        // Assert
        renderer.ValueStyles.Should().HaveCount(3);
        renderer.ValueStyles["A"].FillColor.Should().Be("#FF0000");
        renderer.ValueStyles["B"].FillColor.Should().Be("#0096FF");
        renderer.ValueStyles["C"].FillColor.Should().Be("#00FF00");
    }

    [Fact]
    public void ValueStyles_CanHandleNullKey()
    {
        // Arrange
        var renderer = new UniqueValueRenderer
        {
            Attribute = "status"
        };

        // Act
        renderer.ValueStyles["null"] = FeatureStyle.Gray;
        renderer.ValueStyles["active"] = FeatureStyle.Green;

        // Assert
        renderer.ValueStyles.Should().HaveCount(2);
        renderer.ValueStyles["null"].FillColor.Should().Be("#868E96");
        renderer.ValueStyles["active"].FillColor.Should().Be("#00FF00");
    }

    [Fact]
    public void DefaultStyle_CanBeSet()
    {
        // Arrange
        var renderer = new UniqueValueRenderer
        {
            Attribute = "type"
        };

        // Act
        var orangeStyle = new FeatureStyle { FillColor = "#FF8C00", FillOpacity = 0.6 };
        renderer.DefaultStyle = orangeStyle;

        // Assert
        renderer.DefaultStyle.Should().BeSameAs(orangeStyle);
        renderer.DefaultStyle.FillColor.Should().Be("#FF8C00");
    }

    [Fact]
    public void ForZoning_ShouldReturnPreConfiguredRenderer()
    {
        // Act
        var renderer = UniqueValueRenderer.ForZoning();

        // Assert
        renderer.Attribute.Should().Be("zoning");
        renderer.ValueStyles.Should().NotBeEmpty();
        renderer.ValueStyles.Should().ContainKey("Residential");
        renderer.ValueStyles.Should().ContainKey("Commercial");
        renderer.ValueStyles.Should().ContainKey("Industrial");
        renderer.ValueStyles.Should().ContainKey("Park");
        renderer.DefaultStyle.Should().NotBeNull();
    }

    [Fact]
    public void ForZoning_ResidentialStyle_ShouldHaveCorrectColors()
    {
        // Act
        var renderer = UniqueValueRenderer.ForZoning();

        // Assert
        var residentialStyle = renderer.ValueStyles["Residential"];
        residentialStyle.FillColor.Should().Be("#FFE4B5");
        residentialStyle.FillOpacity.Should().Be(0.7);
        residentialStyle.LineColor.Should().Be("#8B4513");
        residentialStyle.LineWidth.Should().Be(1);
    }

    [Fact]
    public void ForZoning_CommercialStyle_ShouldHaveCorrectColors()
    {
        // Act
        var renderer = UniqueValueRenderer.ForZoning();

        // Assert
        var commercialStyle = renderer.ValueStyles["Commercial"];
        commercialStyle.FillColor.Should().Be("#FF6B6B");
        commercialStyle.FillOpacity.Should().Be(0.7);
        commercialStyle.LineColor.Should().Be("#C92A2A");
        commercialStyle.LineWidth.Should().Be(1);
    }

    [Fact]
    public void ForZoning_IndustrialStyle_ShouldHaveCorrectColors()
    {
        // Act
        var renderer = UniqueValueRenderer.ForZoning();

        // Assert
        var industrialStyle = renderer.ValueStyles["Industrial"];
        industrialStyle.FillColor.Should().Be("#A78BFA");
        industrialStyle.FillOpacity.Should().Be(0.7);
        industrialStyle.LineColor.Should().Be("#7C3AED");
        industrialStyle.LineWidth.Should().Be(1);
    }

    [Fact]
    public void ForZoning_ParkStyle_ShouldHaveCorrectColors()
    {
        // Act
        var renderer = UniqueValueRenderer.ForZoning();

        // Assert
        var parkStyle = renderer.ValueStyles["Park"];
        parkStyle.FillColor.Should().Be("#51CF66");
        parkStyle.FillOpacity.Should().Be(0.7);
        parkStyle.LineColor.Should().Be("#2F9E44");
        parkStyle.LineWidth.Should().Be(1);
    }

    [Fact]
    public void ForLandUse_ShouldReturnPreConfiguredRenderer()
    {
        // Act
        var renderer = UniqueValueRenderer.ForLandUse();

        // Assert
        renderer.Attribute.Should().Be("landuse");
        renderer.ValueStyles.Should().NotBeEmpty();
        renderer.ValueStyles.Should().ContainKey("Agriculture");
        renderer.ValueStyles.Should().ContainKey("Urban");
        renderer.ValueStyles.Should().ContainKey("Forest");
        renderer.ValueStyles.Should().ContainKey("Water");
        renderer.DefaultStyle.Should().NotBeNull();
    }

    [Fact]
    public void ForLandUse_AgricultureStyle_ShouldBeGreen()
    {
        // Act
        var renderer = UniqueValueRenderer.ForLandUse();

        // Assert
        var agricultureStyle = renderer.ValueStyles["Agriculture"];
        agricultureStyle.FillColor.Should().Be("#00FF00");
        agricultureStyle.FillOpacity.Should().Be(0.6);
    }

    [Fact]
    public void ForLandUse_UrbanStyle_ShouldBeRed()
    {
        // Act
        var renderer = UniqueValueRenderer.ForLandUse();

        // Assert
        var urbanStyle = renderer.ValueStyles["Urban"];
        urbanStyle.FillColor.Should().Be("#FF0000");
        urbanStyle.FillOpacity.Should().Be(0.6);
    }

    [Fact]
    public void ForLandUse_ForestStyle_ShouldHaveDarkGreenColor()
    {
        // Act
        var renderer = UniqueValueRenderer.ForLandUse();

        // Assert
        var forestStyle = renderer.ValueStyles["Forest"];
        forestStyle.FillColor.Should().Be("#2D5016");
        forestStyle.LineColor.Should().Be("#1A2E0A");
    }

    [Fact]
    public void ForLandUse_WaterStyle_ShouldHaveBlueColor()
    {
        // Act
        var renderer = UniqueValueRenderer.ForLandUse();

        // Assert
        var waterStyle = renderer.ValueStyles["Water"];
        waterStyle.FillColor.Should().Be("#1E88E5");
        waterStyle.LineColor.Should().Be("#0D47A1");
    }

    [Fact]
    public void CustomRenderer_WithMultipleValues_ShouldStoreAllStyles()
    {
        // Arrange & Act
        var renderer = new UniqueValueRenderer
        {
            Attribute = "priority",
            ValueStyles = new Dictionary<string, FeatureStyle>
            {
                ["High"] = new FeatureStyle { FillColor = "#FF0000", FillOpacity = 0.8 },
                ["Medium"] = new FeatureStyle { FillColor = "#FFFF00", FillOpacity = 0.6 },
                ["Low"] = new FeatureStyle { FillColor = "#00FF00", FillOpacity = 0.4 },
            },
            DefaultStyle = new FeatureStyle { FillColor = "#CCCCCC", FillOpacity = 0.2 }
        };

        // Assert
        renderer.ValueStyles.Should().HaveCount(3);
        renderer.ValueStyles["High"].FillColor.Should().Be("#FF0000");
        renderer.ValueStyles["Medium"].FillColor.Should().Be("#FFFF00");
        renderer.ValueStyles["Low"].FillColor.Should().Be("#00FF00");
        renderer.DefaultStyle.FillColor.Should().Be("#CCCCCC");
    }

    [Fact]
    public void Renderer_CanBeSerializedToJson()
    {
        // Arrange
        var renderer = new UniqueValueRenderer
        {
            Attribute = "category",
            ValueStyles = new Dictionary<string, FeatureStyle>
            {
                ["A"] = FeatureStyle.Red,
                ["B"] = FeatureStyle.Blue
            },
            DefaultStyle = FeatureStyle.Gray
        };

        // Act
        var json = System.Text.Json.JsonSerializer.Serialize(renderer);

        // Assert
        json.Should().Contain("\"attribute\":\"category\"");
        json.Should().Contain("\"valueStyles\"");
        json.Should().Contain("\"defaultStyle\"");
    }

    [Fact]
    public void Renderer_CanBeDeserializedFromJson()
    {
        // Arrange
        var json = @"{
            ""attribute"": ""status"",
            ""valueStyles"": {
                ""active"": {
                    ""fillColor"": ""#00FF00"",
                    ""fillOpacity"": 0.7
                },
                ""inactive"": {
                    ""fillColor"": ""#FF0000"",
                    ""fillOpacity"": 0.5
                }
            },
            ""defaultStyle"": {
                ""fillColor"": ""#808080"",
                ""fillOpacity"": 0.3
            }
        }";

        // Act
        var renderer = System.Text.Json.JsonSerializer.Deserialize<UniqueValueRenderer>(json);

        // Assert
        renderer.Should().NotBeNull();
        renderer!.Attribute.Should().Be("status");
        renderer.ValueStyles.Should().HaveCount(2);
        renderer.ValueStyles["active"].FillColor.Should().Be("#00FF00");
        renderer.ValueStyles["inactive"].FillColor.Should().Be("#FF0000");
        renderer.DefaultStyle.Should().NotBeNull();
        renderer.DefaultStyle!.FillColor.Should().Be("#808080");
    }
}
