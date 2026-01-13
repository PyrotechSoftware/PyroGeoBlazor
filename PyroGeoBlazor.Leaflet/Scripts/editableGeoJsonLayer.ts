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
        let drawingPoints: L.LatLng[] = [];
        let drawingType: 'polygon' | 'polyline' | null = null;
        let tempMarkers: L.CircleMarker[] = [];
        let tempPolyline: L.Polyline | null = null;
        let editableLayers: Map<any, any> = new Map();
        
        // Store original geometries for cancel operation
        let originalGeometries: Map<any, any> = new Map();

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

        // Helper to set cursor on map container
        const setMapCursor = (cursor: string | null) => {
            const map = getMap();
            if (!map) return;
            try {
                const container = map.getContainer() as HTMLElement;
                if (cursor === null || cursor === '') {
                    // Reset to default cursor
                    container.style.cursor = '';
                } else {
                    container.style.cursor = cursor;
                }
            } catch (e) {
                console.error('Error setting cursor:', e);
            }
        };

        // Helper to create data URL from SVG string
        const svgToDataUrl = (svg: string) => {
            return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
        };

        // Get cursor SVGs from options
        const addCursorSvg = options?.addCursor || '';
        const removeCursorSvg = options?.removeCursor || '';
        
        const addCursorUrl = addCursorSvg ? svgToDataUrl(addCursorSvg) : null;
        const removeCursorUrl = removeCursorSvg ? svgToDataUrl(removeCursorSvg) : null;
        
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

            map.doubleClickZoom.disable();
            // Don't set cursor here - let the drawing/editing mode set it
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

            // Reset to default cursor when completely stopping editing
            setMapCursor('default');
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

            // Set cursor to crosshair for drawing
            setMapCursor('crosshair');

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

            // Set cursor to crosshair for drawing
            setMapCursor('crosshair');

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

            geoJsonLayer.addData(feature);

            if (handlerMappings?.dotNetRef && handlerMappings.events['featurecreated']) {
                handlerMappings.dotNetRef.invokeMethodAsync(
                    handlerMappings.events['featurecreated'],
                    { feature, layer: null }
                );
            }

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

            // Reset to default cursor after confirming drawing
            setMapCursor('default');
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

            // Reset to default cursor after cancelling
            setMapCursor('default');

            if (handlerMappings?.dotNetRef && handlerMappings.events['drawingcancelled']) {
                handlerMappings.dotNetRef.invokeMethodAsync(
                    handlerMappings.events['drawingcancelled']
                );
            }
        };

        // Edit selected features
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

            originalGeometries.clear();

            selectedFeatures.forEach((feature: any) => {
                geoJsonLayer.eachLayer((layer: any) => {
                    if (layer.feature === feature && (layer instanceof L.Polygon || layer instanceof L.Polyline)) {
                        const isPolygon = layer instanceof L.Polygon;
                        const currentLatLngs = layer.getLatLngs();
                        const coords = isPolygon ? currentLatLngs[0] : currentLatLngs;
                        
                        const originalCoords = coords.map((latlng: L.LatLng) => ({ lat: latlng.lat, lng: latlng.lng }));
                        originalGeometries.set(feature, { coords: originalCoords, isPolygon });
                        
                        // Initialize with move cursor
                        (layer as any)._currentCursor = 'move';
                        
                        if (!layer.editing) {
                            enableVertexEditing(layer, feature);
                        } else {
                            layer.editing.enable();
                        }
                        
                        // Set cursor on the feature layer itself
                        const featureElem = layer.getElement ? layer.getElement() : null;
                        if (featureElem) {
                            featureElem.style.cursor = 'move';
                        }
                        
                        editableLayers.set(feature, layer);
                    }
                });
            });
            
            // Set move cursor when entering edit mode (default edit cursor)
            setMapCursor('move');
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

        // Confirm editing
        (geoJsonLayer as any).confirmEditing = function() {
            editableLayers.forEach((layer: any, feature: any) => {
                if (layer.editing && layer.editing.enabled()) {
                    layer.editing.disable();
                } else {
                    disableVertexEditing(layer);
                }
                
                const isPolygon = layer instanceof L.Polygon;
                const currentLatLngs = layer.getLatLngs();
                const coords = isPolygon ? currentLatLngs[0] : currentLatLngs;
                
                const newCoords = coords.map((ll: L.LatLng) => [ll.lng, ll.lat]);
                if (isPolygon) {
                    newCoords.push(newCoords[0]);
                    feature.geometry.coordinates = [newCoords];
                } else {
                    feature.geometry.coordinates = newCoords;
                }
                
                // Reset cursor on the feature layer
                const featureElem = layer.getElement ? layer.getElement() : null;
                if (featureElem) {
                    featureElem.style.cursor = '';
                }
                
                if (handlerMappings?.dotNetRef && handlerMappings.events['featuremodified']) {
                    handlerMappings.dotNetRef.invokeMethodAsync(
                        handlerMappings.events['featuremodified'],
                        { feature, layer: null }
                    );
                }
            });
            
            editableLayers.clear();
            originalGeometries.clear();
            
            // Reset to default cursor after confirming edit
            setMapCursor('default');
        };

        // Cancel editing
        (geoJsonLayer as any).cancelEditing = function() {
            editableLayers.forEach((layer: any, feature: any) => {
                if (layer.editing && layer.editing.enabled()) {
                    layer.editing.disable();
                } else {
                    disableVertexEditing(layer);
                }
                
                const originalGeometry = originalGeometries.get(feature);
                if (originalGeometry) {
                    const { coords, isPolygon } = originalGeometry;
                    const restoredLatLngs = coords.map((c: any) => L.latLng(c.lat, c.lng));
                    
                    if (isPolygon) {
                        layer.setLatLngs([restoredLatLngs]);
                    } else {
                        layer.setLatLngs(restoredLatLngs);
                    }
                    
                    const originalCoords = coords.map((c: any) => [c.lng, c.lat]);
                    if (isPolygon) {
                        originalCoords.push(originalCoords[0]);
                        feature.geometry.coordinates = [originalCoords];
                    } else {
                        feature.geometry.coordinates = originalCoords;
                    }
                }
                
                // Reset cursor on the feature layer
                const featureElem = layer.getElement ? layer.getElement() : null;
                if (featureElem) {
                    featureElem.style.cursor = '';
                }
            });
            
            editableLayers.clear();
            originalGeometries.clear();
            
            // Reset to default cursor after cancelling edit
            setMapCursor('default');
        };

        // Delete selected features
        (geoJsonLayer as any).deleteSelectedFeatures = async function() {
            const selectedFeatures = (geoJsonLayer as any).SelectedFeatures || [];
            
            if (selectedFeatures.length === 0) return;

            const map = getMap();
            if (!map) return;

            // Raise the deleting event with cancellation support
            if (handlerMappings?.dotNetRef && handlerMappings.events['featuredeleting']) {
                try {
                    const result = await handlerMappings.dotNetRef.invokeMethodAsync(
                        handlerMappings.events['featuredeleting'],
                        { 
                            features: selectedFeatures,
                            cancel: false
                        }
                    );
                    
                    // Check if the operation was cancelled
                    // Check both camelCase and PascalCase since C# might return PascalCase
                    if (result && (result.cancel === true || result.Cancel === true)) {
                        return;
                    }
                } catch (error) {
                    console.error('Error calling featuredeleting event:', error);
                    return;
                }
            }

            (geoJsonLayer as any).disableEditingFeatures();

            selectedFeatures.forEach((feature: any) => {
                geoJsonLayer.eachLayer((layer: any) => {
                    if (layer.feature === feature) {
                        geoJsonLayer.removeLayer(layer);
                        
                        if (handlerMappings?.dotNetRef && handlerMappings.events['featuredeleted']) {
                            handlerMappings.dotNetRef.invokeMethodAsync(
                                handlerMappings.events['featuredeleted'],
                                { feature, layer: null }
                            );
                        }
                    }
                });
            });

            const selectedFeaturesArray = (geoJsonLayer as any).SelectedFeatures;
            if (selectedFeaturesArray && Array.isArray(selectedFeaturesArray)) {
                selectedFeaturesArray.splice(0, selectedFeaturesArray.length);
            }
            (geoJsonLayer as any).SelectedFeature = null;
            
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
            const minVertices = isPolygon ? 3 : 2;
            const vertexMarkers: L.CircleMarker[] = [];
            
            const updateVertexMarkers = () => {
                vertexMarkers.forEach(marker => {
                    const map = getMap();
                    if (map) {
                        map.removeLayer(marker);
                    }
                });
                vertexMarkers.length = 0;
                
                coords.forEach((latlng: L.LatLng, index: number) => {
                    const marker = createEditableVertexMarker(latlng, index);
                    vertexMarkers.push(marker);
                });
                
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
                    interactive: true,
                    bubblingMouseEvents: false,
                    pane: 'markerPane'
                } as any);
                
                marker.addTo(map);
                if (marker.bringToFront) marker.bringToFront();
                
                // Set cursor on the marker element after it's added to the map
                const elem = marker.getElement();
                if (elem) {
                    elem.style.cursor = (layer as any)._currentCursor || 'move';
                }

                const deleteVertexHandler = (e: any) => {
                    L.DomEvent.stopPropagation(e);
                    L.DomEvent.preventDefault(e);
                    
                    if (coords.length <= minVertices) return;
                    
                    coords.splice(index, 1);
                    
                    if (isPolygon) {
                        layer.setLatLngs([coords]);
                    } else {
                        layer.setLatLngs(coords);
                    }
                    
                    updateVertexMarkers();
                };
                
                (marker as any)._deleteHandler = deleteVertexHandler;
                
                marker.on('mousedown', (e: any) => {
                    L.DomEvent.stopPropagation(e);
                    
                    if (map.dragging) map.dragging.disable();
                    
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
                        
                        if (map.dragging) map.dragging.enable();
                    };
                    
                    map.on('mousemove', onMouseMove);
                    map.on('mouseup', onMouseUp);
                });
                
                return marker;
            };
            
            updateVertexMarkers();
            
            (layer as any)._vertexMarkers = vertexMarkers;
            (layer as any)._editingEnabled = true;
            (layer as any)._updateVertexMarkers = updateVertexMarkers;
            (layer as any)._coords = coords;
            (layer as any)._isPolygon = isPolygon;
            (layer as any)._minVertices = minVertices;
            
            layer.setStyle(editingStyle);
        };

        const disableVertexEditing = (layer: any) => {
            if (!(layer as any)._editingEnabled) return;
            
            const map = getMap();
            
            if (map && (layer as any)._vertexMarkers) {
                (layer as any)._vertexMarkers.forEach((marker: L.CircleMarker) => {
                    map.removeLayer(marker);
                });
            }
            
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
            
            if ((layer as any).feature) {
                const selectedFeatures = (geoJsonLayer as any).SelectedFeatures || [];
                if (selectedFeatures.includes((layer as any).feature) && options?.selectedFeatureStyle) {
                    layer.setStyle(options.selectedFeatureStyle);
                } else {
                    const style = options?.style || {};
                    layer.setStyle(style);
                }
            }
        };
        
        // Set add vertex mode
        (geoJsonLayer as any).setAddVertexMode = function(enabled: boolean) {
            let cursorStyle = 'move';
            if (enabled) {
                if (addCursorUrl) {
                    cursorStyle = `url('${addCursorUrl}') 0 0, crosshair`;
                    setMapCursor(cursorStyle);
                } else {
                    cursorStyle = 'crosshair';
                    setMapCursor(cursorStyle);
                }
            } else {
                cursorStyle = 'move';
                setMapCursor(cursorStyle);
            }
            
            editableLayers.forEach((layer: any) => {
                if (!layer._editingEnabled) return;
                
                // Store current cursor on layer for vertex markers
                layer._currentCursor = cursorStyle;
                
                // Set cursor on the feature layer itself
                const featureElem = layer.getElement ? layer.getElement() : null;
                if (featureElem) {
                    featureElem.style.cursor = cursorStyle;
                }
                
                // Update cursor on all existing vertex markers
                if (layer._vertexMarkers) {
                    layer._vertexMarkers.forEach((marker: any) => {
                        const elem = marker.getElement();
                        if (elem) {
                            elem.style.cursor = cursorStyle;
                        }
                    });
                }
                
                if (enabled) {
                    const addVertexClickHandler = (e: L.LeafletMouseEvent) => {
                        L.DomEvent.stopPropagation(e);
                        
                        const coords = layer._coords;
                        const isPolygon = layer._isPolygon;
                        
                        if (!coords) return;
                        
                        const clickPoint = e.latlng;
                        let minDist = Infinity;
                        let insertIndex = 0;
                        
                        for (let i = 0; i < coords.length; i++) {
                            const nextIndex = (i + 1) % coords.length;
                            
                            if (!isPolygon && nextIndex === 0) continue;
                            
                            const p1 = coords[i];
                            const p2 = coords[nextIndex];
                            
                            const dist = getDistanceToSegment(clickPoint, p1, p2);
                            
                            if (dist < minDist) {
                                minDist = dist;
                                insertIndex = nextIndex;
                            }
                        }
                        
                        coords.splice(insertIndex, 0, clickPoint);
                        
                        if (isPolygon) {
                            layer.setLatLngs([coords]);
                        } else {
                            layer.setLatLngs(coords);
                        }
                        
                        if (layer._updateVertexMarkers) {
                            layer._updateVertexMarkers();
                        }
                    };
                    
                    layer.on('click', addVertexClickHandler);
                    layer._addVertexClickHandler = addVertexClickHandler;
                } else {
                    if (layer._addVertexClickHandler) {
                        layer.off('click', layer._addVertexClickHandler);
                        delete layer._addVertexClickHandler;
                    }
                }
            });
        };
        
        // Set remove vertex mode
        (geoJsonLayer as any).setRemoveVertexMode = function(enabled: boolean) {
            let cursorStyle = 'move';
            if (enabled) {
                if (removeCursorUrl) {
                    cursorStyle = `url('${removeCursorUrl}') 0 0, crosshair`;
                    setMapCursor(cursorStyle);
                } else {
                    cursorStyle = 'crosshair';
                    setMapCursor(cursorStyle);
                }
            } else {
                cursorStyle = 'move';
                setMapCursor(cursorStyle);
            }
            
            editableLayers.forEach((layer: any) => {
                if (!layer._editingEnabled || !layer._vertexMarkers) return;
                
                // Store current cursor on layer for vertex markers
                layer._currentCursor = cursorStyle;
                
                // Set cursor on the feature layer itself
                const featureElem = layer.getElement ? layer.getElement() : null;
                if (featureElem) {
                    featureElem.style.cursor = cursorStyle;
                }
                
                // Update cursor on all existing vertex markers
                layer._vertexMarkers.forEach((marker: any) => {
                    const elem = marker.getElement();
                    if (elem) {
                        elem.style.cursor = cursorStyle;
                    }
                    
                    if (enabled) {
                        if (marker._deleteHandler) {
                            marker.on('click', marker._deleteHandler);
                        }
                    } else {
                        if (marker._deleteHandler) {
                            marker.off('click', marker._deleteHandler);
                        }
                    }
                });
            });
        };
        
        // Set move vertex mode
        (geoJsonLayer as any).setMoveVertexMode = function(enabled: boolean) {
            if (enabled) {
                (geoJsonLayer as any).setAddVertexMode(false);
                (geoJsonLayer as any).setRemoveVertexMode(false);
                
                const cursorStyle = 'move';
                setMapCursor(cursorStyle);
                
                // Update cursor on all vertex markers and feature layers
                editableLayers.forEach((layer: any) => {
                    if (!layer._editingEnabled) return;
                    
                    layer._currentCursor = cursorStyle;
                    
                    // Set cursor on the feature layer itself
                    const featureElem = layer.getElement ? layer.getElement() : null;
                    if (featureElem) {
                        featureElem.style.cursor = cursorStyle;
                    }
                    
                    if (layer._vertexMarkers) {
                        layer._vertexMarkers.forEach((marker: any) => {
                            const elem = marker.getElement();
                            if (elem) {
                                elem.style.cursor = cursorStyle;
                            }
                        });
                    }
                });
            } else {
                // When disabling move mode, don't change cursor - let next mode set it
                // or confirm/cancel will set it to default
            }
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
            
            let xx: number, yy: number;
            
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
