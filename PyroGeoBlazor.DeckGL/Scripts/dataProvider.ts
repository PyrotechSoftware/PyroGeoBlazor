/**
 * Data provider utility for fetching data from API endpoints
 * Handles authentication headers, caching, and error handling
 */

export interface FetchOptions {
    headers?: Record<string, string>;
    method?: string;
    body?: string;
    cache?: boolean;
}

export interface DataProviderConfig {
    baseUrl?: string;
    defaultHeaders?: Record<string, string>;
}

export class DataProvider {
    private cache: Map<string, any> = new Map();
    private config: DataProviderConfig;

    constructor(config?: DataProviderConfig) {
        this.config = config || {};
    }

    /**
     * Fetch data from an endpoint
     */
    public async fetch(url: string, options?: FetchOptions): Promise<any> {
        const fullUrl = this.config.baseUrl ? `${this.config.baseUrl}${url}` : url;
        
        // Check cache if enabled
        if (options?.cache !== false && this.cache.has(fullUrl)) {
            console.log(`DataProvider: Using cached data for ${fullUrl}`);
            return this.cache.get(fullUrl);
        }

        console.log(`DataProvider: Fetching ${fullUrl}`);

        // Merge default headers with request-specific headers
        const headers = {
            ...this.config.defaultHeaders,
            ...options?.headers
        };

        try {
            const response = await window.fetch(fullUrl, {
                method: options?.method || 'GET',
                headers,
                body: options?.body
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Cache if enabled (default true)
            if (options?.cache !== false) {
                this.cache.set(fullUrl, data);
            }

            return data;
        } catch (error) {
            console.error(`DataProvider: Error fetching ${fullUrl}:`, error);
            throw error;
        }
    }

    /**
     * Fetch GeoJSON data
     */
    public async fetchGeoJson(url: string, options?: FetchOptions): Promise<any> {
        return this.fetch(url, options);
    }

    /**
     * Clear the cache
     */
    public clearCache(): void {
        this.cache.clear();
        console.log('DataProvider: Cache cleared');
    }

    /**
     * Remove a specific item from cache
     */
    public removeCacheItem(url: string): void {
        const fullUrl = this.config.baseUrl ? `${this.config.baseUrl}${url}` : url;
        this.cache.delete(fullUrl);
        console.log(`DataProvider: Removed cache item ${fullUrl}`);
    }

    /**
     * Update configuration
     */
    public updateConfig(config: Partial<DataProviderConfig>): void {
        this.config = { ...this.config, ...config };
    }
}

/**
 * Create a DataProvider instance
 */
export function createDataProvider(config?: DataProviderConfig): DataProvider {
    return new DataProvider(config);
}
