namespace PyroGeoBlazor.DeckGL.Tests.Unit.Models;

using FluentAssertions;

using PyroGeoBlazor.DeckGL.Models;

using System.Text.Json;

public class MultiFeatureEditContextTests
{
    [Fact]
    public void MultiFeatureEditContext_InitializesWithEmptyState()
    {
        // Arrange & Act
        var context = new MultiFeatureEditContext();

        // Assert
        context.Features.Should().BeEmpty();
        context.FieldStates.Should().BeEmpty();
        context.CurrentValues.Should().BeEmpty();
        context.ValidationErrors.Should().BeEmpty();
        context.IsDirty.Should().BeFalse();
        context.IsValid.Should().BeTrue();
    }

    [Fact]
    public void MultiFeatureEditContext_SetCurrentValue_MarksAsDirty()
    {
        // Arrange
        var context = new MultiFeatureEditContext();

        // Act
        context.SetCurrentValue("testField", "newValue");

        // Assert
        context.IsDirty.Should().BeTrue();
        context.ModifiedFields.Should().Contain("testField");
        context.GetCurrentValue("testField").Should().Be("newValue");
    }

    [Fact]
    public void MultiFeatureEditContext_SetValidationError_MarksAsInvalid()
    {
        // Arrange
        var context = new MultiFeatureEditContext();

        // Act
        context.SetValidationError("testField", "Field is required");

        // Assert
        context.IsValid.Should().BeFalse();
        context.ValidationErrors.Should().ContainKey("testField");
        context.ValidationErrors["testField"].Should().Be("Field is required");
    }

    [Fact]
    public void MultiFeatureEditContext_ClearValidationError_RemovesError()
    {
        // Arrange
        var context = new MultiFeatureEditContext();
        context.SetValidationError("testField", "Error message");

        // Act
        context.ClearValidationError("testField");

        // Assert
        context.IsValid.Should().BeTrue();
        context.ValidationErrors.Should().NotContainKey("testField");
    }

    [Fact]
    public void MultiFeatureEditContext_ResetAll_ClearsModifications()
    {
        // Arrange
        var context = new MultiFeatureEditContext();
        context.SetCurrentValue("field1", "value1");
        context.SetCurrentValue("field2", "value2");
        context.SetValidationError("field1", "Error");

        // Act
        context.ResetAll();

        // Assert
        context.IsDirty.Should().BeFalse();
        context.IsValid.Should().BeTrue();
        context.CurrentValues.Should().BeEmpty();
        context.ValidationErrors.Should().BeEmpty();
    }

    [Fact]
    public void MultiFeatureEditContext_GetDisplayValue_ShowsDifferentValuesText()
    {
        // Arrange
        var context = new MultiFeatureEditContext();
        context.FieldStates["testField"] = new FieldValueState
        {
            HasDifferentValues = true,
            CommonValue = null
        };

        // Act
        var displayValue = context.GetDisplayValue("testField");

        // Assert
        displayValue.Should().Be("(Different values)");
    }

    [Fact]
    public void MultiFeatureEditContext_GetDisplayValue_ShowsCommonValue()
    {
        // Arrange
        var context = new MultiFeatureEditContext();
        context.FieldStates["testField"] = new FieldValueState
        {
            HasDifferentValues = false,
            CommonValue = "SharedValue"
        };

        // Act
        var displayValue = context.GetDisplayValue("testField");

        // Assert
        displayValue.Should().Be("SharedValue");
    }

    [Fact]
    public void MultiFeatureEditContext_GetDisplayValue_ShowsModifiedValue()
    {
        // Arrange
        var context = new MultiFeatureEditContext();
        context.FieldStates["testField"] = new FieldValueState
        {
            HasDifferentValues = true,
            CommonValue = null
        };
        context.SetCurrentValue("testField", "ModifiedValue");

        // Act
        var displayValue = context.GetDisplayValue("testField");

        // Assert
        displayValue.Should().Be("ModifiedValue", "modified value should take precedence");
    }

    [Fact]
    public void FieldValueState_CorrectlyIdentifiesAllNull()
    {
        // Arrange & Act
        var state = new FieldValueState
        {
            AllNull = true,
            HasDifferentValues = false,
            CommonValue = null
        };

        // Assert
        state.AllNull.Should().BeTrue();
        state.HasDifferentValues.Should().BeFalse();
    }

    [Fact]
    public void FieldValueState_CorrectlyIdentifiesCommonValue()
    {
        // Arrange & Act
        var state = new FieldValueState
        {
            AllNull = false,
            HasDifferentValues = false,
            CommonValue = 42
        };

        // Assert
        state.AllNull.Should().BeFalse();
        state.HasDifferentValues.Should().BeFalse();
        state.CommonValue.Should().Be(42);
    }

    [Fact]
    public void FieldValueState_CorrectlyIdentifiesDifferentValues()
    {
        // Arrange & Act
        var state = new FieldValueState
        {
            AllNull = false,
            HasDifferentValues = true,
            CommonValue = null
        };

        // Assert
        state.AllNull.Should().BeFalse();
        state.HasDifferentValues.Should().BeTrue();
        state.CommonValue.Should().BeNull();
    }
}
