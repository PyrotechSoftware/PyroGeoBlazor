declare const L: typeof import('leaflet');
declare const Mvt: typeof import('leaflet-vectortile-mapbox');

export namespace LeafletEvents {
    // DTO shapes sent to .NET using Leaflet classes directly, matching C# EventArgs properties
    export interface LeafletEventArgsDto {
        Type?: string | null;
        Target?: any | null;
        SourceTarget?: any | null;
        PropagatedFrom?: any | null;
    }

    // Matches C# LeafletMouseEventArgs: LatLng, LayerPoint, ContainerPoint, OriginalEvent
    export interface LeafletMouseEventArgsDto extends LeafletEventArgsDto {
        LatLng?: L.LatLng | null;
        LayerPoint?: L.Point | null;
        ContainerPoint?: L.Point | null;
        OriginalEvent?: any | null;
    }

    // Matches C# LeafletResizeEventArgs: OldSize, NewSize
    export interface LeafletResizeEventArgsDto extends LeafletEventArgsDto {
        OldSize?: L.Point | null;
        NewSize?: L.Point | null;
    }

    // Matches C# LeafletPopupEventArgs: Popup
    export interface LeafletPopupEventArgsDto extends LeafletEventArgsDto {
        Popup?: L.Popup | null;
    }

    // Matches C# LeafletDragEndEventArgs: Distance
    export interface LeafletDragEndEventArgsDto extends LeafletEventArgsDto {
        Distance?: number | null;
    }

    // Matches C# LeafletErrorEventArgs: Message, Code
    export interface LeafletErrorEventArgsDto extends LeafletEventArgsDto {
        Message?: string | null;
        Code?: number | null;
    }

    // Matches C# LeafletGeoJsonEventArgs: Layer, Properties, GeometryType, Id
    export interface LeafletGeoJsonEventArgsDto extends LeafletEventArgsDto {
        Layer?: L.Layer | null;
        Properties?: any | null;
        GeometryType?: string | null;
        Id?: string | null;
    }

    // Matches C# LeafletKeyboardEventArgs: OriginalEvent
    export interface LeafletKeyboardEventArgsDto extends LeafletEventArgsDto {
        OriginalEvent?: any | null;
    }

    // Matches C# LeafletLayerEventArgs: Layer
    export interface LeafletLayerEventArgsDto extends LeafletEventArgsDto {
        Layer?: L.Layer | null;
    }

    // Matches C# LeafletLayersControlEventArgs: Layer, Name
    export interface LeafletLayersControlEventArgsDto extends LeafletEventArgsDto {
        Layer?: L.Layer | null;
        Name?: string | null;
    }

    export interface LatLngBoundsDto {
        NorthEast: L.LatLng;
        SouthWest: L.LatLng;
    }

    // Matches C# LeafletLocationEventArgs: use plain serializable shapes to avoid circular refs
    export interface LeafletLocationEventArgsDto extends LeafletEventArgsDto {
        LatLng?: L.LatLng | null;
        Bounds?: LatLngBoundsDto | null;
        Accuracy?: number | null;
        Altitude?: number | null;
        AltitudeAccuracy?: number | null;
        Heading?: number | null;
        Speed?: number | null;
        Timestamp?: number | null;
    }

    // Matches C# LeafletTileErrorEventArgs: Tile, Coords, Error
    export interface LeafletTileErrorEventArgsDto extends LeafletEventArgsDto {
        Tile?: any | null;
        Coords?: L.Point | null;
        Error?: any | null;
    }

    // Matches C# LeafletTileEventArgs: Tile, Coords
    export interface LeafletTileEventArgsDto extends LeafletEventArgsDto {
        Tile?: any | null;
        Coords?: L.Point | null;
    }

    // Matches C# LeafletTooltipEventArgs: Tooltip
    export interface LeafletTooltipEventArgsDto extends LeafletEventArgsDto {
        Tooltip?: L.Tooltip | null;
    }

    // Matches C# LeafletZoomAnimEventArgs: Center, Zoom, NoUpdate
    export interface LeafletZoomAnimEventArgsDto extends LeafletEventArgsDto {
        Center?: L.LatLng | null;
        Zoom?: number | null;
        NoUpdate?: boolean | null;
    }

    // Matches C# LeafletFeatureMouseEventArgs
    export interface LeafletFeatureMouseEventArgsDto extends LeafletMouseEventArgsDto {
        LayerName?: string | null;
        Feature?: any | null;
    }

