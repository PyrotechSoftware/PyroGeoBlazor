import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom', // Simulates browser DOM
    
    // Global test utilities
    globals: true,
    
    // Setup files
    setupFiles: ['Scripts/__tests__/setup.ts'],
    
    // Test file patterns
    include: ['Scripts/**/*.{test,spec}.{ts,tsx}'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'Scripts/**/*.{test,spec}.{ts,tsx}',
        '**/*.d.ts',
      ],
    },
    
    // Mock configuration
    mockReset: true,
    restoreMocks: true,
  },
});
