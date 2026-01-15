import { afterEach, vi } from 'vitest';

// Mock Leaflet global with more complete structure
const mockControl = class {
  constructor() {}
  addTo() { return this; }
  remove() { return this; }
  getPosition() { return 'topleft'; }
  setPosition() { return this; }
};

global.L = {
  map: vi.fn(),
  tileLayer: vi.fn(),
  marker: vi.fn(),
  popup: vi.fn(),
  tooltip: vi.fn(),
  layerGroup: vi.fn(),
  featureGroup: vi.fn(),
  geoJSON: vi.fn(),
  polyline: vi.fn(),
  polygon: vi.fn(),
  rectangle: vi.fn(),
  circleMarker: vi.fn(),
  gridLayer: vi.fn(),
  Control: mockControl,
  CRS: {
    EPSG3857: {},
    EPSG4326: {},
    Simple: {},
  },
  // Add other Leaflet mocks as needed
} as any;

// Cleanup after each test
afterEach(() => {
  // Reset DOM
  document.body.innerHTML = '';
  // Clear all mocks
  vi.clearAllMocks();
});