    // Matches C# LeafletTileFetchErrorEventArgs
    export interface LeafletTileFetchErrorEventArgsDto extends LeafletTileErrorEventArgsDto {
        Url?: string | null;
        z?: number | null;
        x?: number | null;
        y?: number | null;
    }

    export function minimalLayerInfo(obj: any): any {
        if (!obj) return null;
        const info: any = {};
        if ('_leaflet_id' in obj) info.LeafletId = obj._leaflet_id;
        if (obj && obj.constructor && obj.constructor.name) info.Type = obj.constructor.name;
        return info;
    }

    export class LeafletEventArgs {
        Type?: string | null;
        Target?: any | null;
        SourceTarget?: any | null;
        PropagatedFrom?: any | null;

        constructor(init?: Partial<LeafletEventArgsDto>) {
            if (init) {
                this.Type = init.Type ?? null;
                this.Target = init.Target ?? null;
                this.SourceTarget = init.SourceTarget ?? null;
                this.PropagatedFrom = init.PropagatedFrom ?? null;
            }
        }

        toDto(): LeafletEventArgsDto {
            return {
                Type: this.Type ?? null,
                Target: this.Target ?? null,
                SourceTarget: this.SourceTarget ?? null,
                PropagatedFrom: this.PropagatedFrom ?? null
            };
        }

        static fromLeaflet(ev: any): LeafletEventArgs {
            const dto: LeafletEventArgsDto = {
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            };
            return new LeafletEventArgs(dto);
        }
    }

    export class LeafletMouseEventArgs extends LeafletEventArgs {
        LatLng?: L.LatLng | null;
        LayerPoint?: L.Point | null;
        ContainerPoint?: L.Point | null;
        OriginalEvent?: any | null;

        constructor(init?: Partial<LeafletMouseEventArgsDto>) {
            super(init);
            if (init) {
                this.LatLng = init.LatLng ?? null;
                this.LayerPoint = init.LayerPoint ?? null;
                this.ContainerPoint = init.ContainerPoint ?? null;
                this.OriginalEvent = init.OriginalEvent ?? null;
            }
        }

        toDto(): LeafletMouseEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                LatLng: this.LatLng ?? null,
                LayerPoint: this.LayerPoint ?? null,
                ContainerPoint: this.ContainerPoint ?? null,
                OriginalEvent: this.OriginalEvent ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletMouseEventArgs {
            const dto: Partial<LeafletMouseEventArgsDto> = {
                LatLng: ev?.latlng ?? null,
                LayerPoint: ev?.layerPoint ?? null,
                ContainerPoint: ev?.containerPoint ?? null,
                OriginalEvent: ev?.originalEvent ?? null,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as Partial<LeafletMouseEventArgsDto & LeafletEventArgsDto>;

            return new LeafletMouseEventArgs(dto);
        }
    }

    export class LeafletResizeEventArgs extends LeafletEventArgs {
        OldSize?: L.Point | null;
        NewSize?: L.Point | null;

        constructor(init?: Partial<LeafletResizeEventArgsDto>) {
            super(init);
            if (init) {
                this.OldSize = init.OldSize ?? null;
                this.NewSize = init.NewSize ?? null;
            }
        }

        toDto(): LeafletResizeEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                OldSize: this.OldSize ?? null,
                NewSize: this.NewSize ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletResizeEventArgs {
            const dto: Partial<LeafletResizeEventArgsDto> = {
                OldSize: ev?.oldSize ?? null,
                NewSize: ev?.newSize ?? null,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;
            return new LeafletResizeEventArgs(dto);
        }
    }

    export class LeafletPopupEventArgs extends LeafletEventArgs {
        Popup?: L.Popup | null;

        constructor(init?: Partial<LeafletPopupEventArgsDto>) {
            super(init);
            if (init) {
                this.Popup = init.Popup ?? null;
            }
        }

        toDto(): LeafletPopupEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                Popup: this.Popup ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletPopupEventArgs {
            const dto: Partial<LeafletPopupEventArgsDto> = {
                Popup: ev?.popup ?? ev?.layer ?? ev?.target ?? null,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;
            return new LeafletPopupEventArgs(dto);
        }
    }

    export class LeafletDragEndEventArgs extends LeafletEventArgs {
        Distance?: number | null;

        constructor(init?: Partial<LeafletDragEndEventArgsDto>) {
            super(init);
            if (init) {
                this.Distance = init.Distance ?? null;
            }
        }

