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

    [Fact]
    public void FeatureAttributesControl_MultiEdit_ShowsFeatureCount()
    {
        // Arrange
        var feature1Json = """{"type": "Feature", "id": "f1", "properties": {"name": "Feature 1"}}""";
        var feature2Json = """{"type": "Feature", "id": "f2", "properties": {"name": "Feature 2"}}""";
        
        var features = new List<SelectedFeature>
        {
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature1Json) },
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature2Json) }
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeatures, features));

        // Assert
        cut.Markup.Should().Contain("(2 selected)", "should show count of selected features in header");
    }

    [Fact]
    public void FeatureAttributesControl_MultiEdit_ShowsCommonValue()
    {
        // Arrange
        var feature1Json = """{"type": "Feature", "properties": {"status": "active", "name": "F1"}}""";
        var feature2Json = """{"type": "Feature", "properties": {"status": "active", "name": "F2"}}""";
        
        var features = new List<SelectedFeature>
        {
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature1Json) },
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature2Json) }
        };

        var editableFields = new List<AttributeFieldConfig>
        {
            new() { FieldName = "status", DataType = AttributeDataType.String }
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeatures, features)
            .Add(p => p.EditableFieldsConfig, editableFields));

        // Assert - should show "active" since both features have the same value
        cut.Markup.Should().Contain("status");
        cut.Markup.Should().Contain("active");
    }

    [Fact]
    public void FeatureAttributesControl_MultiEdit_ShowsDifferentValuesPlaceholder()
    {
        // Arrange
        var feature1Json = """{"type": "Feature", "properties": {"name": "Feature One"}}""";
        var feature2Json = """{"type": "Feature", "properties": {"name": "Feature Two"}}""";
        
        var features = new List<SelectedFeature>
        {
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature1Json) },
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature2Json) }
        };

        var editableFields = new List<AttributeFieldConfig>
        {
            new() { FieldName = "name", DataType = AttributeDataType.String }
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeatures, features)
            .Add(p => p.EditableFieldsConfig, editableFields)
            .Add(p => p.IsLocked, false));

        // Assert - should show "(Different values)" placeholder or text
        cut.Markup.Should().Contain("(Different values)");
    }

    [Fact]
    public void FeatureAttributesControl_MultiEdit_AllowsEditing()
    {
        // Arrange
        var feature1Json = """{"type": "Feature", "properties": {"value": 10}}""";
        var feature2Json = """{"type": "Feature", "properties": {"value": 20}}""";
        
        var features = new List<SelectedFeature>
        {
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature1Json) },
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature2Json) }
        };

        var editableFields = new List<AttributeFieldConfig>
        {
            new() { FieldName = "value", DataType = AttributeDataType.Integer, IsReadOnly = false }
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeatures, features)
            .Add(p => p.EditableFieldsConfig, editableFields)
            .Add(p => p.IsLocked, false));

        // Assert - should show "(Different values)" text initially (not an input control)
        cut.Markup.Should().Contain("(Different values)", "should show different values text before clicking");
        cut.Markup.Should().NotContain("mud-input-slot", "should not show input control until field is clicked");
        
        // Click on the field to enter edit mode
        var clickableDiv = cut.Find("div[style*='cursor: pointer']");
        clickableDiv.Click();
        
        // Assert - should now render editable control after click
        cut.Markup.Should().Contain("mud-input-slot", "should render an input control after clicking the field");
    }

    [Fact]
    public void FeatureAttributesControl_MultiEdit_LockedState_PreventsEditing()
    {
        // Arrange
        var feature1Json = """{"type": "Feature", "properties": {"name": "F1"}}""";
        var feature2Json = """{"type": "Feature", "properties": {"name": "F2"}}""";
        
        var features = new List<SelectedFeature>
        {
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature1Json) },
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature2Json) }
        };

        var editableFields = new List<AttributeFieldConfig>
        {
            new() { FieldName = "name", DataType = AttributeDataType.String }
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeatures, features)
            .Add(p => p.EditableFieldsConfig, editableFields)
            .Add(p => p.IsLocked, true));

        // Assert - should show locked indicator and not show save button
        cut.Markup.Should().Contain("Locked");
        cut.Markup.Should().NotContain("Save Changes");
    }

    [Fact]
    public void FeatureAttributesControl_MultiEdit_HandlesAllNullValues()
    {
        // Arrange
        var feature1Json = """{"type": "Feature", "properties": {"optional": null}}""";
        var feature2Json = """{"type": "Feature", "properties": {"optional": null}}""";
        
        var features = new List<SelectedFeature>
        {
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature1Json) },
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature2Json) }
        };

        var editableFields = new List<AttributeFieldConfig>
        {
            new() { FieldName = "optional", DataType = AttributeDataType.String }
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeatures, features)
            .Add(p => p.EditableFieldsConfig, editableFields));

        // Assert - should display the field but with empty value (all null is treated as common value)
        cut.Markup.Should().Contain("optional");
    }

    [Fact]
    public void FeatureAttributesControl_MultiEdit_ShowsFieldsFromAllFeatures()
    {
        // Arrange - feature1 has "name", feature2 has "value", neither has both
        var feature1Json = """{"type": "Feature", "properties": {"name": "Feature 1"}}""";
        var feature2Json = """{"type": "Feature", "properties": {"value": 42}}""";
        
        var features = new List<SelectedFeature>
        {
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature1Json) },
            new() { LayerId = "layer1", Feature = JsonSerializer.Deserialize<JsonElement>(feature2Json) }
        };

        var editableFields = new List<AttributeFieldConfig>
        {
            new() { FieldName = "name", DataType = AttributeDataType.String },
            new() { FieldName = "value", DataType = AttributeDataType.Integer }
        };

        // Act
        var cut = RenderWithMud<FeatureAttributesControl>(parameters => parameters
            .Add(p => p.SelectedFeatures, features)
            .Add(p => p.EditableFieldsConfig, editableFields));

        // Assert - should display both fields even though each feature is missing one
        cut.Markup.Should().Contain("name", "should show 'name' field from feature1");
        cut.Markup.Should().Contain("value", "should show 'value' field from feature2");
    }
}


