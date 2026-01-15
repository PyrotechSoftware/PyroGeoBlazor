import { describe, it, expect } from 'vitest';
import LeafletMap from '../index';

describe('LeafletMap Module', () => {
  it('should export all required components', () => {
    expect(LeafletMap).toBeDefined();
    expect(LeafletMap.Map).toBeDefined();
    expect(LeafletMap.Layer).toBeDefined();
    expect(LeafletMap.TileLayer).toBeDefined();
    expect(LeafletMap.Marker).toBeDefined();
    expect(LeafletMap.Popup).toBeDefined();
    expect(LeafletMap.Tooltip).toBeDefined();
  });

  it('should have Map component', () => {
    expect(LeafletMap.Map).toBeDefined();
  });

  it('should have Layer components', () => {
    expect(LeafletMap.TileLayer).toBeDefined();
    expect(LeafletMap.WmsTileLayer).toBeDefined();
    expect(LeafletMap.GridLayer).toBeDefined();
  });

  it('should have Feature components', () => {
    expect(LeafletMap.Marker).toBeDefined();
    expect(LeafletMap.Polyline).toBeDefined();
    expect(LeafletMap.Polygon).toBeDefined();
    expect(LeafletMap.Rectangle).toBeDefined();
    expect(LeafletMap.CircleMarker).toBeDefined();
  });

  it('should have Group components', () => {
    expect(LeafletMap.LayerGroup).toBeDefined();
    expect(LeafletMap.FeatureGroup).toBeDefined();
  });

  it('should have GeoJSON components', () => {
    expect(LeafletMap.GeoJsonLayer).toBeDefined();
    expect(LeafletMap.EditableGeoJsonLayer).toBeDefined();
  });

  it('should have utility functions', () => {
    expect(LeafletMap.getCrs).toBeDefined();
  });
});