        toDto(): LeafletDragEndEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                Distance: this.Distance ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletDragEndEventArgs {
            const dto: Partial<LeafletDragEndEventArgsDto> = {
                Distance: (typeof ev?.distance === 'number') ? ev.distance : null,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;
            return new LeafletDragEndEventArgs(dto);
        }
    }

    export class LeafletErrorEventArgs extends LeafletEventArgs {
        Message?: string | null;
        Code?: number | null;

        constructor(init?: Partial<LeafletErrorEventArgsDto>) {
            super(init);
            if (init) {
                this.Message = init.Message ?? null;
                this.Code = init.Code ?? null;
            }
        }

        toDto(): LeafletErrorEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                Message: this.Message ?? null,
                Code: this.Code ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletErrorEventArgs {
            // try common locations for message/code
            const msg = ev?.message ?? ev?.error?.message ?? null;
            const code = (typeof ev?.code === 'number') ? ev.code : (typeof ev?.status === 'number' ? ev.status : null);

            const dto: Partial<LeafletErrorEventArgsDto> = {
                Message: msg,
                Code: code,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;
            return new LeafletErrorEventArgs(dto);
        }
    }

    export class LeafletGeoJsonEventArgs extends LeafletEventArgs {
        Layer?: L.Layer | null;
        Properties?: any | null;
        GeometryType?: string | null;
        Id?: string | null;

        constructor(init?: Partial<LeafletGeoJsonEventArgsDto>) {
            super(init);
            if (init) {
                this.Layer = init.Layer ?? null;
                this.Properties = init.Properties ?? null;
                this.GeometryType = init.GeometryType ?? null;
                this.Id = init.Id ?? null;
            }
        }

        toDto(): LeafletGeoJsonEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                Layer: this.Layer ?? null,
                Properties: this.Properties ?? null,
                GeometryType: this.GeometryType ?? null,
                Id: this.Id ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletGeoJsonEventArgs {
            const dto: Partial<LeafletGeoJsonEventArgsDto> = {
                Layer: minimalLayerInfo(ev?.layer) ?? minimalLayerInfo(ev?.target) ?? null,
                Properties: ev?.properties ?? ev?.layer?.feature?.properties ?? null,
                GeometryType: ev?.geometryType ?? ev?.layer?.feature?.geometry?.type ?? null,
                Id: ev?.id ?? ev?.layer?.feature?.id ?? null,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;

            return new LeafletGeoJsonEventArgs(dto);
        }
    }

    export class LeafletKeyboardEventArgs extends LeafletEventArgs {
        OriginalEvent?: any | null;

        constructor(init?: Partial<LeafletKeyboardEventArgsDto>) {
            super(init);
            if (init) {
                this.OriginalEvent = init.OriginalEvent ?? null;
            }
        }

        toDto(): LeafletKeyboardEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                OriginalEvent: this.OriginalEvent ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletKeyboardEventArgs {
            const dto: Partial<LeafletKeyboardEventArgsDto> = {
                OriginalEvent: ev?.originalEvent ?? null,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;
            return new LeafletKeyboardEventArgs(dto);
        }
    }

    export class LeafletLayerEventArgs extends LeafletEventArgs {
        Layer?: L.Layer | null;

        constructor(init?: Partial<LeafletLayerEventArgsDto>) {
            super(init);
            if (init) {
                this.Layer = init.Layer ?? null;
            }
        }

        toDto(): LeafletLayerEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                Layer: this.Layer ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletLayerEventArgs {
            const dto: Partial<LeafletLayerEventArgsDto> = {
                Layer: minimalLayerInfo(ev?.layer) ?? minimalLayerInfo(ev?.target) ?? null,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;
            return new LeafletLayerEventArgs(dto);
        }
    }

    export class LeafletLayersControlEventArgs extends LeafletEventArgs {
        Layer?: L.Layer | null;
        Name?: string | null;

        constructor(init?: Partial<LeafletLayersControlEventArgsDto>) {
            super(init);
            if (init) {
                this.Layer = init.Layer ?? null;
                this.Name = init.Name ?? null;
            }
        }

        toDto(): LeafletLayersControlEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                Layer: this.Layer ?? null,
                Name: this.Name ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletLayersControlEventArgs {
            const dto: Partial<LeafletLayersControlEventArgsDto> = {
                Layer: minimalLayerInfo(ev?.layer) ?? minimalLayerInfo(ev?.target) ?? null,
                Name: ev?.name ?? ev?.layer?.options?.name ?? null,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;
            return new LeafletLayersControlEventArgs(dto);
        }
    }

