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
        
        // Store original geometries for cancel operation
        let originalGeometries: Map<any, any> = new Map(); // Map of feature -> original coordinates

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

            // Clear previous edit session state
            originalGeometries.clear();

            // Enable editing on selected features
            selectedFeatures.forEach((feature: any) => {
                geoJsonLayer.eachLayer((layer: any) => {
                    if (layer.feature === feature && (layer instanceof L.Polygon || layer instanceof L.Polyline)) {
                        // Store original geometry before editing
                        const isPolygon = layer instanceof L.Polygon;
                        const currentLatLngs = layer.getLatLngs();
                        const coords = isPolygon ? currentLatLngs[0] : currentLatLngs;
                        
                        // Deep copy the coordinates
                        const originalCoords = coords.map((latlng: L.LatLng) => ({ lat: latlng.lat, lng: latlng.lng }));
                        originalGeometries.set(feature, { coords: originalCoords, isPolygon });
                        
                        console.log(`Stored original geometry for feature, ${originalCoords.length} vertices`);
                        
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

        // Confirm editing - commit changes
        (geoJsonLayer as any).confirmEditing = function() {
            console.log('Confirming editing changes');
            
            // Disable editing UI
            editableLayers.forEach((layer: any, feature: any) => {
                if (layer.editing && layer.editing.enabled()) {
                    layer.editing.disable();
                } else {
                    disableVertexEditing(layer);
                }
                
                // Update feature geometry with new coordinates
                const isPolygon = layer instanceof L.Polygon;
                const currentLatLngs = layer.getLatLngs();
                const coords = isPolygon ? currentLatLngs[0] : currentLatLngs;
                
                const newCoords = coords.map((ll: L.LatLng) => [ll.lng, ll.lat]);
                if (isPolygon) {
                    newCoords.push(newCoords[0]); // Close polygon
                    feature.geometry.coordinates = [newCoords];
                } else {
                    feature.geometry.coordinates = newCoords;
                }
                
                console.log(`Committed ${newCoords.length} vertices to feature geometry`);
                
                // Fire modified event
                if (handlerMappings?.dotNetRef && handlerMappings.events['featuremodified']) {
                    handlerMappings.dotNetRef.invokeMethodAsync(
                        handlerMappings.events['featuremodified'],
                        { feature, layer: null }
                    );
                }
            });
            
            editableLayers.clear();
            originalGeometries.clear();
        };

        // Cancel editing - restore original geometry
        (geoJsonLayer as any).cancelEditing = function() {
            console.log('Cancelling editing changes');
            
            editableLayers.forEach((layer: any, feature: any) => {
                // Disable editing UI first
                if (layer.editing && layer.editing.enabled()) {
                    layer.editing.disable();
                } else {
                    disableVertexEditing(layer);
                }
                
                // Restore original geometry
                const originalGeometry = originalGeometries.get(feature);
                if (originalGeometry) {
                    const { coords, isPolygon } = originalGeometry;
                    const restoredLatLngs = coords.map((c: any) => L.latLng(c.lat, c.lng));
                    
                    if (isPolygon) {
                        layer.setLatLngs([restoredLatLngs]);
                    } else {
                        layer.setLatLngs(restoredLatLngs);
                    }
                    
                    // Also restore in feature.geometry
                    const originalCoords = coords.map((c: any) => [c.lng, c.lat]);
                    if (isPolygon) {
                        originalCoords.push(originalCoords[0]); // Close polygon
                        feature.geometry.coordinates = [originalCoords];
                    } else {
                        feature.geometry.coordinates = originalCoords;
                    }
                    
                    console.log(`Restored ${coords.length} vertices to original geometry`);
                } else {
                    console.warn('No original geometry found for feature');
                }
            });
            
            editableLayers.clear();
            originalGeometries.clear();
        };

        // Delete selected features
        (geoJsonLayer as any).deleteSelectedFeatures = function() {
            const selectedFeatures = (geoJsonLayer as any).SelectedFeatures || [];
            
            if (selectedFeatures.length === 0) {
                console.warn('No features selected for deletion');
                return;
            }

            const map = getMap();
            if (!map) {
                console.error('Cannot delete features: layer not added to map');
                return;
            }

            // Disable editing on any features currently being edited
            (geoJsonLayer as any).disableEditingFeatures();

            // Delete each selected feature
            selectedFeatures.forEach((feature: any) => {
                geoJsonLayer.eachLayer((layer: any) => {
                    if (layer.feature === feature) {
                        // Remove from map
                        geoJsonLayer.removeLayer(layer);
                        
                        // Fire deleted event
                        if (handlerMappings?.dotNetRef && handlerMappings.events['featuredeleted']) {
                            handlerMappings.dotNetRef.invokeMethodAsync(
                                handlerMappings.events['featuredeleted'],
                                { feature, layer: null }
                            );
                        }
                    }
                });
            });

            // Clear the SelectedFeatures array using splice to maintain the reference
            const selectedFeaturesArray = (geoJsonLayer as any).SelectedFeatures;
            if (selectedFeaturesArray && Array.isArray(selectedFeaturesArray)) {
                selectedFeaturesArray.splice(0, selectedFeaturesArray.length);
            }
            (geoJsonLayer as any).SelectedFeature = null;
            
            // Fire unselection event to update UI
            if (handlerMappings?.dotNetRef && handlerMappings.events['featureunselected']) {
                handlerMappings.dotNetRef.invokeMethodAsync(
                    handlerMappings.events['featureunselected'],
                    { feature: null, layer: null }
                );
            }
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
            
            const updateVertexMarkers = () => {
                // Remove all existing markers
                vertexMarkers.forEach(marker => {
                    const map = getMap();
                    if (map) {
                        map.removeLayer(marker);
                    }
                });
                vertexMarkers.length = 0;
                
                // Recreate vertex markers for current vertices
                coords.forEach((latlng: L.LatLng, index: number) => {
                    const marker = createEditableVertexMarker(latlng, index);
                    vertexMarkers.push(marker);
                });
                
                // Update stored references on layer
                (layer as any)._vertexMarkers = vertexMarkers;
            };
            
            const createEditableVertexMarker = (latlng: L.LatLng, index: number) => {
                const marker = L.circleMarker(latlng, {
                    radius: 8,
                    fillColor: '#ffffff',
                    color: '#ff0000',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 1,
                    draggable: true,
                    interactive: true,
                    bubblingMouseEvents: false,
                    pane: 'markerPane' // Use markerPane which has higher z-index than overlayPane
                } as any);
                
                marker.addTo(map);
                
                // Bring marker to front to ensure it's always clickable
                if (marker.bringToFront) {
                    marker.bringToFront();
                }

                // Store click handler reference for remove vertex mode
                const deleteVertexHandler = (e: any) => {
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
                    updateVertexMarkers();
                    
                    console.log(`Deleted vertex at index ${index}, total vertices: ${coords.length}`);
                };
                
                // Store the handler on the marker for later use
                (marker as any)._deleteHandler = deleteVertexHandler;
                
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
                    };
                    
                    map.on('mousemove', onMouseMove);
                    map.on('mouseup', onMouseUp);
                });
                
                return marker;
            };
            
            // Initial marker creation
            updateVertexMarkers();
            
            // Store markers and data on layer for cleanup
            (layer as any)._vertexMarkers = vertexMarkers;
            (layer as any)._editingEnabled = true;
            (layer as any)._updateVertexMarkers = updateVertexMarkers;
            (layer as any)._coords = coords;
            (layer as any)._isPolygon = isPolygon;
            (layer as any)._minVertices = minVertices;
            
            // Apply editing style
            layer.setStyle(editingStyle);
        };

        // Disable vertex editing
        const disableVertexEditing = (layer: any) => {
            if (!(layer as any)._editingEnabled) return;
            
            const map = getMap();
            
            // Remove vertex markers
            if (map && (layer as any)._vertexMarkers) {
                (layer as any)._vertexMarkers.forEach((marker: L.CircleMarker) => {
                    map.removeLayer(marker);
                });
            }
            
            // Remove click handler from layer if in add vertex mode
            if ((layer as any)._addVertexClickHandler) {
                layer.off('click', (layer as any)._addVertexClickHandler);
                delete (layer as any)._addVertexClickHandler;
            }
            
            delete (layer as any)._vertexMarkers;
            delete (layer as any)._editingEnabled;
            delete (layer as any)._updateVertexMarkers;
            delete (layer as any)._coords;
            delete (layer as any)._isPolygon;
            delete (layer as any)._minVertices;
            
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
        
        // Set add vertex mode
        (geoJsonLayer as any).setAddVertexMode = function(enabled: boolean) {
            console.log(`Add vertex mode: ${enabled}`);
            
            editableLayers.forEach((layer: any, feature: any) => {
                if (!layer._editingEnabled) return;
                
                if (enabled) {
                    // Enable click-to-add-vertex on the layer itself
                    const addVertexClickHandler = (e: L.LeafletMouseEvent) => {
                        L.DomEvent.stopPropagation(e);
                        
                        const coords = layer._coords;
                        const isPolygon = layer._isPolygon;
                        
                        if (!coords) return;
                        
                        // Find the closest edge to insert the new vertex
                        const clickPoint = e.latlng;
                        let minDist = Infinity;
                        let insertIndex = 0;
                        
                        for (let i = 0; i < coords.length; i++) {
                            const nextIndex = (i + 1) % coords.length;
                            
                            // For polylines, skip the wrap-around edge
                            if (!isPolygon && nextIndex === 0) continue;
                            
                            const p1 = coords[i];
                            const p2 = coords[nextIndex];
                            
                            // Calculate distance from click point to this edge
                            const dist = getDistanceToSegment(clickPoint, p1, p2);
                            
                            if (dist < minDist) {
                                minDist = dist;
                                insertIndex = nextIndex;
                            }
                        }
                        
                        // Insert the new vertex
                        coords.splice(insertIndex, 0, clickPoint);
                        
                        // Update the layer geometry
                        if (isPolygon) {
                            layer.setLatLngs([coords]);
                        } else {
                            layer.setLatLngs(coords);
                        }
                        
                        // Update vertex markers
                        if (layer._updateVertexMarkers) {
                            layer._updateVertexMarkers();
                        }
                        
                        console.log(`Added vertex at index ${insertIndex}, total vertices: ${coords.length}`);
                    };
                    
                    layer.on('click', addVertexClickHandler);
                    layer._addVertexClickHandler = addVertexClickHandler;
                } else {
                    // Disable click-to-add-vertex
                    if (layer._addVertexClickHandler) {
                        layer.off('click', layer._addVertexClickHandler);
                        delete layer._addVertexClickHandler;
                    }
                }
            });
        };
        
        // Set remove vertex mode
        (geoJsonLayer as any).setRemoveVertexMode = function(enabled: boolean) {
            console.log(`Remove vertex mode: ${enabled}`);
            
            editableLayers.forEach((layer: any, feature: any) => {
                if (!layer._editingEnabled || !layer._vertexMarkers) return;
                
                layer._vertexMarkers.forEach((marker: any) => {
                    if (enabled) {
                        // Enable click-to-delete on vertex markers
                        if (marker._deleteHandler) {
                            marker.on('click', marker._deleteHandler);
                        }
                    } else {
                        // Disable click-to-delete
                        if (marker._deleteHandler) {
                            marker.off('click', marker._deleteHandler);
                        }
                    }
                });
            });
        };
        
        // Set move vertex mode
        (geoJsonLayer as any).setMoveVertexMode = function(enabled: boolean) {
            console.log(`Move vertex mode: ${enabled}`);
            
            // Move mode is the default - vertices are always draggable
            // When enabling move mode, just ensure Add and Remove modes are disabled
            if (enabled) {
                (geoJsonLayer as any).setAddVertexMode(false);
                (geoJsonLayer as any).setRemoveVertexMode(false);
            }
            // When disabling move mode, we don't need to do anything special
            // The vertex markers remain draggable by default
        };
        
        // Helper function to calculate distance from point to line segment
        function getDistanceToSegment(point: L.LatLng, p1: L.LatLng, p2: L.LatLng): number {
            const map = getMap();
            if (!map) return Infinity;
            
            const pt = map.latLngToContainerPoint(point);
            const pt1 = map.latLngToContainerPoint(p1);
            const pt2 = map.latLngToContainerPoint(p2);
            
            const x = pt.x, y = pt.y;
            const x1 = pt1.x, y1 = pt1.y;
            const x2 = pt2.x, y2 = pt2.y;
            
            const A = x - x1;
            const B = y - y1;
            const C = x2 - x1;
            const D = y2 - y1;
            
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;
            
            if (lenSq !== 0) {
                param = dot / lenSq;
            }
            
            let xx, yy;
            
            if (param < 0) {
                xx = x1;
                yy = y1;
            } else if (param > 1) {
                xx = x2;
                yy = y2;
            } else {
                xx = x1 + param * C;
                yy = y1 + param * D;
            }
            
            const dx = x - xx;
            const dy = y - yy;
            
            return Math.sqrt(dx * dx + dy * dy);
        }
        
        return geoJsonLayer;
    }
};
