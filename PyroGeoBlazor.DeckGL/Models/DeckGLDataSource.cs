namespace PyroGeoBlazor.DeckGL.Models;

using System.Text.Json.Serialization;

/// <summary>
/// Configuration for a data source that fetches data from an API endpoint.
/// JavaScript handles the actual fetching to avoid passing large payloads over interop.
/// </summary>
public class DeckGLDataSource
{
    /// <summary>
    /// API endpoint URL
    /// </summary>
    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// HTTP method (GET, POST, etc.)
    /// </summary>
    [JsonPropertyName("method")]
    public string Method { get; set; } = "GET";

    /// <summary>
    /// Request headers (e.g., for authentication)
    /// </summary>
    [JsonPropertyName("headers")]
    public Dictionary<string, string>? Headers { get; set; }

    /// <summary>
    /// Request body (for POST/PUT requests)
    /// </summary>
    [JsonPropertyName("body")]
    public string? Body { get; set; }

    /// <summary>
    /// Whether to cache the response
    /// </summary>
    [JsonPropertyName("cache")]
    public bool Cache { get; set; } = true;

    /// <summary>
    /// Cache key (defaults to URL if not specified)
    /// </summary>
    [JsonPropertyName("cacheKey")]
    public string? CacheKey { get; set; }

    /// <summary>
    /// Transform function name to apply to response data
    /// </summary>
    [JsonPropertyName("transform")]
    public string? Transform { get; set; }
}

/// <summary>
/// Configuration for the global data provider
/// </summary>
public class DataProviderConfig
{
    /// <summary>
    /// Base URL for all API requests
    /// </summary>
    [JsonPropertyName("baseUrl")]
    public string? BaseUrl { get; set; }

    /// <summary>
    /// Default headers to include in all requests (e.g., Authorization)
    /// </summary>
    [JsonPropertyName("defaultHeaders")]
    public Dictionary<string, string>? DefaultHeaders { get; set; }

    /// <summary>
    /// Request timeout in milliseconds
    /// </summary>
    [JsonPropertyName("timeout")]
    public int? Timeout { get; set; }
}
