namespace PyroGeoBlazor.DeckGL.Tests.Unit.Models;

using FluentAssertions;
using PyroGeoBlazor.DeckGL.Models;

public class AttributeFieldConfigTests
{
    [Fact]
    public void AttributeFieldConfig_DefaultsToReadOnly()
    {
        // Arrange & Act
        var config = new AttributeFieldConfig { FieldName = "test" };

        // Assert
        config.IsReadOnly.Should().BeTrue("fields should be read-only by default for safety");
    }

    [Fact]
    public void AttributeFieldConfig_DefaultsToString()
    {
        // Arrange & Act
        var config = new AttributeFieldConfig { FieldName = "test" };

        // Assert
        config.DataType.Should().Be(AttributeDataType.String);
    }

    [Fact]
    public void AttributeFieldConfig_EffectiveDisplayName_UsesDisplayName_WhenSet()
    {
        // Arrange
        var config = new AttributeFieldConfig
        {
            FieldName = "field_name",
            DisplayName = "Field Name"
        };

        // Act & Assert
        config.EffectiveDisplayName.Should().Be("Field Name");
    }

    [Fact]
    public void AttributeFieldConfig_EffectiveDisplayName_UsesFieldName_WhenDisplayNameNotSet()
    {
        // Arrange
        var config = new AttributeFieldConfig
        {
            FieldName = "field_name"
        };

        // Act & Assert
        config.EffectiveDisplayName.Should().Be("field_name");
    }

    [Fact]
    public void AttributeFieldConfig_CanSetAllProperties()
    {
        // Arrange & Act
        var config = new AttributeFieldConfig
        {
            FieldName = "age",
            DisplayName = "Age",
            DataType = AttributeDataType.Integer,
            IsReadOnly = false,
            IsRequired = true,
            MaxLength = 3,
            Placeholder = "Enter age",
            HelpText = "Age in years",
            Order = 5
        };

        // Assert
        config.FieldName.Should().Be("age");
        config.DisplayName.Should().Be("Age");
        config.DataType.Should().Be(AttributeDataType.Integer);
        config.IsReadOnly.Should().BeFalse();
        config.IsRequired.Should().BeTrue();
        config.MaxLength.Should().Be(3);
        config.Placeholder.Should().Be("Enter age");
        config.HelpText.Should().Be("Age in years");
        config.Order.Should().Be(5);
    }

    [Fact]
    public void CodedValueDomain_CanAddCodedValues()
    {
        // Arrange
        var domain = new CodedValueDomain
        {
            Name = "Status",
            Description = "Status values"
        };

        // Act
        domain.CodedValues.Add(new CodedValue { Code = 1, Name = "Active" });
        domain.CodedValues.Add(new CodedValue { Code = 2, Name = "Inactive" });

        // Assert
        domain.CodedValues.Should().HaveCount(2);
        domain.CodedValues[0].Code.Should().Be(1);
        domain.CodedValues[0].Name.Should().Be("Active");
        domain.CodedValues[1].Code.Should().Be(2);
        domain.CodedValues[1].Name.Should().Be("Inactive");
    }

    [Fact]
    public void RangeDomain_CanSetMinMax()
    {
        // Arrange & Act
        var domain = new RangeDomain
        {
            Name = "Age Range",
            MinValue = 0,
            MaxValue = 120
        };

        // Assert
        domain.MinValue.Should().Be(0);
        domain.MaxValue.Should().Be(120);
    }

    [Theory]
    [InlineData(AttributeDataType.String)]
    [InlineData(AttributeDataType.Integer)]
    [InlineData(AttributeDataType.Double)]
    [InlineData(AttributeDataType.Boolean)]
    [InlineData(AttributeDataType.Date)]
    [InlineData(AttributeDataType.DateTime)]
    public void AttributeDataType_AllValuesAreValid(AttributeDataType dataType)
    {
        // Arrange & Act & Assert
        Enum.IsDefined(typeof(AttributeDataType), dataType).Should().BeTrue();
    }
}
