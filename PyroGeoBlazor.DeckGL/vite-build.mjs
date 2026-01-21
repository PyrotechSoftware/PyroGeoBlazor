import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdir, unlink, rename } from 'fs/promises';
import { join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function cleanOldBuildFiles() {
    const wwwrootDir = resolve(__dirname, 'wwwroot');
    
    try {
        const files = await readdir(wwwrootDir);
        
        // Delete old build artifacts (but keep other files)
        const filesToDelete = files.filter(file => 
            file.startsWith('deckGL') || 
            file.startsWith('layerFactory') || 
            file.startsWith('index')  // Clean all index files (chunks from previous builds)
        );
        
        for (const file of filesToDelete) {
            await unlink(join(wwwrootDir, file));
            console.log(`  Deleted old file: ${file}`);
        }
        
        if (filesToDelete.length > 0) {
            console.log(`Cleaned ${filesToDelete.length} old build files.\n`);
        }
    } catch (error) {
        // Ignore errors if directory doesn't exist or files can't be deleted
        console.log('Skipping cleanup (first build or files in use).\n');
    }
}

async function renameOutputFiles() {
    const wwwrootDir = resolve(__dirname, 'wwwroot');
    
    try {
        // Rename index.js to deckGL.js
        await rename(
            join(wwwrootDir, 'index.js'),
            join(wwwrootDir, 'deckGL.js')
        );
        console.log('  Renamed index.js -> deckGL.js');
        
        // Rename index.js.map to deckGL.js.map
        await rename(
            join(wwwrootDir, 'index.js.map'),
            join(wwwrootDir, 'deckGL.js.map')
        );
        console.log('  Renamed index.js.map -> deckGL.js.map');
    } catch (error) {
        console.error('Failed to rename output files:', error);
    }
}

async function buildLibrary() {
    try {
        console.log('Building deck.gl library for Blazor...');
        
        // Clean old build files first
        await cleanOldBuildFiles();
        
        await build({
            configFile: resolve(__dirname, 'vite.config.ts'),
            build: {
                emptyOutDir: false,
            }
        });
        
        // Rename output files to match expected names
        await renameOutputFiles();
        
        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

buildLibrary();
