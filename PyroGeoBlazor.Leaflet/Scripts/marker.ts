import { EventHandlerMapping } from './eventHandling';
import { LeafletEvents } from './events';

declare const L: typeof import('leaflet');

export const Marker = {
    createMarker(
        latLng: L.LatLng,
        options?: L.MarkerOptions,
        handlerMappings?: EventHandlerMapping
    ): L.Marker {
        const marker = L.marker(latLng, options);
        // Attach event handlers if provided
        if (handlerMappings && handlerMappings.dotNetRef && handlerMappings.events) {
            const keys = Object.keys(handlerMappings.events);

            if (keys.indexOf('move') > -1) {
                marker.on('move', function (ev: any) {
                    var methodName = handlerMappings.events['move'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for marker move event`, e);
                    }
                });
            }
            if (keys.indexOf('dragstart') > -1) {
                marker.on('dragstart', function (ev: any) {
                    var methodName = handlerMappings.events['dragstart'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        //console.log('payload', payload);
                        //console.log('json', JSON.stringify(payload));
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for marker dragstart event`, e);
                    }
                });
            }
            if (keys.indexOf('movestart') > -1) {
                marker.on('movestart', function (ev: any) {
                    var methodName = handlerMappings.events['movestart'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for marker movestart event`, e);
                    }
                });
            }
            if (keys.indexOf('drag') > -1) {
                marker.on('drag', function (ev: any) {
                    var methodName = handlerMappings.events['drag'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for marker drag event`, e);
                    }
                });
            }
            if (keys.indexOf('dragend') > -1) {
                marker.on('dragend', function (ev: L.DragEndEvent) {
                    var methodName = handlerMappings.events['dragend'];
                    try {
                        let payload = LeafletEvents.LeafletDragEndEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for marker dragend event`, e);
                    }
                });
            }
            if (keys.indexOf('moveend') > -1) {
                marker.on('moveend', function (ev: any) {
                    var methodName = handlerMappings.events['moveend'];
                    try {
                        let payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for marker moveend event`, e);
                    }
                });
            }
            if (keys.indexOf('click') > -1) {
                marker.on('click', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['click'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event click`, e);
                    }
                });
            }
            if (keys.indexOf('dblclick') > -1) {
                marker.on('dblclick', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['dblclick'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event dblclick`, e);
                    }
                });
            }
            if (keys.indexOf('mousedown') > -1) {
                marker.on('mousedown', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['mousedown'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event mousedown`, e);
                    }
                });
            }
            if (keys.indexOf('mouseup') > -1) {
                marker.on('mouseup', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['mouseup'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event mouseup`, e);
                    }
                });
            }
            if (keys.indexOf('mouseover') > -1) {
                marker.on('mouseover', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['mouseover'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event mouseover`, e);
                    }
                });
            }
            if (keys.indexOf('mouseout') > -1) {
                marker.on('mouseout', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['mouseout'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event mouseout`, e);
                    }
                });
            }
            if (keys.indexOf('contextmenu') > -1) {
                marker.on('contextmenu', function (ev: L.LeafletMouseEvent) {
                    var methodName = handlerMappings.events!['contextmenu'];
                    try {
                        var payload = LeafletEvents.LeafletMouseEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event contextmenu`, e);
                    }
                });
            }
            if (keys.indexOf('add') > -1) {
                marker.on('add', function (ev: any) {
                    var methodName = handlerMappings.events!['add'];
                    try {
                        var payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event add`, e);
                    }
                });
            }
            if (keys.indexOf('remove') > -1) {
                marker.on('remove', function (ev: any) {
                    var methodName = handlerMappings.events!['remove'];
                    try {
                        var payload = LeafletEvents.LeafletEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event remove`, e);
                    }
                });
            }
            if (keys.indexOf('popupopen') > -1) {
                marker.on('popupopen', function (ev: L.PopupEvent) {
                    var methodName = handlerMappings.events!['popupopen'];
                    try {
                        var payload = LeafletEvents.LeafletPopupEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event popupopen`, e);
                    }
                });
            }
            if (keys.indexOf('popupclose') > -1) {
                marker.on('popupclose', function (ev: L.PopupEvent) {
                    var methodName = handlerMappings.events!['popupclose'];
                    try {
                        var payload = LeafletEvents.LeafletPopupEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event popupclose`, e);
                    }
                });
            }
            if (keys.indexOf('tooltipopen') > -1) {
                marker.on('tooltipopen', function (ev: L.TooltipEvent) {
                    var methodName = handlerMappings.events!['tooltipopen'];
                    try {
                        var payload = LeafletEvents.LeafletTooltipEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event tooltipopen`, e);
                    }
                });
            }
            if (keys.indexOf('tooltipclose') > -1) {
                marker.on('tooltipclose', function (ev: L.TooltipEvent) {
                    var methodName = handlerMappings.events!['tooltipclose'];
                    try {
                        var payload = LeafletEvents.LeafletTooltipEventArgs.fromLeaflet(ev).toDto();
                        handlerMappings.dotNetRef!.invokeMethodAsync(methodName, payload);
                    } catch (e) {
                        console.error(`Error invoking dotnet handler for event tooltipclose`, e);
                    }
                });
            }
        }

        return marker;
    }
}
