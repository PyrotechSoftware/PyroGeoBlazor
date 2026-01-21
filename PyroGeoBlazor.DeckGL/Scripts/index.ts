import { DeckGLView, createDeckGLView } from './deckGLView';
import { DataProvider, createDataProvider } from './dataProvider';

export const DeckGL = {
    DeckGLView: {
        createDeckGLView
    },
    DataProvider: {
        createDataProvider
    }
};

// For consumers that expect a default export or a global on window
export default DeckGL;

// Attach to window for direct script usage in non-module contexts
if (typeof window !== 'undefined') {
    (window as any).DeckGL = DeckGL;
}
