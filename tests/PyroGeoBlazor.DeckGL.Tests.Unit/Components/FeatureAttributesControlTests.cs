namespace PyroGeoBlazor.DeckGL.Tests.Unit.Components;

using Bunit;

using FluentAssertions;

using MudBlazor;

using PyroGeoBlazor.DeckGL.Components;
using PyroGeoBlazor.DeckGL.Models;

using System.Text.Json;

public class FeatureAttributesControlTests : MudBlazorTestContext
{

    [Fact]
    public void FeatureAttributesControl_ShowsEmptyState_WhenNoFeatureSelected()
    {
        // Arrange & Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeature, null));

        // Assert
        cut.Markup.Should().Contain("Click a feature to view its attributes");
    }

    [Fact]
    public void FeatureAttributesControl_DisplaysFeatureProperties()
    {
        // Arrange
        var featureJson = """
        {
            "type": "Feature",
            "id": "feature-1",
            "properties": {
                "name": "Test Feature",
                "value": 123
            }
        }
        """;
        
        var feature = JsonSerializer.Deserialize<JsonElement>(featureJson);
        var selectedFeature = new SelectedFeature
        {
            LayerId = "test-layer",
            Feature = feature
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeature, selectedFeature));

        // Assert
        cut.Markup.Should().Contain("name");
        cut.Markup.Should().Contain("Test Feature");
        cut.Markup.Should().Contain("value");
        cut.Markup.Should().Contain("123");
    }

    [Fact]
    public void FeatureAttributesControl_DoesNotShowLockedIndicator_WhenNotLocked()
    {
        // Arrange
        var featureJson = """
        {
            "type": "Feature",
            "properties": {
                "name": "Test"
            }
        }
        """;
        
        var feature = JsonSerializer.Deserialize<JsonElement>(featureJson);
        var selectedFeature = new SelectedFeature
        {
            LayerId = "test-layer",
            Feature = feature
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeature, selectedFeature)
            .Add(p => p.IsLocked, false));

        // Assert
        cut.Markup.ToLower().Should().NotContain("locked");
    }

    [Fact]
    public void FeatureAttributesControl_ShowsLockedIndicator_WhenLocked()
    {
        // Arrange
        var featureJson = """
        {
            "type": "Feature",
            "properties": {
                "name": "Test"
            }
        }
        """;
        
        var feature = JsonSerializer.Deserialize<JsonElement>(featureJson);
        var selectedFeature = new SelectedFeature
        {
            LayerId = "test-layer",
            Feature = feature
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeature, selectedFeature)
            .Add(p => p.IsLocked, true));

        // Assert
        cut.Markup.ToLower().Should().Contain("locked");
    }

    [Fact]
    public void FeatureAttributesControl_LockedIndicator_HasLockIcon()
    {
        // Arrange
        var featureJson = """
        {
            "type": "Feature",
            "properties": {
                "name": "Test"
            }
        }
        """;
        
        var feature = JsonSerializer.Deserialize<JsonElement>(featureJson);
        var selectedFeature = new SelectedFeature
        {
            LayerId = "test-layer",
            Feature = feature
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeature, selectedFeature)
            .Add(p => p.IsLocked, true));

        // Assert - should have a MudChip with lock icon
        var chips = cut.FindComponents<MudChip<string>>();
        chips.Should().NotBeEmpty("should have a locked chip");
        
        var lockedChip = chips.FirstOrDefault(c => c.Markup.ToLower().Contains("locked"));
        lockedChip.Should().NotBeNull("should have a chip with 'locked' text");
    }

    [Fact]
    public void FeatureAttributesControl_ExcludesSpecifiedProperties()
    {
        // Arrange
        var featureJson = """
        {
            "type": "Feature",
            "properties": {
                "name": "Test Feature",
                "value": 123,
                "internalId": "secret-value"
            }
        }
        """;
        
        var feature = JsonSerializer.Deserialize<JsonElement>(featureJson);
        var selectedFeature = new SelectedFeature
        {
            LayerId = "test-layer",
            Feature = feature
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeature, selectedFeature)
            .Add(p => p.ExcludedProperties, new[] { "internalId" }));

        // Assert
        cut.Markup.Should().Contain("name");
        cut.Markup.Should().Contain("Test Feature");
        cut.Markup.Should().Contain("value");
        cut.Markup.Should().NotContain("internalId", "excluded properties should not be displayed");
        cut.Markup.Should().NotContain("secret-value", "excluded property values should not be displayed");
    }

    [Fact]
    public void FeatureAttributesControl_DisplaysFeatureId_WhenPresent()
    {
        // Arrange
        var featureJson = """
        {
            "type": "Feature",
            "id": "feature-123",
            "properties": {
                "name": "Test"
            }
        }
        """;
        
        var feature = JsonSerializer.Deserialize<JsonElement>(featureJson);
        var selectedFeature = new SelectedFeature
        {
            LayerId = "test-layer",
            Feature = feature
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeature, selectedFeature));

        // Assert
        cut.Markup.Should().Contain("id");
        cut.Markup.Should().Contain("feature-123");
    }

    [Fact]
    public void FeatureAttributesControl_HandlesFeatureWithNoProperties()
    {
        // Arrange
        var featureJson = """
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-122.45, 37.8]
            }
        }
        """;
        
        var feature = JsonSerializer.Deserialize<JsonElement>(featureJson);
        var selectedFeature = new SelectedFeature
        {
            LayerId = "test-layer",
            Feature = feature
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeature, selectedFeature));

        // Assert
        cut.Markup.Should().Contain("No properties available");
    }
}
