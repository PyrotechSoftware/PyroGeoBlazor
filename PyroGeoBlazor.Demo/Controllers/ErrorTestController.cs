namespace PyroGeoBlazor.Demo.Controllers;

using Microsoft.AspNetCore.Mvc;

[ApiController]
public class ErrorTestController : ControllerBase
{
    [HttpGet("error-test")]
    public IActionResult Get()
    {
        throw new System.Exception("Test exception");
    }
}
