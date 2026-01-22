namespace PyroGeoBlazor.DeckGL.Tests.Unit.Models;

using FluentAssertions;

using PyroGeoBlazor.DeckGL.Models;

public class AttributeEditContextTests
{
    [Fact]
    public void AttributeEditContext_IsNotDirty_WhenNoChanges()
    {
        // Arrange
        var context = new AttributeEditContext();
        context.OriginalValues["name"] = "John";
        context.CurrentValues["name"] = "John";

        // Act & Assert
        context.IsDirty.Should().BeFalse();
    }

    [Fact]
    public void AttributeEditContext_IsDirty_WhenValueChanged()
    {
        // Arrange
        var context = new AttributeEditContext();
        context.OriginalValues["name"] = "John";
        context.CurrentValues["name"] = "Jane";

        // Act & Assert
        context.IsDirty.Should().BeTrue();
    }

    [Fact]
    public void AttributeEditContext_IsValid_WhenNoErrors()
    {
        // Arrange
        var context = new AttributeEditContext();

        // Act & Assert
        context.IsValid.Should().BeTrue();
    }

    [Fact]
    public void AttributeEditContext_IsNotValid_WhenHasErrors()
    {
        // Arrange
        var context = new AttributeEditContext();
        context.SetValidationError("name", "Name is required");

        // Act & Assert
        context.IsValid.Should().BeFalse();
    }

    [Fact]
    public void AttributeEditContext_ModifiedFields_ReturnsOnlyChangedFields()
    {
        // Arrange
        var context = new AttributeEditContext();
        context.OriginalValues["name"] = "John";
        context.OriginalValues["age"] = 30;
        context.OriginalValues["city"] = "NYC";
        
        context.CurrentValues["name"] = "Jane";  // Changed
        context.CurrentValues["age"] = 30;       // Unchanged
        context.CurrentValues["city"] = "LA";    // Changed

        // Act
        var modifiedFields = context.ModifiedFields.ToList();

        // Assert
        modifiedFields.Should().HaveCount(2);
        modifiedFields.Should().Contain("name");
        modifiedFields.Should().Contain("city");
        modifiedFields.Should().NotContain("age");
    }

    [Fact]
    public void AttributeEditContext_ResetField_RestoresOriginalValue()
    {
        // Arrange
        var context = new AttributeEditContext();
        context.OriginalValues["name"] = "John";
        context.CurrentValues["name"] = "Jane";
        context.SetValidationError("name", "Some error");

        // Act
        context.ResetField("name");

        // Assert
        context.CurrentValues["name"].Should().Be("John");
        context.ValidationErrors.Should().NotContainKey("name");
    }

    [Fact]
    public void AttributeEditContext_ResetAll_RestoresAllOriginalValues()
    {
        // Arrange
        var context = new AttributeEditContext();
        context.OriginalValues["name"] = "John";
        context.OriginalValues["age"] = 30;
        
        context.CurrentValues["name"] = "Jane";
        context.CurrentValues["age"] = 35;
        
        context.SetValidationError("name", "Error 1");
        context.SetValidationError("age", "Error 2");

        // Act
        context.ResetAll();

        // Assert
        context.CurrentValues["name"].Should().Be("John");
        context.CurrentValues["age"].Should().Be(30);
        context.ValidationErrors.Should().BeEmpty();
        context.IsDirty.Should().BeFalse();
    }

    [Fact]
    public void AttributeEditContext_GetCurrentValue_ReturnsCorrectValue()
    {
        // Arrange
        var context = new AttributeEditContext();
        context.CurrentValues["name"] = "John";

        // Act
        var value = context.GetCurrentValue("name");

        // Assert
        value.Should().Be("John");
    }

    [Fact]
    public void AttributeEditContext_GetCurrentValue_ReturnsNull_WhenNotFound()
    {
        // Arrange
        var context = new AttributeEditContext();

        // Act
        var value = context.GetCurrentValue("nonexistent");

        // Assert
        value.Should().BeNull();
    }

    [Fact]
    public void AttributeEditContext_SetCurrentValue_UpdatesValue()
    {
        // Arrange
        var context = new AttributeEditContext();

        // Act
        context.SetCurrentValue("name", "John");

        // Assert
        context.CurrentValues["name"].Should().Be("John");
    }

    [Fact]
    public void AttributeEditContext_SetValidationError_AddsError()
    {
        // Arrange
        var context = new AttributeEditContext();

        // Act
        context.SetValidationError("name", "Name is required");

        // Assert
        context.ValidationErrors.Should().ContainKey("name");
        context.ValidationErrors["name"].Should().Be("Name is required");
        context.IsValid.Should().BeFalse();
    }

    [Fact]
    public void AttributeEditContext_ClearValidationError_RemovesError()
    {
        // Arrange
        var context = new AttributeEditContext();
        context.SetValidationError("name", "Name is required");

        // Act
        context.ClearValidationError("name");

        // Assert
        context.ValidationErrors.Should().NotContainKey("name");
        context.IsValid.Should().BeTrue();
    }

    [Fact]
    public void AttributeEditContext_IsDirty_HandlesNullValues()
    {
        // Arrange
        var context = new AttributeEditContext();
        context.OriginalValues["name"] = null;
        context.CurrentValues["name"] = null;

        // Act & Assert
        context.IsDirty.Should().BeFalse();
    }

    [Fact]
    public void AttributeEditContext_IsDirty_DetectsNullToValueChange()
    {
        // Arrange
        var context = new AttributeEditContext();
        context.OriginalValues["name"] = null;
        context.CurrentValues["name"] = "John";

        // Act & Assert
        context.IsDirty.Should().BeTrue();
    }

    [Fact]
    public void AttributeEditContext_IsDirty_DetectsValueToNullChange()
    {
        // Arrange
        var context = new AttributeEditContext();
        context.OriginalValues["name"] = "John";
        context.CurrentValues["name"] = null;

        // Act & Assert
        context.IsDirty.Should().BeTrue();
    }
}