    export class LeafletLocationEventArgs extends LeafletEventArgs {
        LatLng?: L.LatLng;
        Bounds?: LatLngBoundsDto | null;
        Accuracy?: number | null;
        Altitude?: number | null;
        AltitudeAccuracy?: number | null;
        Heading?: number | null;
        Speed?: number | null;
        Timestamp?: number | null;

        constructor(init?: Partial<LeafletLocationEventArgsDto>) {
            super(init);
            if (init) {
                this.LatLng = init.LatLng ?? null;
                this.Bounds = init.Bounds ?? null;
                this.Accuracy = init.Accuracy ?? null;
                this.Altitude = init.Altitude ?? null;
                this.AltitudeAccuracy = init.AltitudeAccuracy ?? null;
                this.Heading = init.Heading ?? null;
                this.Speed = init.Speed ?? null;
                this.Timestamp = init.Timestamp ?? null;
            }
        }

        toDto(): LeafletLocationEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                LatLng: this.LatLng ?? null,
                Bounds: this.Bounds ?? null,
                Accuracy: this.Accuracy ?? null,
                Altitude: this.Altitude ?? null,
                AltitudeAccuracy: this.AltitudeAccuracy ?? null,
                Heading: this.Heading ?? null,
                Speed: this.Speed ?? null,
                Timestamp: this.Timestamp ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletLocationEventArgs {
            // LatLngBounds doesn't map directly, so create a simple DTO
            let boundsDto = null;
            if (ev?.bounds && typeof ev.bounds.getNorthEast === 'function') {
                const ne = ev.bounds.getNorthEast();
                const sw = ev.bounds.getSouthWest();
                boundsDto = { NorthEast: ne, SouthWest: sw };
            }

            const dto: Partial<LeafletLocationEventArgsDto> = {
                LatLng: ev.latlng ?? null,
                Bounds: boundsDto ?? null,
                Accuracy: ('accuracy' in (ev ?? {})) ? ev.accuracy : null,
                Altitude: ('altitude' in (ev ?? {})) ? ev.altitude : null,
                AltitudeAccuracy: ('altitudeAccuracy' in (ev ?? {})) ? ev.altitudeAccuracy : null,
                Heading: ('heading' in (ev ?? {})) ? ev.heading : null,
                Speed: ('speed' in (ev ?? {})) ? ev.speed : null,
                Timestamp: ('timestamp' in (ev ?? {})) ? ev.timestamp : null,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;
            return new LeafletLocationEventArgs(dto);
        }
    }

    export class LeafletTileErrorEventArgs extends LeafletEventArgs {
        Tile?: any | null;
        Coords?: L.Point | null;
        Error?: any | null;

        constructor(init?: Partial<LeafletTileErrorEventArgsDto>) {
            super(init);
            if (init) {
                this.Tile = init.Tile ?? null;
                this.Coords = init.Coords ?? null;
                this.Error = init.Error ?? null;
            }
        }

        toDto(): LeafletTileErrorEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                Tile: this.Tile ?? null,
                Coords: this.Coords ?? null,
                Error: this.Error ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletTileErrorEventArgs {
            const dto: Partial<LeafletTileErrorEventArgsDto> = {
                Tile: ev?.tile ?? ev?.tile ?? null,
                Coords: ev?.coords ?? ev?.coord ?? null,
                Error: ev?.error ?? ev?.message ?? null,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;
            return new LeafletTileErrorEventArgs(dto);
        }
    }

    export class LeafletTileEventArgs extends LeafletEventArgs {
        Tile?: any | null;
        Coords?: L.Point | null;

        constructor(init?: Partial<LeafletTileEventArgsDto>) {
            super(init);
            if (init) {
                this.Tile = init.Tile ?? null;
                this.Coords = init.Coords ?? null;
            }
        }

        toDto(): LeafletTileEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                Tile: this.Tile ?? null,
                Coords: this.Coords ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletTileEventArgs {
            const dto: Partial<LeafletTileEventArgsDto> = {
                Tile: ev?.tile ?? ev?.tile ?? null,
                Coords: ev?.coords ?? ev?.coord ?? null,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;
            return new LeafletTileEventArgs(dto);
        }
    }

    export class LeafletTooltipEventArgs extends LeafletEventArgs {
        Tooltip?: L.Tooltip | null;

        constructor(init?: Partial<LeafletTooltipEventArgsDto>) {
            super(init);
            if (init) {
                this.Tooltip = init.Tooltip ?? null;
            }
        }

