using System.Net;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace PyroGeoBlazor.IntegrationTests;

public class ExceptionHandlingTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ExceptionHandlingTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ErrorEndpoint_Returns_500_And_ErrorMessage()
    {
        var client = _factory.CreateClient();

        // Trigger an endpoint that throws
        var response = await client.GetAsync("/error-test");

        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("An error occurred.");
    }
}
