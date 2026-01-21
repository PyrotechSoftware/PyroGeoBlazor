import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // Define Node.js globals for browser compatibility
    define: {
        'process.env': '{}',
        'process.env.NODE_ENV': '"production"',
        'global': 'globalThis',
    },

    build: {
        // Library mode for Blazor integration
        lib: {
            entry: resolve(__dirname, 'Scripts/index.ts'),
            name: 'DeckGL',
            formats: ['es'], // ESM only for modern browsers
            fileName: () => 'deckGL.js',
        },

        // Output to wwwroot for Blazor
        outDir: 'wwwroot',
        emptyOutDir: false, // Don't delete existing files

        rollupOptions: {
            // deck.gl is bundled since it's the core dependency
            // External dependencies can be configured here if needed
            external: [],

            output: {
                // Preserve global variable name
                globals: {},

                // Ensure consistent naming without content hashes
                assetFileNames: '[name].[ext]',
                chunkFileNames: '[name].js',  // Remove hash from chunk filenames
                entryFileNames: '[name].js',  // Remove hash from entry filenames
                
                // Disable code-splitting to prevent multiple chunk files
                inlineDynamicImports: true,
            },
        },

        // Minification using esbuild (faster and included by default)
        minify: 'esbuild',

        // Source maps for debugging
        sourcemap: true,

        // Increase chunk size warning limit for deck.gl
        chunkSizeWarningLimit: 2000,  // Increased since we're bundling everything together
    },

    // Resolve TypeScript paths
    resolve: {
        extensions: ['.ts', '.js'],
    },
});
