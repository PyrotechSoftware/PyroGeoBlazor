using Microsoft.AspNetCore.Mvc;

namespace PyroGeoBlazor.Demo.Controllers;

[ApiController]
public class ErrorTestController : ControllerBase
{
    [HttpGet("error-test")]
    public IActionResult Get()
    {
        throw new System.Exception("Test exception");
    }
}
