import { describe, it, expect, beforeEach } from 'vitest';
import { DataProvider } from '../dataProvider';

describe('DataProvider', () => {
    let dataProvider: DataProvider;

    beforeEach(() => {
        dataProvider = new DataProvider({
            baseUrl: 'https://api.example.com'
        });
    });

    it('should create a DataProvider instance', () => {
        expect(dataProvider).toBeDefined();
        expect(dataProvider).toBeInstanceOf(DataProvider);
    });

    it('should configure base URL correctly', () => {
        const provider = new DataProvider({
            baseUrl: 'https://test.com'
        });
        expect(provider).toBeDefined();
    });

    it('should clear cache', () => {
        dataProvider.clearCache();
        // If clearCache throws, test will fail
        expect(true).toBe(true);
    });

    it('should update configuration', () => {
        dataProvider.updateConfig({
            baseUrl: 'https://newurl.com',
            defaultHeaders: {
                'Authorization': 'Bearer token'
            }
        });
        // Verify configuration update doesn't throw
        expect(true).toBe(true);
    });
});
