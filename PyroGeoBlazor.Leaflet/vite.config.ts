import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    // Library mode for Blazor integration
    lib: {
      entry: resolve(__dirname, 'Scripts/index.ts'),
      name: 'LeafletMap',
      formats: ['es'], // ESM only for modern browsers
      fileName: () => 'leafletMap.js',
    },
    
    // Output to wwwroot for Blazor
    outDir: 'wwwroot',
    emptyOutDir: false, // Don't delete existing Leaflet files
    
    rollupOptions: {
      // External dependencies (Leaflet loaded separately)
      external: ['leaflet', 'leaflet-vectortile-mapbox'],
      
      output: {
        // Preserve global variable name
        globals: {
          leaflet: 'L',
        },
        
        // Ensure consistent naming
        assetFileNames: '[name].[ext]',
      },
    },
    
    // Minification using esbuild (faster and included by default)
    minify: 'esbuild',
    
    // Source maps for debugging
    sourcemap: true,
  },
  
  // Resolve TypeScript paths
  resolve: {
    extensions: ['.ts', '.js'],
  },
});
