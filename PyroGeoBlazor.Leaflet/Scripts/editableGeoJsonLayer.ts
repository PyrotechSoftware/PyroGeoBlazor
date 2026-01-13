declare const L: typeof import('leaflet');

import { EventHandlerMapping } from './eventHandling';
import { GeoJsonLayer } from './geoJsonLayer';

export const EditableGeoJsonLayer = {
    createEditableGeoJsonLayer(
        geoJsonData: any,
        options?: any,
        handlerMappings?: EventHandlerMapping
    ): any {
        // Create the base GeoJSON layer
        const geoJsonLayer = GeoJsonLayer.createGeoJsonLayer(geoJsonData, options, handlerMappings) as any;

        // Drawing state
        let isEditing = false;
        let currentDrawing: any = null;
        let drawingPoints: L.LatLng[] = [];
        let drawingType: 'polygon' | 'polyline' | null = null;
        let tempMarkers: L.CircleMarker[] = [];
        let tempPolyline: L.Polyline | null = null;
        let editableLayers: Map<any, any> = new Map();

        // Default styles
        const DEFAULT_DRAWING_STYLE = {
            color: '#ff7800',
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.3,
            dashArray: '5, 5'
        };

        const DEFAULT_EDITING_STYLE = {
            color: '#ff0000',
            weight: 3,
            opacity: 1.0,
            fillOpacity: 0.4
        };

        const drawingStyle = options?.drawingStyle || DEFAULT_DRAWING_STYLE;
        const editingStyle = options?.editingStyle || DEFAULT_EDITING_STYLE;
        const enableSnapping = options?.enableSnapping !== false;
        const snapDistance = options?.snapDistance || 15;
        const showDrawingGuides = options?.showDrawingGuides !== false;
        const allowDoubleClickFinish = options?.allowDoubleClickFinish !== false;
        const minPolygonPoints = options?.minPolygonPoints || 3;
        const minLinePoints = options?.minLinePoints || 2;

        // Get the map from the layer
        const getMap = (): L.Map | null => {
            return (geoJsonLayer as any)._map || null;
        };

        // Helper to create vertex markers
        const createVertexMarker = (latlng: L.LatLng): L.CircleMarker => {
            const map = getMap();
            if (!map) {
                throw new Error('Layer is not added to a map');
            }

            const marker = L.circleMarker(latlng, {
                radius: 6,
                fillColor: '#ff7800',
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            });
            marker.addTo(map);
            return marker;
        };

        // Helper to clear temporary drawing elements
        const clearDrawingElements = () => {
            tempMarkers.forEach(marker => {
                const map = getMap();
                if (map) {
                    map.removeLayer(marker);
                }
            });
            tempMarkers = [];

            if (tempPolyline) {
                const map = getMap();
                if (map) {
                    map.removeLayer(tempPolyline);
                }
                tempPolyline = null;
            }
        };

        // Helper to update drawing polyline
        const updateDrawingPolyline = () => {
            const map = getMap();
            if (!map) return;

            if (tempPolyline) {
                map.removeLayer(tempPolyline);
            }

            if (drawingPoints.length > 0) {
                tempPolyline = L.polyline(drawingPoints, drawingStyle);
                tempPolyline.addTo(map);
            }
        };

        // Helper to find nearby vertex for snapping
        const findSnapPoint = (latlng: L.LatLng, map: L.Map): L.LatLng | null => {
            if (!enableSnapping) return null;

            const point = map.latLngToContainerPoint(latlng);
            let closestPoint: L.LatLng | null = null;
            let closestDistance = snapDistance;

            // Check existing features
            geoJsonLayer.eachLayer((layer: any) => {
                if (layer.getLatLngs) {
                    const latlngs = layer.getLatLngs();
                    const flatLatLngs = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;

                    flatLatLngs.forEach((ll: L.LatLng) => {
                        const llPoint = map.latLngToContainerPoint(ll);
                        const distance = point.distanceTo(llPoint);
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestPoint = ll;
                        }
                    });
                }
            });

            // Check current drawing points
            drawingPoints.forEach(dp => {
                const dpPoint = map.latLngToContainerPoint(dp);
                const distance = point.distanceTo(dpPoint);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPoint = dp;
                }
            });

            return closestPoint;
        };

        // Start editing mode
        (geoJsonLayer as any).startEditing = function() {
            isEditing = true;
            const map = getMap();
            if (!map) {
                console.error('Cannot start editing: layer not added to map');
                return;
            }

            // Disable map double-click zoom when drawing
            map.doubleClickZoom.disable();
        };

        // Stop editing mode
        (geoJsonLayer as any).stopEditing = function() {
            isEditing = false;
            clearDrawingElements();
            drawingPoints = [];
            drawingType = null;
            
            const map = getMap();
            if (map) {
                map.doubleClickZoom.enable();
            }
        };

        // Start drawing a polygon
        (geoJsonLayer as any).addPolygon = function() {
            if (!isEditing) {
                console.error('Cannot start drawing: editing mode not enabled');
                return;
            }

            clearDrawingElements();
            drawingPoints = [];
            drawingType = 'polygon';

            const map = getMap();
            if (!map) return;

            // Add click handler to map
            const onMapClick = (e: L.LeafletMouseEvent) => {
                if (drawingType !== 'polygon') return;

                let latlng = e.latlng;
                const snapPoint = findSnapPoint(latlng, map);
                if (snapPoint) {
                    latlng = snapPoint;
                }

                drawingPoints.push(latlng);
                const marker = createVertexMarker(latlng);
                tempMarkers.push(marker);
                updateDrawingPolyline();

                // Show guide
                if (showDrawingGuides && drawingPoints.length === 1) {
                    console.log('Click to add points. Double-click or press Enter to finish.');
                }
            };

            const onMapDblClick = (e: L.LeafletMouseEvent) => {
                if (drawingType !== 'polygon') return;
                if (allowDoubleClickFinish && drawingPoints.length >= minPolygonPoints) {
                    e.originalEvent.preventDefault();
                    (geoJsonLayer as any).confirmDrawing();
                }
            };

            map.on('click', onMapClick);
            map.on('dblclick', onMapDblClick);

            // Store handlers for cleanup
            (geoJsonLayer as any)._drawingHandlers = { onMapClick, onMapDblClick };
        };

        // Start drawing a line
        (geoJsonLayer as any).addLine = function() {
            if (!isEditing) {
                console.error('Cannot start drawing: editing mode not enabled');
                return;
            }

            clearDrawingElements();
            drawingPoints = [];
            drawingType = 'polyline';

            const map = getMap();
            if (!map) return;

            const onMapClick = (e: L.LeafletMouseEvent) => {
                if (drawingType !== 'polyline') return;

                let latlng = e.latlng;
                const snapPoint = findSnapPoint(latlng, map);
                if (snapPoint) {
                    latlng = snapPoint;
                }

                drawingPoints.push(latlng);
                const marker = createVertexMarker(latlng);
                tempMarkers.push(marker);
                updateDrawingPolyline();

                if (showDrawingGuides && drawingPoints.length === 1) {
                    console.log('Click to add points. Double-click or press Enter to finish.');
                }
            };

            const onMapDblClick = (e: L.LeafletMouseEvent) => {
                if (drawingType !== 'polyline') return;
                if (allowDoubleClickFinish && drawingPoints.length >= minLinePoints) {
                    e.originalEvent.preventDefault();
                    (geoJsonLayer as any).confirmDrawing();
                }
            };

            map.on('click', onMapClick);
            map.on('dblclick', onMapDblClick);

            (geoJsonLayer as any)._drawingHandlers = { onMapClick, onMapDblClick };
        };

        // Confirm drawing and add to layer
        (geoJsonLayer as any).confirmDrawing = function() {
            if (!drawingType || drawingPoints.length === 0) {
                console.warn('No drawing to confirm');
                return;
            }

            const minPoints = drawingType === 'polygon' ? minPolygonPoints : minLinePoints;
            if (drawingPoints.length < minPoints) {
                console.warn(`Need at least ${minPoints} points to complete a ${drawingType}`);
                return;
            }

            // Create GeoJSON feature
            const coordinates = drawingPoints.map(p => [p.lng, p.lat]);
            if (drawingType === 'polygon') {
                coordinates.push(coordinates[0]); // Close the polygon
            }

            const feature: any = {
                type: 'Feature',
                geometry: {
                    type: drawingType === 'polygon' ? 'Polygon' : 'LineString',
                    coordinates: drawingType === 'polygon' ? [coordinates] : coordinates
                },
                properties: {
                    created: new Date().toISOString()
                }
            };

            // Add to layer
            geoJsonLayer.addData(feature);

            // Fire event
            if (handlerMappings?.dotNetRef && handlerMappings.events['featurecreated']) {
                handlerMappings.dotNetRef.invokeMethodAsync(
                    handlerMappings.events['featurecreated'],
                    { feature, layer: null }
                );
            }

            // Clean up
            const map = getMap();
            if (map && (geoJsonLayer as any)._drawingHandlers) {
                const handlers = (geoJsonLayer as any)._drawingHandlers;
                map.off('click', handlers.onMapClick);
                map.off('dblclick', handlers.onMapDblClick);
                delete (geoJsonLayer as any)._drawingHandlers;
            }

            clearDrawingElements();
            drawingPoints = [];
            drawingType = null;
        };

        // Cancel drawing
        (geoJsonLayer as any).cancelDrawing = function() {
            const map = getMap();
            if (map && (geoJsonLayer as any)._drawingHandlers) {
                const handlers = (geoJsonLayer as any)._drawingHandlers;
                map.off('click', handlers.onMapClick);
                map.off('dblclick', handlers.onMapDblClick);
                delete (geoJsonLayer as any)._drawingHandlers;
            }

            clearDrawingElements();
            drawingPoints = [];
            drawingType = null;

            // Fire event
            if (handlerMappings?.dotNetRef && handlerMappings.events['drawingcancelled']) {
                handlerMappings.dotNetRef.invokeMethodAsync(
                    handlerMappings.events['drawingcancelled']
                );
            }
        };

        // Edit selected features - enable vertex editing
        (geoJsonLayer as any).editSelectedFeatures = function() {
            const selectedFeatures = (geoJsonLayer as any).SelectedFeatures || [];
            
            if (selectedFeatures.length === 0) {
                console.warn('No features selected for editing');
                return;
            }

            const map = getMap();
            if (!map) {
                console.error('Cannot edit features: layer not added to map');
                return;
            }

            // Enable editing on selected features
            selectedFeatures.forEach((feature: any) => {
                geoJsonLayer.eachLayer((layer: any) => {
                    if (layer.feature === feature && (layer instanceof L.Polygon || layer instanceof L.Polyline)) {
                        // Enable Leaflet's built-in editing
                        if (!layer.editing) {
                            // If editing is not available, set up manual vertex editing
                            enableVertexEditing(layer, feature);
                        } else {
                            layer.editing.enable();
                        }
                        
                        // Store in editable layers map
                        editableLayers.set(feature, layer);
                    }
                });
            });
        };

        // Disable editing on features
        (geoJsonLayer as any).disableEditingFeatures = function() {
            editableLayers.forEach((layer: any, feature: any) => {
                if (layer.editing && layer.editing.enabled()) {
                    layer.editing.disable();
                } else {
                    disableVertexEditing(layer);
                }
            });
            editableLayers.clear();
        };

        // Manual vertex editing implementation
        const enableVertexEditing = (layer: any, feature: any) => {
            if ((layer as any)._editingEnabled) return;

            const map = getMap();
            if (!map) return;

            const originalLatLngs = layer.getLatLngs();
            const isPolygon = layer instanceof L.Polygon;
            const coords = isPolygon ? originalLatLngs[0] : originalLatLngs;
            
            // Minimum vertices constraint
            const minVertices = isPolygon ? 3 : 2;
            
            // Create vertex markers
            const vertexMarkers: L.CircleMarker[] = [];
            
            const updateAllMarkers = () => {
                // Remove all existing markers
                vertexMarkers.forEach(marker => {
                    const map = getMap();
                    if (map) {
                        map.removeLayer(marker);
                    }
                });
                vertexMarkers.length = 0;
                
                // Recreate markers for current vertices
                coords.forEach((latlng: L.LatLng, index: number) => {
                    const marker = createEditableVertexMarker(latlng, index);
                    vertexMarkers.push(marker);
                });
            };
            
            const createEditableVertexMarker = (latlng: L.LatLng, index: number) => {
                const marker = L.circleMarker(latlng, {
                    radius: 8,
                    fillColor: '#ffffff',
                    color: '#ff0000',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 1,
                    draggable: true
                } as any);
                
                marker.addTo(map);
                
                // Right-click or Ctrl+Click to delete vertex
                marker.on('click', (e: any) => {
                    const originalEvent = e.originalEvent;
                    
                    // Check if it's Ctrl+Click or right-click (context menu)
                    if (originalEvent.ctrlKey || originalEvent.button === 2) {
                        L.DomEvent.stopPropagation(e);
                        L.DomEvent.preventDefault(e);
                        
                        // Check minimum vertices
                        if (coords.length <= minVertices) {
                            console.warn(`Cannot delete vertex: ${isPolygon ? 'Polygon' : 'Polyline'} must have at least ${minVertices} vertices`);
                            return;
                        }
                        
                        // Remove the vertex
                        coords.splice(index, 1);
                        
                        // Update the layer geometry
                        if (isPolygon) {
                            layer.setLatLngs([coords]);
                        } else {
                            layer.setLatLngs(coords);
                        }
                        
                        // Recreate all markers with updated indices
                        updateAllMarkers();
                        
                        // Fire modified event
                        if (handlerMappings?.dotNetRef && handlerMappings.events['featuremodified']) {
                            const newCoords = coords.map((ll: L.LatLng) => [ll.lng, ll.lat]);
                            if (isPolygon) {
                                newCoords.push(newCoords[0]);
                                feature.geometry.coordinates = [newCoords];
                            } else {
                                feature.geometry.coordinates = newCoords;
                            }
                            
                            handlerMappings.dotNetRef.invokeMethodAsync(
                                handlerMappings.events['featuremodified'],
                                { feature, layer: null }
                            );
                        }
                        
                        return;
                    }
                });
                
                // Context menu event (right-click)
                marker.on('contextmenu', (e: any) => {
                    L.DomEvent.stopPropagation(e);
                    L.DomEvent.preventDefault(e);
                    
                    // Check minimum vertices
                    if (coords.length <= minVertices) {
                        console.warn(`Cannot delete vertex: ${isPolygon ? 'Polygon' : 'Polyline'} must have at least ${minVertices} vertices`);
                        return;
                    }
                    
                    // Remove the vertex
                    coords.splice(index, 1);
                    
                    // Update the layer geometry
                    if (isPolygon) {
                        layer.setLatLngs([coords]);
                    } else {
                        layer.setLatLngs(coords);
                    }
                    
                    // Recreate all markers with updated indices
                    updateAllMarkers();
                    
                    // Fire modified event
                    if (handlerMappings?.dotNetRef && handlerMappings.events['featuremodified']) {
                        const newCoords = coords.map((ll: L.LatLng) => [ll.lng, ll.lat]);
                        if (isPolygon) {
                            newCoords.push(newCoords[0]);
                            feature.geometry.coordinates = [newCoords];
                        } else {
                            feature.geometry.coordinates = newCoords;
                        }
                        
                        handlerMappings.dotNetRef.invokeMethodAsync(
                            handlerMappings.events['featuremodified'],
                            { feature, layer: null }
                        );
                    }
                });
                
                // Make marker draggable
                marker.on('mousedown', (e: any) => {
                    L.DomEvent.stopPropagation(e);
                    
                    // Disable map dragging while editing vertex
                    if (map.dragging) {
                        map.dragging.disable();
                    }
                    
                    const onMouseMove = (e: L.LeafletMouseEvent) => {
                        const newLatLng = e.latlng;
                        marker.setLatLng(newLatLng);
                        coords[index] = newLatLng;
                        
                        if (isPolygon) {
                            layer.setLatLngs([coords]);
                        } else {
                            layer.setLatLngs(coords);
                        }
                    };
                    
                    const onMouseUp = () => {
                        map.off('mousemove', onMouseMove);
                        map.off('mouseup', onMouseUp);
                        
                        // Re-enable map dragging after vertex edit
                        if (map.dragging) {
                            map.dragging.enable();
                        }
                        
                        // Fire modified event
                        if (handlerMappings?.dotNetRef && handlerMappings.events['featuremodified']) {
                            // Update feature geometry
                            const newCoords = coords.map((ll: L.LatLng) => [ll.lng, ll.lat]);
                            if (isPolygon) {
                                newCoords.push(newCoords[0]); // Close polygon
                                feature.geometry.coordinates = [newCoords];
                            } else {
                                feature.geometry.coordinates = newCoords;
                            }
                            
                            handlerMappings.dotNetRef.invokeMethodAsync(
                                handlerMappings.events['featuremodified'],
                                { feature, layer: null }
                            );
                        }
                    };
                    
                    map.on('mousemove', onMouseMove);
                    map.on('mouseup', onMouseUp);
                });
                
                return marker;
            };
            
            // Initial marker creation
            coords.forEach((latlng: L.LatLng, index: number) => {
                const marker = createEditableVertexMarker(latlng, index);
                vertexMarkers.push(marker);
            });
            
            // Store markers on layer for cleanup
            (layer as any)._vertexMarkers = vertexMarkers;
            (layer as any)._editingEnabled = true;
            
            // Apply editing style
            layer.setStyle(editingStyle);
        };

        // Disable vertex editing
        const disableVertexEditing = (layer: any) => {
            if (!(layer as any)._editingEnabled) return;
            
            const map = getMap();
            if (map && (layer as any)._vertexMarkers) {
                (layer as any)._vertexMarkers.forEach((marker: L.CircleMarker) => {
                    map.removeLayer(marker);
                });
            }
            
            delete (layer as any)._vertexMarkers;
            delete (layer as any)._editingEnabled;
            
            // Restore original style
            if ((layer as any).feature) {
                // Restore to selected style if still selected
                const selectedFeatures = (geoJsonLayer as any).SelectedFeatures || [];
                if (selectedFeatures.includes((layer as any).feature) && options?.selectedFeatureStyle) {
                    layer.setStyle(options.selectedFeatureStyle);
                } else {
                    // Restore to default style
                    const style = options?.style || {};
                    layer.setStyle(style);
                }
            }
        };
        
        return geoJsonLayer;
    }
};