        toDto(): LeafletTooltipEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                Tooltip: this.Tooltip ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletTooltipEventArgs {
            const dto: Partial<LeafletTooltipEventArgsDto> = {
                Tooltip: ev?.tooltip ?? ev?.layer ?? ev?.target ?? null,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;
            return new LeafletTooltipEventArgs(dto);
        }
    }

    export class LeafletZoomAnimEventArgs extends LeafletEventArgs {
        Center?: L.LatLng | null;
        Zoom?: number | null;
        NoUpdate?: boolean | null;

        constructor(init?: Partial<LeafletZoomAnimEventArgsDto>) {
            super(init);
            if (init) {
                this.Center = init.Center ?? null;
                this.Zoom = init.Zoom ?? null;
                this.NoUpdate = init.NoUpdate ?? null;
            }
        }

        toDto(): LeafletZoomAnimEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                Center: this.Center ?? null,
                Zoom: this.Zoom ?? null,
                NoUpdate: this.NoUpdate ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletZoomAnimEventArgs {
            const center = ev?.center ?? (ev?.target && typeof ev.target.getCenter === 'function' ? ev.target.getCenter() : null);
            const zoom = (typeof ev?.zoom === 'number') ? ev.zoom : (typeof ev?.newZoom === 'number' ? ev.newZoom : null);
            const noUpdate = ('noUpdate' in (ev ?? {})) ? !!ev.noUpdate : null;

            const dto: Partial<LeafletZoomAnimEventArgsDto> = {
                Center: center,
                Zoom: zoom,
                NoUpdate: noUpdate,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;

            return new LeafletZoomAnimEventArgs(dto);
        }
    }

    export class LeafletFeatureMouseEventArgs extends LeafletMouseEventArgs {
        LayerName?: string | null;
        Feature?: any | null;

        constructor(init?: Partial<LeafletFeatureMouseEventArgsDto>) {
            super(init);
            if (init) {
                this.LayerName = init.LayerName ?? null;
                this.Feature = init.Feature ?? null;
            }
        }

        toDto(): LeafletFeatureMouseEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                LayerName: this.LayerName ?? null,
                Feature: this.Feature ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletFeatureMouseEventArgs {
            const layerName = ev?.layerName ?? null;
            const feature = ev?.feature ?? null;

            const dto: Partial<LeafletFeatureMouseEventArgsDto> = {
                LayerName: layerName,
                Feature: feature,
                LatLng: ev?.latlng ?? null,
                LayerPoint: ev?.layerPoint ?? null,
                ContainerPoint: ev?.containerPoint ?? null,
                OriginalEvent: ev?.originalEvent ?? null,
                Type: ev?.type ?? null,
                // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
                Target: minimalLayerInfo(ev?.target) ?? null,
                SourceTarget: minimalLayerInfo(ev?.sourceTarget) ?? null,
                PropagatedFrom: minimalLayerInfo(ev?.propagatedFrom) ?? null
            } as any;

            return new LeafletFeatureMouseEventArgs(dto);
        }
    }

    export class LeafletTileFetchErrorEventArgs extends LeafletTileErrorEventArgs {
        Url?: string | null;
        z?: number | null
        x?: number | null;
        y?: number | null;

        constructor(init?: Partial<LeafletTileFetchErrorEventArgsDto>) {
            super(init);
            if (init) {
                this.Url = init.Url ?? null;
                this.z = init.z ?? null;
                this.x = init.x ?? null;
                this.y = init.y ?? null;
            }
        }

        toDto(): LeafletTileFetchErrorEventArgsDto {
            const base = super.toDto();
            return Object.assign({}, base, {
                Url: this.Url ?? null,
                z: this.z ?? null,
                x: this.x ?? null,
                y: this.y ?? null
            });
        }

        static fromLeaflet(ev: any): LeafletTileFetchErrorEventArgs {
            const dto: Partial<LeafletTileFetchErrorEventArgsDto> = {
                Url: ev?.url ?? null,
                z: (typeof ev?.z === 'number') ? ev.z : null,
                x: (typeof ev?.x === 'number') ? ev.x : null,
                y: (typeof ev?.y === 'number') ? ev.y : null,
                Tile: ev?.tile ?? ev?.tile ?? null,
                Coords: (typeof ev?.coords === 'object') ? ev.coords : null,
                Error: ev?.error ?? null
            };
            return new LeafletTileFetchErrorEventArgs(dto);
        }
    }
}

export default LeafletEvents;
