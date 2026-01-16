namespace PyroGeoBlazor.Leaflet.Models;

using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// A layer that fetches features from a WFS (Web Feature Service) endpoint and displays them as GeoJSON.
/// This is a convenience wrapper around GeoJsonLayer that handles WFS data fetching.
/// </summary>
public class WfsLayer : GeoJsonLayer
{
    protected string WfsUrl { get; }
    protected new WfsLayerOptions Options { get; }

    private readonly HttpClient _httpClient;
    private readonly HashSet<string> _loadedFeatureIds = new();
    private WfsBoundingBox? _lastLoadedBounds;
    private Map? _attachedMap;
    private System.Timers.Timer? _refreshTimer;

    /// <param name="wfsUrl">The base URL of the WFS service (e.g., "https://server.com/geoserver/ows")</param>
    /// <param name="options">WFS layer options including request parameters, styling, and auto-refresh settings</param>
    /// <param name="httpClient">Optional HttpClient instance. If not provided, a new one will be created.</param>
    public WfsLayer(
        string wfsUrl,
        WfsLayerOptions options,
        HttpClient? httpClient = null)
        : base(null, options) // Start with null data, will be loaded asynchronously
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(wfsUrl);
        ArgumentNullException.ThrowIfNull(options);

        WfsUrl = wfsUrl;
        Options = options;
        _httpClient = httpClient ?? new HttpClient();
    }

    /// <summary>
    /// Adds the layer to a map and automatically sets up refresh behavior if enabled.
    /// </summary>
    public override async Task<Layer> AddTo(Map map)
    {
        // Call base implementation to add the layer to the map
        await base.AddTo(map);

        // Store the map reference
        _attachedMap = map;

        // Wire up auto-refresh if enabled
        if (Options.AutoRefresh)
        {
            map.OnZoomEnd += OnMapViewChanged;
            map.OnMoveEnd += OnMapViewChanged;
            Console.WriteLine($"WfsLayer: Auto-refresh enabled (debounce: {Options.RefreshDebounceMs}ms)");
        }

        return this;
    }

    /// <summary>
    /// Removes the layer from the map and cleans up event handlers.
    /// </summary>
    public override async Task<Layer> RemoveLayer()
    {
        // Unsubscribe from map events
        if (_attachedMap is not null && Options.AutoRefresh)
        {
            _attachedMap.OnZoomEnd -= OnMapViewChanged;
            _attachedMap.OnMoveEnd -= OnMapViewChanged;
            Console.WriteLine("WfsLayer: Auto-refresh disabled (layer removed)");
        }

        // Clean up timer
        _refreshTimer?.Stop();
        _refreshTimer?.Dispose();
        _refreshTimer = null;

        _attachedMap = null;

        // Call base implementation
        return await base.RemoveLayer();
    }

    /// <summary>
    /// Event handler for map view changes (zoom/pan).
    /// </summary>
    private void OnMapViewChanged(object? sender, Leaflet.EventArgs.LeafletEventArgs e)
    {
        if (_attachedMap is null)
        {
            return;
        }

        // Debounce: wait for user to stop moving/zooming
        _refreshTimer?.Stop();
        _refreshTimer?.Dispose();

        _refreshTimer = new System.Timers.Timer(Options.RefreshDebounceMs);
        _refreshTimer.Elapsed += async (s, args) =>
        {
            _refreshTimer.Stop();
            await RefreshFeaturesForCurrentView();
        };
        _refreshTimer.AutoReset = false;
        _refreshTimer.Start();
    }

    /// <summary>
    /// Refreshes features for the current map view.
    /// </summary>
    private async Task RefreshFeaturesForCurrentView()
    {
        if (_attachedMap is null)
        {
            return;
        }

        try
        {
            var refreshType = Options.IncrementalRefresh ? "incremental" : "complete";
            Console.WriteLine($"WfsLayer: Auto-refreshing features for new map view ({refreshType})...");
            
            // Get current map bounds
            var bounds = await _attachedMap.GetBounds();
            
            if (bounds?.SouthWest is null || bounds?.NorthEast is null)
            {
                Console.WriteLine("WfsLayer: Cannot refresh - bounds not available");
                return;
            }

            // Normalize coordinates
            var westLng = Math.Min(bounds.SouthWest.Lng, bounds.NorthEast.Lng);
            var eastLng = Math.Max(bounds.SouthWest.Lng, bounds.NorthEast.Lng);
            var southLat = Math.Min(bounds.SouthWest.Lat, bounds.NorthEast.Lat);
            var northLat = Math.Max(bounds.SouthWest.Lat, bounds.NorthEast.Lat);

            // Update bounds
            UpdateBounds(new WfsBoundingBox
            {
                MinX = westLng,
                MinY = southLat,
                MaxX = eastLng,
                MaxY = northLat
            });

            // Load features based on refresh strategy
            if (Options.IncrementalRefresh)
            {
                // Incremental: only add new features
                await LoadFeaturesAsync(clearExisting: false);
                Console.WriteLine($"WfsLayer: Auto-refresh complete! Total features: {GetLoadedFeatureCount()}");
            }
            else
            {
                // Complete reload: clear cache and reload all
                ClearLoadedFeatureCache();
                await LoadFeaturesAsync(clearExisting: true);
                Console.WriteLine($"WfsLayer: Complete reload finished! Total features: {GetLoadedFeatureCount()}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"WfsLayer: Error during auto-refresh - {ex.Message}");
        }
    }

    /// <summary>
    /// Updates the bounding box for the WFS query without creating a new layer instance.
    /// This allows incremental loading to work properly by preserving the loaded feature cache.
    /// </summary>
    public void UpdateBounds(WfsBoundingBox newBounds)
    {
        Options.RequestParameters = new WfsRequestParameters
        {
            TypeName = Options.RequestParameters.TypeName,
            Version = Options.RequestParameters.Version,
            MaxFeatures = Options.RequestParameters.MaxFeatures,
            CqlFilter = Options.RequestParameters.CqlFilter,
            PropertyName = Options.RequestParameters.PropertyName,
            SrsName = Options.RequestParameters.SrsName,
            BBox = newBounds
        };
        Console.WriteLine($"WfsLayer: Updated bounds to: MinX={newBounds.MinX}, MinY={newBounds.MinY}, MaxX={newBounds.MaxX}, MaxY={newBounds.MaxY}");
    }

    /// <summary>
    /// Updates the MaxFeatures limit for the WFS query without creating a new layer instance.
    /// Subsequent requests will use the new limit.
    /// </summary>
    /// <param name="newMaxFeatures">The new maximum number of features to request</param>
    public void UpdateMaxFeatures(int newMaxFeatures)
    {
        Options.RequestParameters = new WfsRequestParameters
        {
            TypeName = Options.RequestParameters.TypeName,
            Version = Options.RequestParameters.Version,
            MaxFeatures = newMaxFeatures,
            CqlFilter = Options.RequestParameters.CqlFilter,
            PropertyName = Options.RequestParameters.PropertyName,
            SrsName = Options.RequestParameters.SrsName,
            BBox = Options.RequestParameters.BBox
        };
        Console.WriteLine($"WfsLayer: Updated MaxFeatures to: {newMaxFeatures}");
    }

    /// <summary>
    /// Loads features from the WFS endpoint.
    /// This should be called after adding the layer to the map.
    /// </summary>
    /// <param name="clearExisting">If true, removes all existing features before loading new ones. Default is false (incremental loading).</param>
    /// <param name="cancellationToken">Cancellation token</param>
    public async Task LoadFeaturesAsync(bool clearExisting = false, CancellationToken cancellationToken = default)
    {
        Console.WriteLine($"WfsLayer: Fetching data from WFS endpoint (clearExisting={clearExisting})...");
        var geoJsonData = await FetchWfsFeaturesAsync(cancellationToken);
        
        if (geoJsonData is not null)
        {
            Console.WriteLine("WfsLayer: Data fetched successfully, processing features...");
            
            if (clearExisting)
            {
                Console.WriteLine("WfsLayer: Clearing existing features...");
                _loadedFeatureIds.Clear();
                _lastLoadedBounds = null;
                // The layer will be recreated by the caller in this case
            }
            
            // Filter out already-loaded features for incremental loading
            var filteredData = FilterNewFeatures(geoJsonData);
            
            if (filteredData is not null)
            {
                var featureCount = GetFeatureCount(filteredData);
                Console.WriteLine($"WfsLayer: Adding {featureCount} new features to map...");
                Console.WriteLine("WfsLayer: This may take a moment for large datasets.");
                
                // Use a very large timeout (5 minutes) for adding large datasets
                // The JavaScript side processes each feature sequentially which can be slow
                await AddData(filteredData, timeoutMs: 300000);
                
                // Track the loaded bounds
                if (Options.RequestParameters.BBox is not null)
                {
                    _lastLoadedBounds = Options.RequestParameters.BBox;
                }
                
                Console.WriteLine($"WfsLayer: {featureCount} new features added successfully!");
            }
            else
            {
                Console.WriteLine("WfsLayer: No new features to add (all already loaded).");
            }
        }
        else
        {
            Console.WriteLine("WfsLayer: No data received from WFS endpoint.");
        }
    }

    /// <summary>
    /// Filters GeoJSON data to include only features that haven't been loaded yet.
    /// </summary>
    private object? FilterNewFeatures(object geoJsonData)
    {
        // Try to parse as JsonElement for feature inspection
        var jsonString = JsonSerializer.Serialize(geoJsonData);
        using var doc = JsonDocument.Parse(jsonString);
        var root = doc.RootElement;

        if (root.TryGetProperty("type", out var typeElement) && 
            typeElement.GetString() == "FeatureCollection" &&
            root.TryGetProperty("features", out var featuresElement) &&
            featuresElement.ValueKind == JsonValueKind.Array)
        {
            var newFeatures = new List<JsonElement>();
            var newFeatureIds = new List<string>();
            
            foreach (var feature in featuresElement.EnumerateArray())
            {
                var featureId = GetFeatureId(feature);
                if (featureId != null && !_loadedFeatureIds.Contains(featureId))
                {
                    newFeatures.Add(feature);
                    newFeatureIds.Add(featureId);
                }
            }

            // Track the new feature IDs
            foreach (var id in newFeatureIds)
            {
                _loadedFeatureIds.Add(id);
            }

            Console.WriteLine($"WfsLayer: Filtered {newFeatures.Count} new features out of {featuresElement.GetArrayLength()} total.");

            if (newFeatures.Count == 0)
            {
                return null; // No new features
            }

            // Reconstruct FeatureCollection with only new features
            var filteredJson = $$"""
                {
                    "type": "FeatureCollection",
                    "features": [{{string.Join(",", newFeatures.Select(f => f.GetRawText()))}}]
                }
                """;

            return JsonSerializer.Deserialize<object>(filteredJson);
        }

        // If not a FeatureCollection or can't parse, return as-is (will load all)
        Console.WriteLine("WfsLayer: Unable to filter features, loading all data.");
        return geoJsonData;
    }

    /// <summary>
    /// Extracts a feature ID from a GeoJSON feature for deduplication.
    /// </summary>
    private string? GetFeatureId(JsonElement feature)
    {
        // Try to get the 'id' property
        if (feature.TryGetProperty("id", out var idElement))
        {
            return idElement.ToString();
        }

        // Try to get a unique property from 'properties'
        if (feature.TryGetProperty("properties", out var propsElement))
        {
            // Common ID property names
            string[] idProps = ["id", "ID", "fid", "FID", "objectid", "OBJECTID", "featureid", "FEATUREID"];
            
            foreach (var propName in idProps)
            {
                if (propsElement.TryGetProperty(propName, out var propValue))
                {
                    return $"{propName}:{propValue}";
                }
            }
        }

        // Fallback: generate ID from geometry centroid (simple hash)
        if (feature.TryGetProperty("geometry", out var geomElement) &&
            geomElement.TryGetProperty("coordinates", out var coords))
        {
            var coordsString = coords.GetRawText();
            return $"geom:{coordsString.GetHashCode()}";
        }

        return null; // Unable to generate ID
    }

    /// <summary>
    /// Gets the number of features in the GeoJSON data.
    /// </summary>
    private int GetFeatureCount(object geoJsonData)
    {
        try
        {
            var jsonString = JsonSerializer.Serialize(geoJsonData);
            using var doc = JsonDocument.Parse(jsonString);
            var root = doc.RootElement;

            if (root.TryGetProperty("type", out var typeElement) && 
                typeElement.GetString() == "FeatureCollection" &&
                root.TryGetProperty("features", out var featuresElement) &&
                featuresElement.ValueKind == JsonValueKind.Array)
            {
                return featuresElement.GetArrayLength();
            }
        }
        catch
        {
            // Ignore parsing errors
        }

        return 0;
    }

    /// <summary>
    /// Clears the cache of loaded feature IDs and bounds.
    /// Call this before LoadFeaturesAsync(clearExisting: true) to fully reset the layer.
    /// </summary>
    public void ClearLoadedFeatureCache()
    {
        _loadedFeatureIds.Clear();
        _lastLoadedBounds = null;
        Console.WriteLine("WfsLayer: Cleared loaded feature cache.");
    }

    /// <summary>
    /// Gets the number of unique features that have been loaded.
    /// </summary>
    public int GetLoadedFeatureCount() => _loadedFeatureIds.Count;

    /// <summary>
    /// Fetches features from the WFS endpoint and returns them as a deserialized object.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Deserialized GeoJSON object</returns>
    private async Task<object?> FetchWfsFeaturesAsync(CancellationToken cancellationToken = default)
    {
        var url = BuildWfsUrl();
        
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var jsonString = await response.Content.ReadAsStringAsync(cancellationToken);
        return JsonSerializer.Deserialize<object>(jsonString);
    }

    /// <summary>
    /// Builds the complete WFS request URL with all parameters.
    /// </summary>
    private string BuildWfsUrl()
    {
        var sb = new StringBuilder(WfsUrl);
        
        // Add ? or & depending on whether the base URL has parameters
        sb.Append(WfsUrl.Contains('?') ? '&' : '?');

        // Required WFS parameters
        sb.Append("service=WFS");
        sb.Append($"&version={Options.RequestParameters.Version}");
        sb.Append("&request=GetFeature");
        sb.Append($"&typeName={Options.RequestParameters.TypeName}");
        sb.Append("&outputFormat=application/json");

        // Optional parameters
        if (Options.RequestParameters.MaxFeatures.HasValue)
        {
            sb.Append($"&maxFeatures={Options.RequestParameters.MaxFeatures.Value}");
        }

        if (!string.IsNullOrWhiteSpace(Options.RequestParameters.CqlFilter))
        {
            sb.Append($"&CQL_FILTER={Uri.EscapeDataString(Options.RequestParameters.CqlFilter)}");
        }

        if (!string.IsNullOrWhiteSpace(Options.RequestParameters.PropertyName))
        {
            sb.Append($"&propertyName={Uri.EscapeDataString(Options.RequestParameters.PropertyName)}");
        }

        if (!string.IsNullOrWhiteSpace(Options.RequestParameters.SrsName))
        {
            sb.Append($"&srsName={Uri.EscapeDataString(Options.RequestParameters.SrsName)}");
        }

        if (Options.RequestParameters.BBox is not null)
        {
            // Ensure correct order: minX should be less than maxX, minY less than maxY
            // WFS bbox format is: minX,minY,maxX,maxY (West,South,East,North)
            var minX = Math.Min(Options.RequestParameters.BBox.MinX, Options.RequestParameters.BBox.MaxX);
            var maxX = Math.Max(Options.RequestParameters.BBox.MinX, Options.RequestParameters.BBox.MaxX);
            var minY = Math.Min(Options.RequestParameters.BBox.MinY, Options.RequestParameters.BBox.MaxY);
            var maxY = Math.Max(Options.RequestParameters.BBox.MinY, Options.RequestParameters.BBox.MaxY);

            // Use invariant culture to ensure decimal points (not commas) in coordinates
            var bboxString = string.Format(
                System.Globalization.CultureInfo.InvariantCulture,
                "{0},{1},{2},{3}",
                minX, minY, maxX, maxY
            );
            
            sb.Append($"&bbox={bboxString}");
            if (!string.IsNullOrWhiteSpace(Options.RequestParameters.BBox.Srs))
            {
                sb.Append($",{Options.RequestParameters.BBox.Srs}");
            }
            
            Console.WriteLine($"WfsLayer: BBox normalized to: minX={minX}, minY={minY}, maxX={maxX}, maxY={maxY}");
            Console.WriteLine($"WfsLayer: BBox string: {bboxString}");
        }

        var url = sb.ToString();
        Console.WriteLine($"WfsLayer: Request URL: {url}");
        return url;
    }
}
