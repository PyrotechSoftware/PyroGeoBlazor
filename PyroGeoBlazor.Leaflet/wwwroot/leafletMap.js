var a;
((y) => {
  function t(h) {
    if (!h) return null;
    const e = {};
    return "_leaflet_id" in h && (e.LeafletId = h._leaflet_id), h && h.constructor && h.constructor.name && (e.Type = h.constructor.name), e;
  }
  y.minimalLayerInfo = t;
  class o {
    constructor(e) {
      e && (this.Type = e.Type ?? null, this.Target = e.Target ?? null, this.SourceTarget = e.SourceTarget ?? null, this.PropagatedFrom = e.PropagatedFrom ?? null);
    }
    toDto() {
      return {
        Type: this.Type ?? null,
        Target: this.Target ?? null,
        SourceTarget: this.SourceTarget ?? null,
        PropagatedFrom: this.PropagatedFrom ?? null
      };
    }
    static fromLeaflet(e) {
      const u = {
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new o(u);
    }
  }
  y.LeafletEventArgs = o;
  class c extends o {
    constructor(e) {
      super(e), e && (this.LatLng = e.LatLng ?? null, this.LayerPoint = e.LayerPoint ?? null, this.ContainerPoint = e.ContainerPoint ?? null, this.OriginalEvent = e.OriginalEvent ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        LatLng: this.LatLng ?? null,
        LayerPoint: this.LayerPoint ?? null,
        ContainerPoint: this.ContainerPoint ?? null,
        OriginalEvent: this.OriginalEvent ?? null
      });
    }
    static fromLeaflet(e) {
      const u = {
        LatLng: (e == null ? void 0 : e.latlng) ?? null,
        LayerPoint: (e == null ? void 0 : e.layerPoint) ?? null,
        ContainerPoint: (e == null ? void 0 : e.containerPoint) ?? null,
        OriginalEvent: (e == null ? void 0 : e.originalEvent) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new c(u);
    }
  }
  y.LeafletMouseEventArgs = c;
  class i extends o {
    constructor(e) {
      super(e), e && (this.OldSize = e.OldSize ?? null, this.NewSize = e.NewSize ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        OldSize: this.OldSize ?? null,
        NewSize: this.NewSize ?? null
      });
    }
    static fromLeaflet(e) {
      const u = {
        OldSize: (e == null ? void 0 : e.oldSize) ?? null,
        NewSize: (e == null ? void 0 : e.newSize) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new i(u);
    }
  }
  y.LeafletResizeEventArgs = i;
  class l extends o {
    constructor(e) {
      super(e), e && (this.Popup = e.Popup ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        Popup: this.Popup ?? null
      });
    }
    static fromLeaflet(e) {
      const u = {
        Popup: (e == null ? void 0 : e.popup) ?? (e == null ? void 0 : e.layer) ?? (e == null ? void 0 : e.target) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new l(u);
    }
  }
  y.LeafletPopupEventArgs = l;
  class n extends o {
    constructor(e) {
      super(e), e && (this.Distance = e.Distance ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        Distance: this.Distance ?? null
      });
    }
    static fromLeaflet(e) {
      const u = {
        Distance: typeof (e == null ? void 0 : e.distance) == "number" ? e.distance : null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new n(u);
    }
  }
  y.LeafletDragEndEventArgs = n;
  class r extends o {
    constructor(e) {
      super(e), e && (this.Message = e.Message ?? null, this.Code = e.Code ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        Message: this.Message ?? null,
        Code: this.Code ?? null
      });
    }
    static fromLeaflet(e) {
      var k;
      const u = (e == null ? void 0 : e.message) ?? ((k = e == null ? void 0 : e.error) == null ? void 0 : k.message) ?? null, f = typeof (e == null ? void 0 : e.code) == "number" ? e.code : typeof (e == null ? void 0 : e.status) == "number" ? e.status : null, g = {
        Message: u,
        Code: f,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new r(g);
    }
  }
  y.LeafletErrorEventArgs = r;
  class d extends o {
    constructor(e) {
      super(e), e && (this.Layer = e.Layer ?? null, this.Properties = e.Properties ?? null, this.GeometryType = e.GeometryType ?? null, this.Id = e.Id ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        Layer: this.Layer ?? null,
        Properties: this.Properties ?? null,
        GeometryType: this.GeometryType ?? null,
        Id: this.Id ?? null
      });
    }
    static fromLeaflet(e) {
      var f, g, k, A, F, C, G;
      const u = {
        Layer: t(e == null ? void 0 : e.layer) ?? t(e == null ? void 0 : e.target) ?? null,
        Properties: (e == null ? void 0 : e.properties) ?? ((g = (f = e == null ? void 0 : e.layer) == null ? void 0 : f.feature) == null ? void 0 : g.properties) ?? null,
        GeometryType: (e == null ? void 0 : e.geometryType) ?? ((F = (A = (k = e == null ? void 0 : e.layer) == null ? void 0 : k.feature) == null ? void 0 : A.geometry) == null ? void 0 : F.type) ?? null,
        Id: (e == null ? void 0 : e.id) ?? ((G = (C = e == null ? void 0 : e.layer) == null ? void 0 : C.feature) == null ? void 0 : G.id) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new d(u);
    }
  }
  y.LeafletGeoJsonEventArgs = d;
  class O extends o {
    constructor(e) {
      super(e), e && (this.OriginalEvent = e.OriginalEvent ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        OriginalEvent: this.OriginalEvent ?? null
      });
    }
    static fromLeaflet(e) {
      const u = {
        OriginalEvent: (e == null ? void 0 : e.originalEvent) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new O(u);
    }
  }
  y.LeafletKeyboardEventArgs = O;
  class w extends o {
    constructor(e) {
      super(e), e && (this.Layer = e.Layer ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        Layer: this.Layer ?? null
      });
    }
    static fromLeaflet(e) {
      const u = {
        Layer: t(e == null ? void 0 : e.layer) ?? t(e == null ? void 0 : e.target) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new w(u);
    }
  }
  y.LeafletLayerEventArgs = w;
  class T extends o {
    constructor(e) {
      super(e), e && (this.Layer = e.Layer ?? null, this.Name = e.Name ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        Layer: this.Layer ?? null,
        Name: this.Name ?? null
      });
    }
    static fromLeaflet(e) {
      var f, g;
      const u = {
        Layer: t(e == null ? void 0 : e.layer) ?? t(e == null ? void 0 : e.target) ?? null,
        Name: (e == null ? void 0 : e.name) ?? ((g = (f = e == null ? void 0 : e.layer) == null ? void 0 : f.options) == null ? void 0 : g.name) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new T(u);
    }
  }
  y.LeafletLayersControlEventArgs = T;
  class _ extends o {
    constructor(e) {
      super(e), e && (this.LatLng = e.LatLng ?? null, this.Bounds = e.Bounds ?? null, this.Accuracy = e.Accuracy ?? null, this.Altitude = e.Altitude ?? null, this.AltitudeAccuracy = e.AltitudeAccuracy ?? null, this.Heading = e.Heading ?? null, this.Speed = e.Speed ?? null, this.Timestamp = e.Timestamp ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
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
    static fromLeaflet(e) {
      let u = null;
      if (e != null && e.bounds && typeof e.bounds.getNorthEast == "function") {
        const g = e.bounds.getNorthEast(), k = e.bounds.getSouthWest();
        u = { NorthEast: g, SouthWest: k };
      }
      const f = {
        LatLng: e.latlng ?? null,
        Bounds: u ?? null,
        Accuracy: "accuracy" in (e ?? {}) ? e.accuracy : null,
        Altitude: "altitude" in (e ?? {}) ? e.altitude : null,
        AltitudeAccuracy: "altitudeAccuracy" in (e ?? {}) ? e.altitudeAccuracy : null,
        Heading: "heading" in (e ?? {}) ? e.heading : null,
        Speed: "speed" in (e ?? {}) ? e.speed : null,
        Timestamp: "timestamp" in (e ?? {}) ? e.timestamp : null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new _(f);
    }
  }
  y.LeafletLocationEventArgs = _;
  class P extends o {
    constructor(e) {
      super(e), e && (this.Tile = e.Tile ?? null, this.Coords = e.Coords ?? null, this.Error = e.Error ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        Tile: this.Tile ?? null,
        Coords: this.Coords ?? null,
        Error: this.Error ?? null
      });
    }
    static fromLeaflet(e) {
      const u = {
        Tile: (e == null ? void 0 : e.tile) ?? (e == null ? void 0 : e.tile) ?? null,
        Coords: (e == null ? void 0 : e.coords) ?? (e == null ? void 0 : e.coord) ?? null,
        Error: (e == null ? void 0 : e.error) ?? (e == null ? void 0 : e.message) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new P(u);
    }
  }
  y.LeafletTileErrorEventArgs = P;
  class J extends o {
    constructor(e) {
      super(e), e && (this.Tile = e.Tile ?? null, this.Coords = e.Coords ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        Tile: this.Tile ?? null,
        Coords: this.Coords ?? null
      });
    }
    static fromLeaflet(e) {
      const u = {
        Tile: (e == null ? void 0 : e.tile) ?? (e == null ? void 0 : e.tile) ?? null,
        Coords: (e == null ? void 0 : e.coords) ?? (e == null ? void 0 : e.coord) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new J(u);
    }
  }
  y.LeafletTileEventArgs = J;
  class S extends o {
    constructor(e) {
      super(e), e && (this.Tooltip = e.Tooltip ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        Tooltip: this.Tooltip ?? null
      });
    }
    static fromLeaflet(e) {
      const u = {
        Tooltip: (e == null ? void 0 : e.tooltip) ?? (e == null ? void 0 : e.layer) ?? (e == null ? void 0 : e.target) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new S(u);
    }
  }
  y.LeafletTooltipEventArgs = S;
  class s extends o {
    constructor(e) {
      super(e), e && (this.Center = e.Center ?? null, this.Zoom = e.Zoom ?? null, this.NoUpdate = e.NoUpdate ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        Center: this.Center ?? null,
        Zoom: this.Zoom ?? null,
        NoUpdate: this.NoUpdate ?? null
      });
    }
    static fromLeaflet(e) {
      const u = (e == null ? void 0 : e.center) ?? (e != null && e.target && typeof e.target.getCenter == "function" ? e.target.getCenter() : null), f = typeof (e == null ? void 0 : e.zoom) == "number" ? e.zoom : typeof (e == null ? void 0 : e.newZoom) == "number" ? e.newZoom : null, g = "noUpdate" in (e ?? {}) ? !!e.noUpdate : null, k = {
        Center: u,
        Zoom: f,
        NoUpdate: g,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new s(k);
    }
  }
  y.LeafletZoomAnimEventArgs = s;
  class N extends c {
    constructor(e) {
      super(e), e && (this.LayerName = e.LayerName ?? null, this.Feature = e.Feature ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        LayerName: this.LayerName ?? null,
        Feature: this.Feature ?? null
      });
    }
    static fromLeaflet(e) {
      const u = (e == null ? void 0 : e.layerName) ?? null, f = (e == null ? void 0 : e.feature) ?? null, g = {
        LayerName: u,
        Feature: f,
        LatLng: (e == null ? void 0 : e.latlng) ?? null,
        LayerPoint: (e == null ? void 0 : e.layerPoint) ?? null,
        ContainerPoint: (e == null ? void 0 : e.containerPoint) ?? null,
        OriginalEvent: (e == null ? void 0 : e.originalEvent) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new N(g);
    }
  }
  y.LeafletFeatureMouseEventArgs = N;
  class v extends P {
    constructor(e) {
      super(e), e && (this.Url = e.Url ?? null, this.z = e.z ?? null, this.x = e.x ?? null, this.y = e.y ?? null);
    }
    toDto() {
      const e = super.toDto();
      return Object.assign({}, e, {
        Url: this.Url ?? null,
        z: this.z ?? null,
        x: this.x ?? null,
        y: this.y ?? null
      });
    }
    static fromLeaflet(e) {
      const u = {
        Url: (e == null ? void 0 : e.url) ?? null,
        z: typeof (e == null ? void 0 : e.z) == "number" ? e.z : null,
        x: typeof (e == null ? void 0 : e.x) == "number" ? e.x : null,
        y: typeof (e == null ? void 0 : e.y) == "number" ? e.y : null,
        Tile: (e == null ? void 0 : e.tile) ?? (e == null ? void 0 : e.tile) ?? null,
        Coords: typeof (e == null ? void 0 : e.coords) == "object" ? e.coords : null,
        Error: (e == null ? void 0 : e.error) ?? null
      };
      return new v(u);
    }
  }
  y.LeafletTileFetchErrorEventArgs = v;
})(a || (a = {}));
const se = {
  createMap(y, t, o) {
    const c = L.map(y, t);
    if (o && o.dotNetRef && o.events) {
      const l = Object.keys(o.events);
      l.indexOf("resize") > -1 && c.on("resize", function(n) {
        var r = o.events.resize;
        let d = a.LeafletResizeEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, d);
      }), l.indexOf("viewreset") > -1 && c.on("viewreset", function(n) {
        var r = o.events.viewreset;
        let d = a.LeafletEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, d);
      }), l.indexOf("zoomlevelschange") > -1 && c.on("zoomlevelschange", function(n) {
        var r = o.events.zoomlevelschange;
        let d = a.LeafletEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, d);
      }), l.indexOf("zoomend") > -1 && c.on("zoomend", function(n) {
        var r = o.events.zoomend;
        let d = a.LeafletEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, d);
      }), l.indexOf("moveend") > -1 && c.on("moveend", function(n) {
        var r = o.events.moveend;
        let d = a.LeafletEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, d);
      }), l.indexOf("click") > -1 && c.on("click", function(n) {
        var r = o.events.click;
        let d = a.LeafletMouseEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, d);
      }), l.indexOf("dblclick") > -1 && c.on("dblclick", function(n) {
        var r = o.events.dblclick;
        let d = a.LeafletMouseEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, d);
      }), l.indexOf("contextmenu") > -1 && c.on("contextmenu", function(n) {
        var r = o.events.contextmenu;
        let d = a.LeafletMouseEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, d);
      }), l.indexOf("popupopen") > -1 && c.on("popupopen", function(n) {
        var r = o.events.popupopen;
        let d = a.LeafletPopupEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, d);
      }), l.indexOf("popupclose") > -1 && c.on("popupclose", function(n) {
        var r = o.events.popupclose;
        let d = a.LeafletPopupEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, d);
      }), l.indexOf("locationerror") > -1 && c.on("locationerror", function(n) {
        var r = o.events.locationerror;
        let d = a.LeafletErrorEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, d);
      }), l.indexOf("locationfound") > -1 && c.on("locationfound", function(n) {
        var r = o.events.locationfound;
        let d = a.LeafletLocationEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, d);
      });
    }
    const i = Object.create(c);
    return i.getBounds = function() {
      const l = c.getBounds(), n = l.getSouthWest(), r = l.getNorthEast();
      return {
        SouthWest: {
          Lat: n.lat,
          Lng: n.lng
        },
        NorthEast: {
          Lat: r.lat,
          Lng: r.lng
        }
      };
    }, i;
  }
}, ue = {
  addTo(y, t, o) {
    if (o && o.dotNetRef && o.events) {
      const c = Object.keys(o.events);
      c.indexOf("add") > -1 && y.on("add", function(i) {
        var l = o.events.add;
        try {
          let n = a.LeafletEventArgs.fromLeaflet(i).toDto();
          o.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking add handler:", n);
        }
      }), c.indexOf("remove") > -1 && y.on("remove", function(i) {
        var l = o.events.remove;
        try {
          let n = a.LeafletEventArgs.fromLeaflet(i).toDto();
          o.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking remove handler:", n);
        }
      }), c.indexOf("popupopen") > -1 && y.on("popupopen", function(i) {
        var l = o.events.popupopen;
        try {
          let n = a.LeafletPopupEventArgs.fromLeaflet(i).toDto();
          o.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking popupopen handler:", n);
        }
      }), c.indexOf("popupclose") > -1 && y.on("popupclose", function(i) {
        var l = o.events.popupclose;
        try {
          let n = a.LeafletPopupEventArgs.fromLeaflet(i).toDto();
          o.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking popupclose handler:", n);
        }
      }), c.indexOf("tooltipopen") > -1 && y.on("tooltipopen", function(i) {
        var l = o.events.tooltipopen;
        try {
          let n = a.LeafletTooltipEventArgs.fromLeaflet(i).toDto();
          o.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tooltipopen handler:", n);
        }
      }), c.indexOf("tooltipclose") > -1 && y.on("tooltipclose", function(i) {
        var l = o.events.tooltipclose;
        try {
          let n = a.LeafletTooltipEventArgs.fromLeaflet(i).toDto();
          o.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tooltipclose handler:", n);
        }
      });
    }
    y.addTo(t);
  },
  remove(y) {
    y.remove();
  }
}, de = {
  createGridLayer(y, t) {
    const o = L.gridLayer();
    if (t && t.dotNetRef && t.events) {
      const c = Object.keys(t.events);
      c.indexOf("loading") > -1 && o.on("loading", function(i) {
        var l = t.events.loading;
        try {
          let n = a.LeafletEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking loading handler:", n);
        }
      }), c.indexOf("tileunload") > -1 && o.on("tileunload", function(i) {
        var l = t.events.tileunload;
        try {
          let n = a.LeafletTileEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tileunload handler:", n);
        }
      }), c.indexOf("tileloadstart") > -1 && o.on("tileloadstart", function(i) {
        var l = t.events.tileloadstart;
        try {
          let n = a.LeafletTileEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tileloadstart handler:", n);
        }
      }), c.indexOf("tileerror") > -1 && o.on("tileerror", function(i) {
        var l = t.events.tileerror;
        try {
          let n = a.LeafletTileErrorEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tileerror handler:", n);
        }
      }), c.indexOf("tileload") > -1 && o.on("tileload", function(i) {
        var l = t.events.tileload;
        try {
          let n = a.LeafletTileEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tileload handler:", n);
        }
      }), c.indexOf("load") > -1 && o.on("load", function(i) {
        var l = t.events.load;
        try {
          let n = a.LeafletEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking load handler:", n);
        }
      }), c.indexOf("add") > -1 && o.on("add", function(i) {
        var l = t.events.add;
        try {
          let n = a.LeafletEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking add handler:", n);
        }
      }), c.indexOf("remove") > -1 && o.on("remove", function(i) {
        var l = t.events.remove;
        try {
          let n = a.LeafletEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking remove handler:", n);
        }
      }), c.indexOf("popupopen") > -1 && o.on("popupopen", function(i) {
        var l = t.events.popupopen;
        try {
          let n = a.LeafletPopupEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking popupopen handler:", n);
        }
      }), c.indexOf("popupclose") > -1 && o.on("popupclose", function(i) {
        var l = t.events.popupclose;
        try {
          let n = a.LeafletPopupEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking popupclose handler:", n);
        }
      }), c.indexOf("tooltipopen") > -1 && o.on("tooltipopen", function(i) {
        var l = t.events.tooltipopen;
        try {
          let n = a.LeafletTooltipEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tooltipopen handler:", n);
        }
      }), c.indexOf("tooltipclose") > -1 && o.on("tooltipclose", function(i) {
        var l = t.events.tooltipclose;
        try {
          let n = a.LeafletTooltipEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tooltipclose handler:", n);
        }
      });
    }
    return o;
  }
}, ye = {
  createTileLayer(y, t, o) {
    const c = L.tileLayer(y, t);
    if (o && o.dotNetRef && o.events) {
      const i = Object.keys(o.events);
      i.indexOf("tileabort") > -1 && c.on("tileabort", function(l) {
        var n = o.events.tileabort;
        try {
          let r = a.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileabort handler:", r);
        }
      }), i.indexOf("loading") > -1 && c.on("loading", function(l) {
        var n = o.events.loading;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking loading handler:", r);
        }
      }), i.indexOf("tileunload") > -1 && c.on("tileunload", function(l) {
        var n = o.events.tileunload;
        try {
          let r = a.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileunload handler:", r);
        }
      }), i.indexOf("tileloadstart") > -1 && c.on("tileloadstart", function(l) {
        var n = o.events.tileloadstart;
        try {
          let r = a.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileloadstart handler:", r);
        }
      }), i.indexOf("tileerror") > -1 && c.on("tileerror", function(l) {
        var n = o.events.tileerror;
        try {
          let r = a.LeafletTileErrorEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileerror handler:", r);
        }
      }), i.indexOf("tileload") > -1 && c.on("tileload", function(l) {
        var n = o.events.tileload;
        try {
          let r = a.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileload handler:", r);
        }
      }), i.indexOf("load") > -1 && c.on("load", function(l) {
        var n = o.events.load;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking load handler:", r);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking add handler:", r);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking remove handler:", r);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          let r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupopen handler:", r);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          let r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupclose handler:", r);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          let r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipopen handler:", r);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          let r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipclose handler:", r);
        }
      });
    }
    return c;
  }
}, me = {
  createWmsTileLayer(y, t, o) {
    const c = L.tileLayer.wms(y, t);
    if (o && o.dotNetRef && o.events) {
      const i = Object.keys(o.events);
      i.indexOf("tileabort") > -1 && c.on("tileabort", function(l) {
        var n = o.events.tileabort;
        try {
          let r = a.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileabort handler:", r);
        }
      }), i.indexOf("loading") > -1 && c.on("loading", function(l) {
        var n = o.events.loading;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking loading handler:", r);
        }
      }), i.indexOf("tileunload") > -1 && c.on("tileunload", function(l) {
        var n = o.events.tileunload;
        try {
          let r = a.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileunload handler:", r);
        }
      }), i.indexOf("tileloadstart") > -1 && c.on("tileloadstart", function(l) {
        var n = o.events.tileloadstart;
        try {
          let r = a.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileloadstart handler:", r);
        }
      }), i.indexOf("tileerror") > -1 && c.on("tileerror", function(l) {
        var n = o.events.tileerror;
        try {
          let r = a.LeafletTileErrorEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileerror handler:", r);
        }
      }), i.indexOf("tileload") > -1 && c.on("tileload", function(l) {
        var n = o.events.tileload;
        try {
          let r = a.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileload handler:", r);
        }
      }), i.indexOf("load") > -1 && c.on("load", function(l) {
        var n = o.events.load;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking load handler:", r);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking add handler:", r);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking remove handler:", r);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          let r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupopen handler:", r);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          let r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupclose handler:", r);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          let r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipopen handler:", r);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          let r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipclose handler:", r);
        }
      });
    }
    return c;
  }
}, K = {
  getRendererFactory(y) {
    if (!y)
      return;
    const t = y.toLowerCase();
    if (t === "canvas") {
      const o = L.Canvas;
      if (o && typeof o.tile == "function")
        return o.tile;
      console.warn("L.Canvas.tile is not available. Make sure Leaflet.VectorGrid plugin is loaded correctly.");
    } else if (t === "svg") {
      const o = L.SVG;
      if (o && typeof o.tile == "function")
        return o.tile;
      console.warn("L.SVG.tile is not available. Make sure Leaflet.VectorGrid plugin is loaded correctly.");
    }
  },
  setupFeatureSelection(y, t, o) {
    const c = {
      color: "#368ce1",
      weight: 3,
      fillColor: "#368ce1",
      fillOpacity: 0.3,
      opacity: 1
    }, i = {
      color: "red",
      weight: 2,
      opacity: 1
    }, l = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), O = (t == null ? void 0 : t.selectedFeatureStyle) ?? c, w = (S) => {
      if (S && S.setStyle) {
        const s = {};
        O.color && (s.color = O.color), O.weight !== void 0 && (s.weight = O.weight), O.opacity !== void 0 && (s.opacity = O.opacity), O.fillColor && (s.fillColor = O.fillColor), O.fillOpacity !== void 0 && (s.fillOpacity = O.fillOpacity), O.fill !== void 0 && (s.fill = O.fill), O.stroke !== void 0 && (s.stroke = O.stroke), O.dashArray && (s.dashArray = O.dashArray), O.lineCap && (s.lineCap = O.lineCap), O.lineJoin && (s.lineJoin = O.lineJoin), S.setStyle(s);
      }
    }, T = (S) => {
      var s;
      S && S.setStyle && ((s = S.options) != null && s.originalStyle) && S.setStyle(S.options.originalStyle);
    }, _ = (S) => (S == null ? void 0 : S.id) ?? (S == null ? void 0 : S.ID) ?? (S == null ? void 0 : S.fid) ?? (S == null ? void 0 : S.FID) ?? (S == null ? void 0 : S.objectid) ?? (S == null ? void 0 : S.OBJECTID) ?? JSON.stringify(S);
    y.on("click", function(S) {
      if (S.layer && S.layer.properties) {
        const s = _(S.layer.properties);
        d.has(s) || d.set(s, []);
        const N = d.get(s);
        N.includes(S.layer) || N.push(S.layer);
      }
    });
    const P = (S) => {
      const s = d.get(S) || [];
      return s.forEach((N) => {
        N.options.originalStyle || (N.options.originalStyle = {
          fillColor: N.options.fillColor,
          color: N.options.color,
          weight: N.options.weight,
          fillOpacity: N.options.fillOpacity,
          fill: N.options.fill
        }), w(N);
      }), s;
    }, J = (S) => {
      const s = n.get(S);
      s && s.forEach((N) => T(N));
    };
    if ((t == null ? void 0 : t.enableFeatureSelection) !== !1 && y.on("click", function(S) {
      var s, N;
      if (S.layer && S.layer.properties) {
        const v = y._pyroOptions || t;
        if ((v == null ? void 0 : v.enableFeatureSelection) === !1)
          return;
        const h = _(S.layer.properties), e = {
          id: h,
          type: ((s = S.layer.feature) == null ? void 0 : s.type) ?? "Feature",
          geometry: (N = S.layer.feature) == null ? void 0 : N.geometry,
          properties: S.layer.properties
        };
        if (l.has(h)) {
          const f = n.get(h);
          if (J(h), l.delete(h), n.delete(h), f && f.some((k) => r.has(k))) {
            const k = (v == null ? void 0 : v.hoverStyle) || i;
            f.forEach((A) => {
              var F, C, G, I, j;
              if (A.setStyle) {
                const X = { ...{
                  color: ((F = A.options.originalStyle) == null ? void 0 : F.color) || A.options.color,
                  weight: ((C = A.options.originalStyle) == null ? void 0 : C.weight) || A.options.weight,
                  opacity: ((G = A.options.originalStyle) == null ? void 0 : G.opacity) || A.options.opacity,
                  fillColor: ((I = A.options.originalStyle) == null ? void 0 : I.fillColor) || A.options.fillColor,
                  fillOpacity: ((j = A.options.originalStyle) == null ? void 0 : j.fillOpacity) || A.options.fillOpacity
                }, ...k };
                A.setStyle(X);
              }
            });
          }
          o != null && o.dotNetRef && o.events.featureunselected && o.dotNetRef.invokeMethodAsync(
            o.events.featureunselected,
            {
              feature: e,
              latlng: S.latlng,
              layerPoint: S.layerPoint,
              containerPoint: S.containerPoint
            }
          );
        } else {
          (v == null ? void 0 : v.multipleFeatureSelection) === !0 || (l.forEach((k, A) => J(A)), l.clear(), n.clear());
          const g = P(h);
          g.forEach((k) => {
            k.bringToFront && k.bringToFront();
          }), l.set(h, e), n.set(h, g), o != null && o.dotNetRef && o.events.featureselected && o.dotNetRef.invokeMethodAsync(
            o.events.featureselected,
            {
              feature: e,
              latlng: S.latlng,
              layerPoint: S.layerPoint,
              containerPoint: S.containerPoint
            }
          );
        }
        o != null && o.dotNetRef && o.events.featureclicked && o.dotNetRef.invokeMethodAsync(
          o.events.featureclicked,
          {
            feature: e,
            latlng: S.latlng,
            layerPoint: S.layerPoint,
            containerPoint: S.containerPoint
          }
        );
      }
    }), y.clearSelection = function() {
      l.forEach((S, s) => J(s)), l.clear(), n.clear(), r.forEach((S, s) => {
        s && s.setStyle && S && s.setStyle(S);
      }), r.clear();
    }, (t == null ? void 0 : t.interactive) === !0 && (t == null ? void 0 : t.enableHoverStyle) !== !1) {
      const S = (t == null ? void 0 : t.hoverStyle) || i;
      y.on("mouseover", function(s) {
        if (s.layer && s.layer.properties) {
          const N = _(s.layer.properties);
          d.has(N) || d.set(N, []);
          const v = d.get(N);
          v.includes(s.layer) || v.push(s.layer), l.has(N) || (d.get(N) || []).forEach((e) => {
            if (e.bringToFront && e.bringToFront(), !r.has(e)) {
              r.set(e, {
                color: e.options.color,
                weight: e.options.weight,
                opacity: e.options.opacity,
                fillColor: e.options.fillColor,
                fillOpacity: e.options.fillOpacity
              });
              const f = { ...{
                color: e.options.color,
                weight: e.options.weight,
                opacity: e.options.opacity,
                fillColor: e.options.fillColor,
                fillOpacity: e.options.fillOpacity
              }, ...S };
              e.setStyle && e.setStyle(f);
            }
          });
        }
      }), y.on("mouseout", function(s) {
        if (s.layer && s.layer.properties) {
          const N = _(s.layer.properties);
          (d.get(N) || []).forEach((h) => {
            if (r.has(h)) {
              const e = r.get(h);
              l.has(N) ? w(h) : e && h.setStyle && h.setStyle(e), r.delete(h);
            }
          });
        }
      });
    }
  },
  attachGridLayerEvents(y, t) {
    if (!(t != null && t.dotNetRef) || !t.events)
      return;
    const o = Object.keys(t.events), c = {
      loading: { eventName: "loading", argType: "LeafletEventArgs" },
      tileunload: { eventName: "tileunload", argType: "LeafletTileEventArgs" },
      tileloadstart: { eventName: "tileloadstart", argType: "LeafletTileEventArgs" },
      tileerror: { eventName: "tileerror", argType: "LeafletTileErrorEventArgs" },
      tileload: { eventName: "tileload", argType: "LeafletTileEventArgs" },
      load: { eventName: "load", argType: "LeafletEventArgs" },
      add: { eventName: "add", argType: "LeafletEventArgs" },
      remove: { eventName: "remove", argType: "LeafletEventArgs" }
    };
    for (const i of o) {
      const l = c[i];
      l && y.on(l.eventName, function(n) {
        const r = t.events[i];
        try {
          const O = a[l.argType].fromLeaflet(n).toDto();
          t.dotNetRef.invokeMethodAsync(r, O);
        } catch (d) {
          console.error(`Error invoking ${l.eventName} handler:`, d);
        }
      });
    }
  },
  attachInteractiveEvents(y, t, o) {
    if (!(t != null && t.interactive) || !(o != null && o.dotNetRef) || !o.events)
      return;
    const c = Object.keys(o.events), i = {
      mouseover: "mouseover",
      mouseout: "mouseout",
      mousemove: "mousemove",
      dblclick: "dblclick",
      contextmenu: "contextmenu"
    };
    for (const [l, n] of Object.entries(i))
      c.indexOf(l) > -1 && y.on(n, function(r) {
        var O, w;
        const d = o.events[l];
        try {
          const T = {
            latlng: r.latlng ? { lat: r.latlng.lat, lng: r.latlng.lng } : null,
            layerPoint: r.layerPoint ? { x: r.layerPoint.x, y: r.layerPoint.y } : null,
            containerPoint: r.containerPoint ? { x: r.containerPoint.x, y: r.containerPoint.y } : null,
            feature: r.layer && r.layer.properties ? {
              id: r.layer.properties.id ?? r.layer.properties.ID ?? r.layer.properties.fid ?? r.layer.properties.FID,
              type: ((O = r.layer.feature) == null ? void 0 : O.type) ?? "Feature",
              geometry: (w = r.layer.feature) == null ? void 0 : w.geometry,
              properties: r.layer.properties
            } : null
          };
          o.dotNetRef.invokeMethodAsync(d, T);
        } catch (T) {
          console.error(`Error invoking ${l} handler:`, T);
        }
      });
  },
  setInteractive(y, t) {
    y.options && (y.options.interactive = t), y._vectorTiles && Object.values(y._vectorTiles).forEach((o) => {
      o && o._features && Object.values(o._features).forEach((c) => {
        c && (c.options.interactive = t);
      });
    }), y.redraw && y.redraw();
  },
  setEnableFeatureSelection(y, t) {
    y._pyroOptions && (y._pyroOptions.enableFeatureSelection = t), !t && y.clearSelection && y.clearSelection();
  },
  setMultipleFeatureSelection(y, t) {
    y._pyroOptions && (y._pyroOptions.multipleFeatureSelection = t), !t && y.clearSelection;
  }
}, ve = {
  createProtobufVectorTileLayer(y, t, o) {
    if (!L.vectorGrid || typeof L.vectorGrid.protobuf != "function")
      throw console.error("Leaflet.VectorGrid plugin is not loaded. Please include Leaflet.VectorGrid.bundled.js"), new Error("Leaflet.VectorGrid plugin is required but not loaded");
    t != null && t.layerName && (y = y.replace("{LayerName}", t.layerName));
    let c = t == null ? void 0 : t.vectorTileLayerStyles;
    if (c && typeof c == "object" && Object.keys(c).length > 0) {
      const r = {};
      for (const [w, T] of Object.entries(c))
        r[w] = function(_) {
          return T;
        };
      const d = Object.values(c)[0], O = Object.keys(c);
      for (const w of O) {
        const T = w.split(":").pop();
        T && !r[T] && (r[T] = function(_) {
          return d;
        });
      }
      c = r;
    } else (!c || Object.keys(c).length === 0) && (c = {
      "": function() {
        return {
          fill: !0,
          fillColor: "#3388ff",
          fillOpacity: 0.2,
          stroke: !0,
          color: "#3388ff",
          weight: 1,
          opacity: 1
        };
      }
    });
    const i = {
      interactive: (t == null ? void 0 : t.interactive) ?? !1,
      getFeatureId: t == null ? void 0 : t.getFeatureId,
      vectorTileLayerStyles: c,
      minZoom: (t == null ? void 0 : t.minZoom) ?? 0,
      maxZoom: t == null ? void 0 : t.maxZoom,
      maxNativeZoom: t == null ? void 0 : t.maxNativeZoom,
      minNativeZoom: t == null ? void 0 : t.minNativeZoom,
      tileSize: (t == null ? void 0 : t.tileSize) ?? 256,
      opacity: (t == null ? void 0 : t.opacity) ?? 1,
      updateWhenIdle: t == null ? void 0 : t.updateWhenIdle,
      updateWhenZooming: (t == null ? void 0 : t.updateWhenZooming) ?? !0,
      updateInterval: (t == null ? void 0 : t.updateInterval) ?? 200,
      zIndex: (t == null ? void 0 : t.zIndex) ?? 1,
      bounds: t == null ? void 0 : t.bounds,
      noWrap: (t == null ? void 0 : t.noWrap) ?? !1,
      pane: (t == null ? void 0 : t.pane) ?? "tilePane",
      className: (t == null ? void 0 : t.className) ?? "",
      keepBuffer: (t == null ? void 0 : t.keepBuffer) ?? 2,
      attribution: (t == null ? void 0 : t.attribution) ?? ""
    };
    (t == null ? void 0 : t.subdomains) !== void 0 && t.subdomains !== null && (i.subdomains = t.subdomains);
    const l = K.getRendererFactory(t == null ? void 0 : t.rendererFactory);
    l !== void 0 && (i.rendererFactory = l);
    const n = L.vectorGrid.protobuf(y, i);
    return n._pyroOptions = {
      interactive: (t == null ? void 0 : t.interactive) ?? !1,
      enableFeatureSelection: (t == null ? void 0 : t.enableFeatureSelection) !== !1,
      multipleFeatureSelection: (t == null ? void 0 : t.multipleFeatureSelection) === !0,
      enableHoverStyle: (t == null ? void 0 : t.enableHoverStyle) !== !1,
      selectedFeatureStyle: t == null ? void 0 : t.selectedFeatureStyle,
      hoverStyle: t == null ? void 0 : t.hoverStyle
    }, K.setupFeatureSelection(n, t, o), K.attachInteractiveEvents(n, t, o), K.attachGridLayerEvents(n, o), n.setInteractive = function(r) {
      K.setInteractive(n, r);
    }, n.setEnableFeatureSelection = function(r) {
      K.setEnableFeatureSelection(n, r);
    }, n.setMultipleFeatureSelection = function(r) {
      K.setMultipleFeatureSelection(n, r);
    }, n;
  }
}, ge = (y) => {
  if (!y)
    return;
  const t = y.toLowerCase();
  if (t === "canvas") {
    const o = L.Canvas;
    if (o && typeof o.tile == "function")
      return o.tile;
    console.warn("L.Canvas.tile is not available. Make sure Leaflet.VectorGrid plugin is loaded correctly.");
  } else if (t === "svg") {
    const o = L.SVG;
    if (o && typeof o.tile == "function")
      return o.tile;
    console.warn("L.SVG.tile is not available. Make sure Leaflet.VectorGrid plugin is loaded correctly.");
  }
}, he = {
  createSlicerVectorTileLayer(y, t, o) {
    if (!L.vectorGrid || typeof L.vectorGrid.slicer != "function")
      throw console.error("Leaflet.VectorGrid plugin is not loaded. Please include Leaflet.VectorGrid.bundled.js"), new Error("Leaflet.VectorGrid plugin is required but not loaded");
    let c = t == null ? void 0 : t.vectorTileLayerStyles;
    (!c || Object.keys(c).length === 0) && (c = function() {
      return {
        fill: !0,
        fillColor: "#3388ff",
        fillOpacity: 0.2,
        stroke: !0,
        color: "#3388ff",
        weight: 1,
        opacity: 1
      };
    });
    const i = {
      interactive: (t == null ? void 0 : t.interactive) ?? !1,
      getFeatureId: t == null ? void 0 : t.getFeatureId,
      vectorTileLayerStyles: c,
      minZoom: (t == null ? void 0 : t.minZoom) ?? 0,
      maxZoom: t == null ? void 0 : t.maxZoom,
      maxNativeZoom: t == null ? void 0 : t.maxNativeZoom,
      minNativeZoom: t == null ? void 0 : t.minNativeZoom,
      tileSize: (t == null ? void 0 : t.tileSize) ?? 256,
      opacity: (t == null ? void 0 : t.opacity) ?? 1,
      updateWhenIdle: t == null ? void 0 : t.updateWhenIdle,
      updateWhenZooming: (t == null ? void 0 : t.updateWhenZooming) ?? !0,
      updateInterval: (t == null ? void 0 : t.updateInterval) ?? 200,
      zIndex: (t == null ? void 0 : t.zIndex) ?? 1,
      bounds: t == null ? void 0 : t.bounds,
      noWrap: (t == null ? void 0 : t.noWrap) ?? !1,
      pane: (t == null ? void 0 : t.pane) ?? "tilePane",
      className: (t == null ? void 0 : t.className) ?? "",
      keepBuffer: (t == null ? void 0 : t.keepBuffer) ?? 2,
      attribution: (t == null ? void 0 : t.attribution) ?? ""
    }, l = ge(t == null ? void 0 : t.rendererFactory);
    l !== void 0 && (i.rendererFactory = l);
    const n = L.vectorGrid.slicer(y, i);
    n._pyroOptions = {
      interactive: (t == null ? void 0 : t.interactive) ?? !1,
      enableFeatureSelection: (t == null ? void 0 : t.enableFeatureSelection) !== !1,
      multipleFeatureSelection: (t == null ? void 0 : t.multipleFeatureSelection) === !0,
      enableHoverStyle: (t == null ? void 0 : t.enableHoverStyle) !== !1,
      selectedFeatureStyle: t == null ? void 0 : t.selectedFeatureStyle,
      hoverStyle: t == null ? void 0 : t.hoverStyle
    };
    const r = {
      color: "#368ce1",
      weight: 3,
      fillColor: "#368ce1",
      fillOpacity: 0.3,
      opacity: 1
    }, d = {
      color: "red",
      weight: 2,
      opacity: 1
    }, O = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map(), T = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), P = (t == null ? void 0 : t.selectedFeatureStyle) ?? r, J = (e) => {
      if (e && e.setStyle) {
        const u = {};
        P.color && (u.color = P.color), P.weight !== void 0 && (u.weight = P.weight), P.opacity !== void 0 && (u.opacity = P.opacity), P.fillColor && (u.fillColor = P.fillColor), P.fillOpacity !== void 0 && (u.fillOpacity = P.fillOpacity), P.fill !== void 0 && (u.fill = P.fill), P.stroke !== void 0 && (u.stroke = P.stroke), P.dashArray && (u.dashArray = P.dashArray), P.lineCap && (u.lineCap = P.lineCap), P.lineJoin && (u.lineJoin = P.lineJoin), e.setStyle(u);
      }
    }, S = (e) => {
      var u;
      e && e.setStyle && ((u = e.options) != null && u.originalStyle) && e.setStyle(e.options.originalStyle);
    }, s = (e) => (e == null ? void 0 : e.id) ?? (e == null ? void 0 : e.ID) ?? (e == null ? void 0 : e.fid) ?? (e == null ? void 0 : e.FID) ?? (e == null ? void 0 : e.objectid) ?? (e == null ? void 0 : e.OBJECTID) ?? JSON.stringify(e), N = (e) => {
      if (e && e.properties) {
        const u = s(e.properties);
        _.has(u) || _.set(u, []);
        const f = _.get(u);
        f.includes(e) || f.push(e);
      }
    }, v = (e) => {
      const u = _.get(e) || [];
      return u.forEach((f) => {
        f.options.originalStyle || (f.options.originalStyle = {
          fillColor: f.options.fillColor,
          color: f.options.color,
          weight: f.options.weight,
          fillOpacity: f.options.fillOpacity,
          fill: f.options.fill
        }), J(f);
      }), u;
    }, h = (e) => {
      const u = w.get(e);
      u && u.forEach((f) => S(f));
    };
    if ((t == null ? void 0 : t.enableFeatureSelection) !== !1 && n.on("click", function(e) {
      var u, f;
      if (e.layer && e.layer.properties) {
        const g = n._pyroOptions || t;
        if ((g == null ? void 0 : g.enableFeatureSelection) === !1)
          return;
        N(e.layer);
        const k = s(e.layer.properties), A = {
          id: k,
          type: ((u = e.layer.feature) == null ? void 0 : u.type) ?? "Feature",
          geometry: (f = e.layer.feature) == null ? void 0 : f.geometry,
          properties: e.layer.properties
        };
        if (O.has(k)) {
          const C = w.get(k);
          if (h(k), O.delete(k), w.delete(k), C && C.some((I) => T.has(I))) {
            const I = (g == null ? void 0 : g.hoverStyle) || d;
            C.forEach((j) => {
              var Q, X, p, te, m;
              if (j.setStyle) {
                const E = { ...{
                  color: ((Q = j.options.originalStyle) == null ? void 0 : Q.color) || j.options.color,
                  weight: ((X = j.options.originalStyle) == null ? void 0 : X.weight) || j.options.weight,
                  opacity: ((p = j.options.originalStyle) == null ? void 0 : p.opacity) || j.options.opacity,
                  fillColor: ((te = j.options.originalStyle) == null ? void 0 : te.fillColor) || j.options.fillColor,
                  fillOpacity: ((m = j.options.originalStyle) == null ? void 0 : m.fillOpacity) || j.options.fillOpacity
                }, ...I };
                j.setStyle(E);
              }
            });
          }
          o != null && o.dotNetRef && o.events.featureunselected && o.dotNetRef.invokeMethodAsync(
            o.events.featureunselected,
            {
              feature: A,
              latlng: e.latlng,
              layerPoint: e.layerPoint,
              containerPoint: e.containerPoint
            }
          );
        } else {
          (g == null ? void 0 : g.multipleFeatureSelection) === !0 || (O.forEach((I, j) => h(j)), O.clear(), w.clear());
          const G = v(k);
          G.forEach((I) => {
            I.bringToFront && I.bringToFront();
          }), O.set(k, A), w.set(k, G), o != null && o.dotNetRef && o.events.featureselected && o.dotNetRef.invokeMethodAsync(
            o.events.featureselected,
            {
              feature: A,
              latlng: e.latlng,
              layerPoint: e.layerPoint,
              containerPoint: e.containerPoint
            }
          );
        }
        o != null && o.dotNetRef && o.events.featureclicked && o.dotNetRef.invokeMethodAsync(
          o.events.featureclicked,
          {
            feature: A,
            latlng: e.latlng,
            layerPoint: e.layerPoint,
            containerPoint: e.containerPoint
          }
        );
      }
    }), n.clearSelection = function() {
      O.forEach((e, u) => h(u)), O.clear(), w.clear(), T.forEach((e, u) => {
        u && u.setStyle && e && u.setStyle(e);
      }), T.clear();
    }, (t == null ? void 0 : t.interactive) === !0 && (t == null ? void 0 : t.enableHoverStyle) !== !1) {
      const e = (t == null ? void 0 : t.hoverStyle) || d;
      n.on("mouseover", function(u) {
        if (u.layer && u.layer.properties) {
          N(u.layer);
          const f = s(u.layer.properties);
          O.has(f) || (_.get(f) || []).forEach((k) => {
            if (k.bringToFront && k.bringToFront(), !T.has(k)) {
              T.set(k, {
                color: k.options.color,
                weight: k.options.weight,
                opacity: k.options.opacity,
                fillColor: k.options.fillColor,
                fillOpacity: k.options.fillOpacity
              });
              const F = { ...{
                color: k.options.color,
                weight: k.options.weight,
                opacity: k.options.opacity,
                fillColor: k.options.fillColor,
                fillOpacity: k.options.fillOpacity
              }, ...e };
              k.setStyle && k.setStyle(F);
            }
          });
        }
      }), n.on("mouseout", function(u) {
        if (u.layer && u.layer.properties) {
          const f = s(u.layer.properties);
          (_.get(f) || []).forEach((k) => {
            if (T.has(k)) {
              const A = T.get(k);
              O.has(f) ? J(k) : A && k.setStyle && k.setStyle(A), T.delete(k);
            }
          });
        }
      });
    }
    if (o != null && o.dotNetRef && o.events) {
      const e = Object.keys(o.events), u = {
        loading: { eventName: "loading", argType: "LeafletEventArgs" },
        tileunload: { eventName: "tileunload", argType: "LeafletTileEventArgs" },
        tileloadstart: { eventName: "tileloadstart", argType: "LeafletTileEventArgs" },
        tileerror: { eventName: "tileerror", argType: "LeafletTileErrorEventArgs" },
        tileload: { eventName: "tileload", argType: "LeafletTileEventArgs" },
        load: { eventName: "load", argType: "LeafletEventArgs" },
        add: { eventName: "add", argType: "LeafletEventArgs" },
        remove: { eventName: "remove", argType: "LeafletEventArgs" }
      };
      for (const f of e) {
        const g = u[f];
        g && n.on(g.eventName, function(k) {
          const A = o.events[f];
          try {
            const C = a[g.argType].fromLeaflet(k).toDto();
            o.dotNetRef.invokeMethodAsync(A, C);
          } catch (F) {
            console.error(`Error invoking ${g.eventName} handler:`, F);
          }
        });
      }
      if (t != null && t.interactive) {
        const f = {
          mouseover: "mouseover",
          mouseout: "mouseout",
          mousemove: "mousemove",
          dblclick: "dblclick",
          contextmenu: "contextmenu"
        };
        for (const [g, k] of Object.entries(f))
          e.indexOf(g) > -1 && n.on(k, function(A) {
            var C, G;
            const F = o.events[g];
            try {
              const I = {
                latlng: A.latlng ? { lat: A.latlng.lat, lng: A.latlng.lng } : null,
                layerPoint: A.layerPoint ? { x: A.layerPoint.x, y: A.layerPoint.y } : null,
                containerPoint: A.containerPoint ? { x: A.containerPoint.x, y: A.containerPoint.y } : null,
                feature: A.layer && A.layer.properties ? {
                  id: A.layer.properties.id ?? A.layer.properties.ID ?? A.layer.properties.fid ?? A.layer.properties.FID,
                  type: ((C = A.layer.feature) == null ? void 0 : C.type) ?? "Feature",
                  geometry: (G = A.layer.feature) == null ? void 0 : G.geometry,
                  properties: A.layer.properties
                } : null
              };
              o.dotNetRef.invokeMethodAsync(F, I);
            } catch (I) {
              console.error(`Error invoking ${g} handler:`, I);
            }
          });
      }
    }
    return n.setInteractive = function(e) {
      n.options && (n.options.interactive = e), n._vectorTiles && Object.values(n._vectorTiles).forEach((u) => {
        u && u._features && Object.values(u._features).forEach((f) => {
          f && (f.options.interactive = e);
        });
      }), n.redraw && n.redraw();
    }, n.setEnableFeatureSelection = function(e) {
      n._pyroOptions && (n._pyroOptions.enableFeatureSelection = e), !e && n.clearSelection && n.clearSelection();
    }, n.setMultipleFeatureSelection = function(e) {
      n._pyroOptions && (n._pyroOptions.multipleFeatureSelection = e);
    }, n;
  }
}, Le = {
  createLayerGroup(y = [], t, o) {
    const c = L.layerGroup(y, t);
    if (o && o.dotNetRef && o.events) {
      const i = Object.keys(o.events);
      i.indexOf("click") > -1 && c.on("click", function(l) {
        var n = o.events.click;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking click handler:", r);
        }
      }), i.indexOf("dblclick") > -1 && c.on("dblclick", function(l) {
        var n = o.events.dblclick;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dblclick handler:", r);
        }
      }), i.indexOf("mousedown") > -1 && c.on("mousedown", function(l) {
        var n = o.events.mousedown;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mousedown handler:", r);
        }
      }), i.indexOf("mouseup") > -1 && c.on("mouseup", function(l) {
        var n = o.events.mouseup;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseup handler:", r);
        }
      }), i.indexOf("mouseover") > -1 && c.on("mouseover", function(l) {
        var n = o.events.mouseover;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseover handler:", r);
        }
      }), i.indexOf("mouseout") > -1 && c.on("mouseout", function(l) {
        var n = o.events.mouseout;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseout handler:", r);
        }
      }), i.indexOf("contextmenu") > -1 && c.on("contextmenu", function(l) {
        var n = o.events.contextmenu;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking contextmenu handler:", r);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking add handler:", r);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking remove handler:", r);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          let r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupopen handler:", r);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          let r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupclose handler:", r);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          let r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipopen handler:", r);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          let r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipclose handler:", r);
        }
      });
    }
    return c;
  }
}, ke = {
  createFeatureGroup(y = [], t, o) {
    const c = L.featureGroup(y, t);
    if (o && o.dotNetRef && o.events) {
      const i = Object.keys(o.events);
      i.indexOf("layeradd") > -1 && c.on("layeradd", function(l) {
        var n = o.events.layeradd;
        try {
          let r = a.LeafletLayerEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking layeradd handler:", r);
        }
      }), i.indexOf("layerremove") > -1 && c.on("layerremove", function(l) {
        var n = o.events.layerremove;
        try {
          let r = a.LeafletLayerEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking layerremove handler:", r);
        }
      }), i.indexOf("click") > -1 && c.on("click", function(l) {
        var n = o.events.click;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking click handler:", r);
        }
      }), i.indexOf("dblclick") > -1 && c.on("dblclick", function(l) {
        var n = o.events.dblclick;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dblclick handler:", r);
        }
      }), i.indexOf("mousedown") > -1 && c.on("mousedown", function(l) {
        var n = o.events.mousedown;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mousedown handler:", r);
        }
      }), i.indexOf("mouseup") > -1 && c.on("mouseup", function(l) {
        var n = o.events.mouseup;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseup handler:", r);
        }
      }), i.indexOf("mouseover") > -1 && c.on("mouseover", function(l) {
        var n = o.events.mouseover;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseover handler:", r);
        }
      }), i.indexOf("mouseout") > -1 && c.on("mouseout", function(l) {
        var n = o.events.mouseout;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseout handler:", r);
        }
      }), i.indexOf("contextmenu") > -1 && c.on("contextmenu", function(l) {
        var n = o.events.contextmenu;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking contextmenu handler:", r);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking add handler:", r);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking remove handler:", r);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          let r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupopen handler:", r);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          let r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupclose handler:", r);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          let r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipopen handler:", r);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          let r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipclose handler:", r);
        }
      }), i.indexOf("click") > -1 && c.on("click", function(l) {
        var n = o.events.click;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking click handler:", r);
        }
      }), i.indexOf("dblclick") > -1 && c.on("dblclick", function(l) {
        var n = o.events.dblclick;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dblclick handler:", r);
        }
      }), i.indexOf("mousedown") > -1 && c.on("mousedown", function(l) {
        var n = o.events.mousedown;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mousedown handler:", r);
        }
      }), i.indexOf("mouseup") > -1 && c.on("mouseup", function(l) {
        var n = o.events.mouseup;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseup handler:", r);
        }
      }), i.indexOf("mouseover") > -1 && c.on("mouseover", function(l) {
        var n = o.events.mouseover;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseover handler:", r);
        }
      }), i.indexOf("mouseout") > -1 && c.on("mouseout", function(l) {
        var n = o.events.mouseout;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseout handler:", r);
        }
      }), i.indexOf("contextmenu") > -1 && c.on("contextmenu", function(l) {
        var n = o.events.contextmenu;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking contextmenu handler:", r);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking add handler:", r);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking remove handler:", r);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          let r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupopen handler:", r);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          let r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupclose handler:", r);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          let r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipopen handler:", r);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          let r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipclose handler:", r);
        }
      });
    }
    return c;
  }
}, ae = {
  createGeoJsonLayer(y, t, o) {
    const c = {
      markersInheritOptions: (t == null ? void 0 : t.markersInheritOptions) ?? !1
    };
    if (t != null && t.interop && t.onEachFeatureEnabled && (c.onEachFeature = function(s, N) {
      const v = a.minimalLayerInfo(N);
      t.interop.invokeMethodAsync("OnEachFeature", s, v);
    }), t != null && t.interop && t.pointToLayerEnabled && (c.pointToLayer = function(s, N) {
      return t.interop.invokeMethodAsync("PointToLayer", s, N).then((v) => {
        console.log("PointToLayer result:", v);
      }), L.marker(N);
    }), t != null && t.interop && t.styleEnabled) {
      const s = /* @__PURE__ */ new Map();
      c.style = function(N) {
        return s.has(N) ? s.get(N) : {};
      }, c.styleCache = s;
    }
    t != null && t.interop && t.coordsToLatLngEnabled && (c.coordsToLatLng = function(s) {
      let N = L.latLng(s[1], s[0], s[2]);
      return t.interop.invokeMethodAsync("CoordsToLatLng", s).then((v) => {
        v && (N = L.latLng(v.lat, v.lng, v.alt));
      }), N;
    });
    const i = L.geoJSON(null, c), l = {
      color: "#3388ff",
      weight: 3,
      opacity: 1,
      fillOpacity: 0.5,
      fillColor: "#3388ff"
    }, n = {
      color: "red",
      weight: 2,
      opacity: 1
    };
    let r = null, d = null, O = (t == null ? void 0 : t.enableFeatureSelection) !== !1;
    const w = /* @__PURE__ */ new Map(), T = /* @__PURE__ */ new Map();
    function _(s, N = 5e4, v = !1) {
      if (!s)
        return s;
      try {
        const h = JSON.stringify(s);
        if (v && console.log(`Feature size: ${h.length} characters`), h.length <= N)
          return s;
        v && console.warn(`Feature is large (${h.length} chars), creating lightweight version`);
        const e = {
          type: s.type,
          id: s.id,
          properties: s.properties,
          geometry: s.geometry ? {
            type: s.geometry.type
            // Coordinates omitted to reduce size
          } : void 0
        };
        if (v) {
          const u = JSON.stringify(e).length;
          console.log(`Lightweight feature size: ${u} characters (reduced by ${h.length - u})`);
        }
        return e;
      } catch (h) {
        return console.error("Error creating callback feature:", h), s;
      }
    }
    i.createCallbackFeature = _;
    const P = i.addData.bind(i);
    i.addData = async function(s) {
      let N = s;
      if (t != null && t.interop && t.filterEnabled)
        try {
          t.debugLogging && console.log("Starting async filtering..."), N = await J(s, t.interop, t.debugLogging), t.debugLogging && console.log("Filtering complete, processed data:", N);
        } catch (e) {
          throw console.error("Error during filtering:", e), e;
        }
      if (t != null && t.interop && t.styleEnabled)
        try {
          t.debugLogging && console.log("Starting async styling..."), await S(N, t.interop, t.debugLogging), t.debugLogging && console.log("Styling complete");
        } catch (e) {
          throw console.error("Error during styling:", e), e;
        }
      const v = [], h = i.options.onEachFeature;
      return h && (t != null && t.interop) && t.onEachFeatureEnabled && (i.options.onEachFeature = function(e, u) {
        const f = a.minimalLayerInfo(u), g = t.interop.invokeMethodAsync("OnEachFeature", e, f);
        v.push(g);
      }), t != null && t.debugLogging && console.log("Calling Leaflet addData with:", N), P(N), h && (i.options.onEachFeature = h), v.length > 0 && await Promise.all(v), i;
    };
    async function J(s, N, v = !1) {
      var h, e, u;
      try {
        if (!s)
          return v && console.log("Filter: data is null or undefined, returning as-is"), s;
        if (v && console.log("Filtering GeoJSON data, type:", s.type, "data:", JSON.stringify(s).substring(0, 200)), s.type === "Feature") {
          v && console.log("Filtering single feature:", s.id || "no-id");
          const f = _(s, 5e4, v), g = await N.invokeMethodAsync("Filter", f, null);
          return v && console.log("Filter result for feature:", g), g ? s : { type: "FeatureCollection", features: [] };
        }
        if (s.type === "FeatureCollection") {
          if (!s.features)
            return v && console.log("FeatureCollection has no features property, returning empty collection"), { type: "FeatureCollection", features: [] };
          if (!Array.isArray(s.features))
            return console.error("FeatureCollection.features is not an array:", typeof s.features), { type: "FeatureCollection", features: [] };
          if (v && console.log(`Filtering FeatureCollection with ${s.features.length} features`), s.features.length === 0)
            return v && console.log("FeatureCollection is empty, returning as-is"), s;
          const f = [];
          for (let k = 0; k < s.features.length; k++) {
            const A = s.features[k];
            try {
              v && console.log(`Calling filter for feature ${k}:`, (A == null ? void 0 : A.id) || ((h = A == null ? void 0 : A.properties) == null ? void 0 : h.id) || "no-id", "type:", (e = A == null ? void 0 : A.geometry) == null ? void 0 : e.type);
              const F = _(A, 5e4, v), C = await N.invokeMethodAsync("Filter", F, null);
              v && console.log(`Filter result for feature ${k}:`, C), f.push(C === !0);
            } catch (F) {
              console.error(`Error filtering feature ${k}:`, F), console.error(`Feature ${k} type:`, (u = A == null ? void 0 : A.geometry) == null ? void 0 : u.type), console.error(`Feature ${k} id:`, A == null ? void 0 : A.id);
              try {
                const C = JSON.stringify(A);
                console.error(`Feature ${k} size:`, C.length, "chars"), console.error(`Feature ${k} preview:`, C.substring(0, 500));
              } catch {
                console.error("Could not stringify feature");
              }
              f.push(!0);
            }
          }
          v && console.log("All filter results:", f);
          const g = s.features.filter((k, A) => f[A]);
          return v && console.log(`Filtered from ${s.features.length} to ${g.length} features`), {
            ...s,
            features: g
          };
        }
        return v && console.log("Unknown or unsupported GeoJSON type:", s.type, "returning as-is"), s;
      } catch (f) {
        throw console.error("Exception in filterGeoJsonAsync:", f), console.error("Data that caused error:", s), f;
      }
    }
    async function S(s, N, v = !1) {
      var h, e;
      try {
        if (!s)
          return;
        const u = c.styleCache;
        if (!u) {
          v && console.log("No style cache found, skipping style precomputation");
          return;
        }
        if (v && console.log("Precomputing styles for GeoJSON data, type:", s.type), s.type === "Feature") {
          v && console.log("Computing style for single feature:", s.id || "no-id");
          const f = _(s, 5e4, v), g = await N.invokeMethodAsync("Style", f);
          u.set(s, g || {}), v && console.log("Style computed:", g);
          return;
        }
        if (s.type === "FeatureCollection" && Array.isArray(s.features)) {
          v && console.log(`Computing styles for ${s.features.length} features`);
          for (let f = 0; f < s.features.length; f++) {
            const g = s.features[f];
            try {
              v && console.log(`Computing style for feature ${f}:`, (g == null ? void 0 : g.id) || ((h = g == null ? void 0 : g.properties) == null ? void 0 : h.id) || "no-id");
              const k = _(g, 5e4, v), A = await N.invokeMethodAsync("Style", k);
              u.set(g, A || {}), v && console.log(`Style for feature ${f}:`, A);
            } catch (k) {
              console.error(`Error computing style for feature ${f}:`, k), console.error(`Feature ${f} type:`, (e = g == null ? void 0 : g.geometry) == null ? void 0 : e.type), console.error(`Feature ${f} id:`, g == null ? void 0 : g.id);
              try {
                const A = JSON.stringify(g);
                console.error(`Feature ${f} size:`, A.length, "chars"), console.error(`Feature ${f} preview:`, A.substring(0, 500));
              } catch {
                console.error("Could not stringify feature");
              }
              u.set(g, {});
            }
          }
          v && console.log(`Precomputed styles for ${u.size} features`);
        }
      } catch (u) {
        throw console.error("Exception in precomputeStylesAsync:", u), u;
      }
    }
    if (o && o.dotNetRef && o.events) {
      const s = Object.keys(o.events);
      s.indexOf("layeradd") > -1 && i.on("layeradd", function(v) {
        var h = o.events.layeradd;
        try {
          let e = a.LeafletLayerEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking layeradd handler:", e);
        }
      }), s.indexOf("layerremove") > -1 && i.on("layerremove", function(v) {
        var h = o.events.layerremove;
        try {
          let e = a.LeafletLayerEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking layerremove handler:", e);
        }
      }), s.indexOf("featureclicked") > -1 && i.on("click", function(v) {
        var e, u;
        var h = o.events.featureclicked;
        try {
          const f = ((e = v.layer) == null ? void 0 : e.feature) || ((u = v.propagatedFrom) == null ? void 0 : u.feature), g = v.layer || v.propagatedFrom;
          if (f && g) {
            const k = i.createCallbackFeature(f, 5e4, !1), A = {
              ...a.LeafletEventArgs.fromLeaflet(v).toDto(),
              layer: a.minimalLayerInfo(g),
              feature: k
            };
            o.dotNetRef.invokeMethodAsync(h, A);
          }
        } catch (f) {
          console.error("Error invoking featureclicked handler:", f);
        }
      });
      const N = function(v) {
        var h, e;
        try {
          if (!O)
            return;
          const u = ((h = v.layer) == null ? void 0 : h.feature) || ((e = v.propagatedFrom) == null ? void 0 : e.feature), f = v.layer || v.propagatedFrom;
          if (!u || !f || f._editingEnabled)
            return;
          const g = i.createCallbackFeature(u, 5e4, !1), k = {
            ...a.LeafletEventArgs.fromLeaflet(v).toDto(),
            layer: a.minimalLayerInfo(f),
            feature: g
          };
          if ((t == null ? void 0 : t.multipleFeatureSelection) === !0)
            if (w.has(f)) {
              const F = w.get(f);
              if (F && f.setStyle && (T.has(f) && T.delete(f), f.setStyle(F)), w.delete(f), o != null && o.events.selectionchanged)
                try {
                  const G = (i.SelectedFeatures || []).map((I) => i.createCallbackFeature(I, 5e4, !1));
                  o.dotNetRef.invokeMethodAsync(o.events.selectionchanged, G);
                } catch (C) {
                  console.error("Error invoking selectionchanged after unselect:", C);
                }
              o != null && o.events.featureunselected && o.dotNetRef.invokeMethodAsync(
                o.events.featureunselected,
                k
              );
            } else {
              let F;
              if (T.has(f) ? (F = T.get(f), T.delete(f)) : f.options && (F = {
                color: f.options.color,
                weight: f.options.weight,
                opacity: f.options.opacity,
                fillColor: f.options.fillColor,
                fillOpacity: f.options.fillOpacity,
                dashArray: f.options.dashArray
              }), F && w.set(f, F), f.bringToFront && f.bringToFront(), f.setStyle) {
                const C = (t == null ? void 0 : t.selectedFeatureStyle) || l;
                f.setStyle(C);
              }
              if (o != null && o.events.selectionchanged)
                try {
                  const G = (i.SelectedFeatures || []).map((I) => i.createCallbackFeature(I, 5e4, !1));
                  o.dotNetRef.invokeMethodAsync(o.events.selectionchanged, G);
                } catch (C) {
                  console.error("Error invoking selectionchanged before featureselected (single):", C);
                }
              if (o != null && o.events.featureselected && o.dotNetRef.invokeMethodAsync(
                o.events.featureselected,
                k
              ), o != null && o.events.selectionchanged)
                try {
                  const C = i.SelectedFeatures || [];
                  o.dotNetRef.invokeMethodAsync(o.events.selectionchanged, C);
                } catch (C) {
                  console.error("Error invoking selectionchanged after select (single-final):", C);
                }
              if (o != null && o.events.selectionchanged)
                try {
                  const G = (i.SelectedFeatures || []).map((I) => i.createCallbackFeature(I, 5e4, !1));
                  o.dotNetRef.invokeMethodAsync(o.events.selectionchanged, G);
                } catch (C) {
                  console.error("Error invoking selectionchanged after select (single):", C);
                }
              if (o != null && o.events.selectionchanged)
                try {
                  const G = (i.SelectedFeatures || []).map((I) => i.createCallbackFeature(I, 5e4, !1));
                  o.dotNetRef.invokeMethodAsync(o.events.selectionchanged, G);
                } catch (C) {
                  console.error("Error invoking selectionchanged after select:", C);
                }
            }
          else if (r === f) {
            if (d && f.setStyle && (T.has(f) && T.delete(f), f.setStyle(d)), r = null, d = null, o != null && o.events.selectionchanged)
              try {
                const C = (i.SelectedFeatures || []).map((G) => i.createCallbackFeature(G, 5e4, !1));
                o.dotNetRef.invokeMethodAsync(o.events.selectionchanged, C);
              } catch (F) {
                console.error("Error invoking selectionchanged after unselect (single):", F);
              }
            o != null && o.events.featureunselected && o.dotNetRef.invokeMethodAsync(
              o.events.featureunselected,
              k
            );
          } else {
            if (r && d && r.setStyle) {
              r.setStyle(d);
              try {
                if (o != null && o.events.featureunselected) {
                  const F = r.feature, C = {
                    layer: a.minimalLayerInfo(r),
                    feature: i.createCallbackFeature(F, 5e4, !1)
                  };
                  o.dotNetRef.invokeMethodAsync(o.events.featureunselected, C);
                }
              } catch (F) {
                console.error("Error invoking featureunselected for previous selection:", F);
              }
            }
            if (r = f, T.has(f) ? (d = T.get(f), T.delete(f)) : f.options && (d = {
              color: f.options.color,
              weight: f.options.weight,
              opacity: f.options.opacity,
              fillColor: f.options.fillColor,
              fillOpacity: f.options.fillOpacity,
              dashArray: f.options.dashArray
            }), f.bringToFront && f.bringToFront(), f.setStyle) {
              const F = (t == null ? void 0 : t.selectedFeatureStyle) || l;
              f.setStyle(F);
            }
            o != null && o.events.featureselected && o.dotNetRef.invokeMethodAsync(
              o.events.featureselected,
              k
            );
          }
        } catch (u) {
          console.error("Error handling feature selection:", u);
        }
      };
      if ((t == null ? void 0 : t.enableFeatureSelection) !== !1 && i.on("click", N), (t == null ? void 0 : t.enableHoverStyle) !== !1) {
        console.log("Hover enabled, enableHoverStyle value:", t == null ? void 0 : t.enableHoverStyle);
        const v = (t == null ? void 0 : t.hoverStyle) || n;
        i.on("mouseover", function(h) {
          var e, u;
          try {
            const f = ((e = h.layer) == null ? void 0 : e.feature) || ((u = h.propagatedFrom) == null ? void 0 : u.feature), g = h.layer || h.propagatedFrom;
            if (!f || !g || !g.setStyle)
              return;
            if (g.bringToFront && g.bringToFront(), !T.has(g)) {
              if (g.options) {
                const F = {
                  color: g.options.color,
                  weight: g.options.weight,
                  opacity: g.options.opacity,
                  fillColor: g.options.fillColor,
                  fillOpacity: g.options.fillOpacity,
                  dashArray: g.options.dashArray
                };
                T.set(g, F);
              }
              const A = { ...{
                color: g.options.color,
                weight: g.options.weight,
                opacity: g.options.opacity,
                fillColor: g.options.fillColor,
                fillOpacity: g.options.fillOpacity,
                dashArray: g.options.dashArray
              }, ...v };
              g.setStyle(A);
            }
          } catch (f) {
            console.error("Error applying hover style:", f);
          }
        }), i.on("mouseout", function(h) {
          var e, u;
          try {
            const f = ((e = h.layer) == null ? void 0 : e.feature) || ((u = h.propagatedFrom) == null ? void 0 : u.feature), g = h.layer || h.propagatedFrom;
            if (!f || !g || !g.setStyle)
              return;
            if (T.has(g)) {
              const k = T.get(g);
              if ((t == null ? void 0 : t.multipleFeatureSelection) === !0 ? w.has(g) : r === g) {
                const C = (t == null ? void 0 : t.selectedFeatureStyle) || l;
                g.setStyle(C);
              } else k && g.setStyle(k);
              T.delete(g);
            }
          } catch (f) {
            console.error("Error restoring hover style:", f);
          }
        });
      }
      s.indexOf("click") > -1 && i.on("click", function(v) {
        var h = o.events.click;
        try {
          let e = a.LeafletEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking click handler:", e);
        }
      }), s.indexOf("dblclick") > -1 && i.on("dblclick", function(v) {
        var h = o.events.dblclick;
        try {
          let e = a.LeafletEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking dblclick handler:", e);
        }
      }), s.indexOf("mousedown") > -1 && i.on("mousedown", function(v) {
        var h = o.events.mousedown;
        try {
          let e = a.LeafletEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking mousedown handler:", e);
        }
      }), s.indexOf("mouseup") > -1 && i.on("mouseup", function(v) {
        var h = o.events.mouseup;
        try {
          let e = a.LeafletEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking mouseup handler:", e);
        }
      }), s.indexOf("mouseover") > -1 && i.on("mouseover", function(v) {
        var h = o.events.mouseover;
        try {
          let e = a.LeafletEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking mouseover handler:", e);
        }
      }), s.indexOf("mouseout") > -1 && i.on("mouseout", function(v) {
        var h = o.events.mouseout;
        try {
          let e = a.LeafletEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking mouseout handler:", e);
        }
      }), s.indexOf("contextmenu") > -1 && i.on("contextmenu", function(v) {
        var h = o.events.contextmenu;
        try {
          let e = a.LeafletEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking contextmenu handler:", e);
        }
      }), s.indexOf("add") > -1 && i.on("add", function(v) {
        var h = o.events.add;
        try {
          let e = a.LeafletEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking add handler:", e);
        }
      }), s.indexOf("remove") > -1 && i.on("remove", function(v) {
        var h = o.events.remove;
        try {
          let e = a.LeafletEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking remove handler:", e);
        }
      }), s.indexOf("popupopen") > -1 && i.on("popupopen", function(v) {
        var h = o.events.popupopen;
        try {
          let e = a.LeafletPopupEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking popupopen handler:", e);
        }
      }), s.indexOf("popupclose") > -1 && i.on("popupclose", function(v) {
        var h = o.events.popupclose;
        try {
          let e = a.LeafletPopupEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking popupclose handler:", e);
        }
      }), s.indexOf("tooltipopen") > -1 && i.on("tooltipopen", function(v) {
        var h = o.events.tooltipopen;
        try {
          let e = a.LeafletTooltipEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking tooltipopen handler:", e);
        }
      }), s.indexOf("tooltipclose") > -1 && i.on("tooltipclose", function(v) {
        var h = o.events.tooltipclose;
        try {
          let e = a.LeafletTooltipEventArgs.fromLeaflet(v).toDto();
          o.dotNetRef.invokeMethodAsync(h, e);
        } catch (e) {
          console.error("Error invoking tooltipclose handler:", e);
        }
      });
    }
    return i.clearSelection = function() {
      if (r && d && r.setStyle && r.setStyle(d), r = null, d = null, w.forEach((s, N) => {
        s && N.setStyle && N.setStyle(s);
      }), w.clear(), T.forEach((s, N) => {
        s && N.setStyle && N.setStyle(s);
      }), T.clear(), o != null && o.events.selectionchanged)
        try {
          o.dotNetRef.invokeMethodAsync(o.events.selectionchanged, []);
        } catch (s) {
          console.error("Error invoking selectionchanged after clearSelection:", s);
        }
    }, i.setEnableFeatureSelection = function(s) {
      try {
        O = s === !0, s ? (i.on("click", selectionClickHandler), t.enableFeatureSelection = !0) : (i.off("click", selectionClickHandler), t.enableFeatureSelection = !1, i.clearSelection());
      } catch (N) {
        console.error("Error toggling feature selection:", N);
      }
    }, i.setMultipleFeatureSelection = function(s) {
      try {
        if (!t) return;
        const N = t.multipleFeatureSelection === !0;
        if (t.multipleFeatureSelection = s, N && !s && w.size > 0) {
          const v = Array.from(w.keys()), h = v[v.length - 1];
          for (let e = 0; e < v.length - 1; e++) {
            const u = v[e], f = w.get(u);
            f && u.setStyle && u.setStyle(f);
          }
          r = h, d = w.get(h) || d, w.clear();
        }
        if (o != null && o.events.selectionchanged)
          try {
            const h = (i.SelectedFeatures || []).map((e) => i.createCallbackFeature(e, 5e4, !1));
            o.dotNetRef.invokeMethodAsync(o.events.selectionchanged, h);
          } catch (v) {
            console.error("Error invoking selectionchanged after setMultipleFeatureSelection:", v);
          }
      } catch (N) {
        console.error("Error setting multiple selection mode:", N);
      }
    }, Object.defineProperty(i, "SelectedFeatures", {
      get: function() {
        return (t == null ? void 0 : t.multipleFeatureSelection) === !0 ? Array.from(w.keys()).map((N) => N.feature).filter((N) => N != null) : r && r.feature ? [r.feature] : [];
      }
    }), y && setTimeout(() => {
      i.addData(y);
    }, 0), i;
  }
}, Ee = {
  createEditableGeoJsonLayer(y, t, o) {
    const c = ae.createGeoJsonLayer(y, t, o);
    let i = !1, l = [], n = null, r = [], d = null, O = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map();
    const T = {
      color: "#ff7800",
      weight: 3,
      opacity: 0.8,
      fillOpacity: 0.3,
      dashArray: "5, 5"
    }, _ = {
      color: "#ff0000",
      weight: 3,
      opacity: 1,
      fillOpacity: 0.4
    }, P = (t == null ? void 0 : t.drawingStyle) || T, J = (t == null ? void 0 : t.editingStyle) || _, S = (t == null ? void 0 : t.enableSnapping) !== !1, s = (t == null ? void 0 : t.snapDistance) || 15, N = (t == null ? void 0 : t.showDrawingGuides) !== !1, v = (t == null ? void 0 : t.allowDoubleClickFinish) !== !1, h = (t == null ? void 0 : t.minPolygonPoints) || 3, e = (t == null ? void 0 : t.minLinePoints) || 2, u = () => c._map || null, f = (m) => {
      const x = u();
      if (x)
        try {
          const E = x.getContainer();
          m === null || m === "" ? E.style.cursor = "" : E.style.cursor = m;
        } catch (E) {
          console.error("Error setting cursor:", E);
        }
    }, g = (m) => "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(m), k = (t == null ? void 0 : t.addCursor) || "", A = (t == null ? void 0 : t.removeCursor) || "", F = k ? g(k) : null, C = A ? g(A) : null, G = (m) => {
      const x = u();
      if (!x)
        throw new Error("Layer is not added to a map");
      const E = L.circleMarker(m, {
        radius: 6,
        fillColor: "#ff7800",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      });
      return E.addTo(x), E;
    }, I = () => {
      if (r.forEach((m) => {
        const x = u();
        x && x.removeLayer(m);
      }), r = [], d) {
        const m = u();
        m && m.removeLayer(d), d = null;
      }
    }, j = () => {
      const m = u();
      m && (d && m.removeLayer(d), l.length > 0 && (d = L.polyline(l, P), d.addTo(m)));
    }, Q = (m, x) => {
      if (!S) return null;
      const E = x.latLngToContainerPoint(m);
      let b = null, D = s;
      return c.eachLayer((R) => {
        if (R.getLatLngs) {
          const V = R.getLatLngs();
          (Array.isArray(V[0]) ? V[0] : V).forEach((z) => {
            const B = x.latLngToContainerPoint(z), U = E.distanceTo(B);
            U < D && (D = U, b = z);
          });
        }
      }), l.forEach((R) => {
        const V = x.latLngToContainerPoint(R), H = E.distanceTo(V);
        H < D && (D = H, b = R);
      }), b;
    };
    c.startEditing = function() {
      i = !0;
      const m = u();
      if (!m) {
        console.error("Cannot start editing: layer not added to map");
        return;
      }
      m.doubleClickZoom.disable();
    }, c.stopEditing = function() {
      i = !1, I(), l = [], n = null;
      const m = u();
      m && m.doubleClickZoom.enable(), f("default");
    }, c.addPolygon = function() {
      if (!i) {
        console.error("Cannot start drawing: editing mode not enabled");
        return;
      }
      I(), l = [], n = "polygon";
      const m = u();
      if (!m) return;
      f("crosshair");
      const x = (b) => {
        if (n !== "polygon") return;
        let D = b.latlng;
        const R = Q(D, m);
        R && (D = R), l.push(D);
        const V = G(D);
        r.push(V), j(), N && l.length === 1 && console.log("Click to add points. Double-click or press Enter to finish.");
      }, E = (b) => {
        n === "polygon" && v && l.length >= h && (b.originalEvent.preventDefault(), c.confirmDrawing());
      };
      m.on("click", x), m.on("dblclick", E), c._drawingHandlers = { onMapClick: x, onMapDblClick: E };
    }, c.addLine = function() {
      if (!i) {
        console.error("Cannot start drawing: editing mode not enabled");
        return;
      }
      I(), l = [], n = "polyline";
      const m = u();
      if (!m) return;
      f("crosshair");
      const x = (b) => {
        if (n !== "polyline") return;
        let D = b.latlng;
        const R = Q(D, m);
        R && (D = R), l.push(D);
        const V = G(D);
        r.push(V), j(), N && l.length === 1 && console.log("Click to add points. Double-click or press Enter to finish.");
      }, E = (b) => {
        n === "polyline" && v && l.length >= e && (b.originalEvent.preventDefault(), c.confirmDrawing());
      };
      m.on("click", x), m.on("dblclick", E), c._drawingHandlers = { onMapClick: x, onMapDblClick: E };
    }, c.confirmDrawing = function() {
      if (!n || l.length === 0) {
        console.warn("No drawing to confirm");
        return;
      }
      const m = n === "polygon" ? h : e;
      if (l.length < m) {
        console.warn(`Need at least ${m} points to complete a ${n}`);
        return;
      }
      const x = l.map((D) => [D.lng, D.lat]);
      n === "polygon" && x.push(x[0]);
      const E = {
        type: "Feature",
        geometry: {
          type: n === "polygon" ? "Polygon" : "LineString",
          coordinates: n === "polygon" ? [x] : x
        },
        properties: {
          created: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
      c.addData(E), o != null && o.dotNetRef && o.events.featurecreated && o.dotNetRef.invokeMethodAsync(
        o.events.featurecreated,
        { feature: E, layer: null }
      );
      const b = u();
      if (b && c._drawingHandlers) {
        const D = c._drawingHandlers;
        b.off("click", D.onMapClick), b.off("dblclick", D.onMapDblClick), delete c._drawingHandlers;
      }
      I(), l = [], n = null, f("default");
    }, c.cancelDrawing = function() {
      const m = u();
      if (m && c._drawingHandlers) {
        const x = c._drawingHandlers;
        m.off("click", x.onMapClick), m.off("dblclick", x.onMapDblClick), delete c._drawingHandlers;
      }
      I(), l = [], n = null, f("default"), o != null && o.dotNetRef && o.events.drawingcancelled && o.dotNetRef.invokeMethodAsync(
        o.events.drawingcancelled
      );
    }, c.editSelectedFeatures = function() {
      const m = c.SelectedFeatures || [];
      if (m.length === 0) {
        console.warn("No features selected for editing");
        return;
      }
      if (!u()) {
        console.error("Cannot edit features: layer not added to map");
        return;
      }
      w.clear(), m.forEach((E) => {
        c.eachLayer((b) => {
          if (b.feature === E && (b instanceof L.Polygon || b instanceof L.Polyline)) {
            const D = b instanceof L.Polygon, R = b.getLatLngs(), H = (D ? R[0] : R).map((B) => ({ lat: B.lat, lng: B.lng }));
            w.set(E, { coords: H, isPolygon: D }), b._currentCursor = "move", b.editing ? b.editing.enable() : X(b);
            const z = b.getElement ? b.getElement() : null;
            z && (z.style.cursor = "move"), O.set(E, b);
          }
        });
      }), f("move");
    }, c.disableEditingFeatures = function() {
      O.forEach((m, x) => {
        m.editing && m.editing.enabled() ? m.editing.disable() : p(m);
      }), O.clear();
    }, c.confirmEditing = function() {
      O.forEach((m, x) => {
        m.editing && m.editing.enabled() ? m.editing.disable() : p(m);
        const E = m instanceof L.Polygon, b = m.getLatLngs(), R = (E ? b[0] : b).map((H) => [H.lng, H.lat]);
        E ? (R.push(R[0]), x.geometry.coordinates = [R]) : x.geometry.coordinates = R;
        const V = m.getElement ? m.getElement() : null;
        V && (V.style.cursor = ""), o != null && o.dotNetRef && o.events.featuremodified && o.dotNetRef.invokeMethodAsync(
          o.events.featuremodified,
          { feature: x, layer: null }
        );
      }), O.clear(), w.clear(), f("default");
    }, c.cancelEditing = function() {
      O.forEach((m, x) => {
        m.editing && m.editing.enabled() ? m.editing.disable() : p(m);
        const E = w.get(x);
        if (E) {
          const { coords: D, isPolygon: R } = E, V = D.map((z) => L.latLng(z.lat, z.lng));
          R ? m.setLatLngs([V]) : m.setLatLngs(V);
          const H = D.map((z) => [z.lng, z.lat]);
          R ? (H.push(H[0]), x.geometry.coordinates = [H]) : x.geometry.coordinates = H;
        }
        const b = m.getElement ? m.getElement() : null;
        b && (b.style.cursor = "");
      }), O.clear(), w.clear(), f("default");
    }, c.deleteSelectedFeatures = async function() {
      const m = c.SelectedFeatures || [];
      if (m.length === 0 || !u()) return;
      if (o != null && o.dotNetRef && o.events.featuredeleting)
        try {
          const b = await o.dotNetRef.invokeMethodAsync(
            o.events.featuredeleting,
            {
              features: m,
              cancel: !1
            }
          );
          if (b && (b.cancel === !0 || b.Cancel === !0))
            return;
        } catch (b) {
          console.error("Error calling featuredeleting event:", b);
          return;
        }
      c.disableEditingFeatures(), m.forEach((b) => {
        c.eachLayer((D) => {
          D.feature === b && (c.removeLayer(D), o != null && o.dotNetRef && o.events.featuredeleted && o.dotNetRef.invokeMethodAsync(
            o.events.featuredeleted,
            { feature: b, layer: null }
          ));
        });
      });
      const E = c.SelectedFeatures;
      E && Array.isArray(E) && E.splice(0, E.length), c.SelectedFeature = null, o != null && o.dotNetRef && o.events.featureunselected && o.dotNetRef.invokeMethodAsync(
        o.events.featureunselected,
        { feature: null, layer: null }
      );
    };
    const X = (m, x) => {
      if (m._editingEnabled) return;
      const E = u();
      if (!E) return;
      const b = m.getLatLngs(), D = m instanceof L.Polygon, R = D ? b[0] : b, V = D ? 3 : 2, H = [], z = () => {
        H.forEach((U) => {
          const Z = u();
          Z && Z.removeLayer(U);
        }), H.length = 0, R.forEach((U, Z) => {
          const $ = B(U, Z);
          H.push($);
        }), m._vertexMarkers = H;
      }, B = (U, Z) => {
        const $ = L.circleMarker(U, {
          radius: 8,
          fillColor: "#ffffff",
          color: "#ff0000",
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
          interactive: !0,
          bubblingMouseEvents: !1,
          pane: "markerPane"
        });
        $.addTo(E), $.bringToFront && $.bringToFront();
        const M = $.getElement();
        M && (M.style.cursor = m._currentCursor || "move");
        const ee = (W) => {
          L.DomEvent.stopPropagation(W), L.DomEvent.preventDefault(W), !(R.length <= V) && (R.splice(Z, 1), D ? m.setLatLngs([R]) : m.setLatLngs(R), z());
        };
        return $._deleteHandler = ee, $.on("mousedown", (W) => {
          L.DomEvent.stopPropagation(W), E.dragging && E.dragging.disable();
          const q = (re) => {
            const Y = re.latlng;
            $.setLatLng(Y), R[Z] = Y, D ? m.setLatLngs([R]) : m.setLatLngs(R);
          }, oe = () => {
            E.off("mousemove", q), E.off("mouseup", oe), E.dragging && E.dragging.enable();
          };
          E.on("mousemove", q), E.on("mouseup", oe);
        }), $;
      };
      z(), m._vertexMarkers = H, m._editingEnabled = !0, m._updateVertexMarkers = z, m._coords = R, m._isPolygon = D, m._minVertices = V, m.setStyle(J);
    }, p = (m) => {
      if (!m._editingEnabled) return;
      const x = u();
      if (x && m._vertexMarkers && m._vertexMarkers.forEach((E) => {
        x.removeLayer(E);
      }), m._addVertexClickHandler && (m.off("click", m._addVertexClickHandler), delete m._addVertexClickHandler), delete m._vertexMarkers, delete m._editingEnabled, delete m._updateVertexMarkers, delete m._coords, delete m._isPolygon, delete m._minVertices, m.feature)
        if ((c.SelectedFeatures || []).includes(m.feature) && (t != null && t.selectedFeatureStyle))
          m.setStyle(t.selectedFeatureStyle);
        else {
          const b = (t == null ? void 0 : t.style) || {};
          m.setStyle(b);
        }
    };
    c.setAddVertexMode = function(m) {
      let x = "move";
      m ? F ? (x = `url('${F}') 0 0, crosshair`, f(x)) : (x = "crosshair", f(x)) : (x = "move", f(x)), O.forEach((E) => {
        if (!E._editingEnabled) return;
        E._currentCursor = x;
        const b = E.getElement ? E.getElement() : null;
        if (b && (b.style.cursor = x), E._vertexMarkers && E._vertexMarkers.forEach((D) => {
          const R = D.getElement();
          R && (R.style.cursor = x);
        }), m) {
          const D = (R) => {
            L.DomEvent.stopPropagation(R);
            const V = E._coords, H = E._isPolygon;
            if (!V) return;
            const z = R.latlng;
            let B = 1 / 0, U = 0;
            for (let Z = 0; Z < V.length; Z++) {
              const $ = (Z + 1) % V.length;
              if (!H && $ === 0) continue;
              const M = V[Z], ee = V[$], W = te(z, M, ee);
              W < B && (B = W, U = $);
            }
            V.splice(U, 0, z), H ? E.setLatLngs([V]) : E.setLatLngs(V), E._updateVertexMarkers && E._updateVertexMarkers();
          };
          E.on("click", D), E._addVertexClickHandler = D;
        } else
          E._addVertexClickHandler && (E.off("click", E._addVertexClickHandler), delete E._addVertexClickHandler);
      });
    }, c.setRemoveVertexMode = function(m) {
      let x = "move";
      m ? C ? (x = `url('${C}') 0 0, crosshair`, f(x)) : (x = "crosshair", f(x)) : (x = "move", f(x)), O.forEach((E) => {
        if (!E._editingEnabled || !E._vertexMarkers) return;
        E._currentCursor = x;
        const b = E.getElement ? E.getElement() : null;
        b && (b.style.cursor = x), E._vertexMarkers.forEach((D) => {
          const R = D.getElement();
          R && (R.style.cursor = x), m ? D._deleteHandler && D.on("click", D._deleteHandler) : D._deleteHandler && D.off("click", D._deleteHandler);
        });
      });
    }, c.setMoveVertexMode = function(m) {
      if (m) {
        c.setAddVertexMode(!1), c.setRemoveVertexMode(!1);
        const x = "move";
        f(x), O.forEach((E) => {
          if (!E._editingEnabled) return;
          E._currentCursor = x;
          const b = E.getElement ? E.getElement() : null;
          b && (b.style.cursor = x), E._vertexMarkers && E._vertexMarkers.forEach((D) => {
            const R = D.getElement();
            R && (R.style.cursor = x);
          });
        });
      }
    };
    function te(m, x, E) {
      const b = u();
      if (!b) return 1 / 0;
      const D = b.latLngToContainerPoint(m), R = b.latLngToContainerPoint(x), V = b.latLngToContainerPoint(E), H = D.x, z = D.y, B = R.x, U = R.y, Z = V.x, $ = V.y, M = H - B, ee = z - U, W = Z - B, q = $ - U, oe = M * W + ee * q, re = W * W + q * q;
      let Y = -1;
      re !== 0 && (Y = oe / re);
      let ne, le;
      Y < 0 ? (ne = B, le = U) : Y > 1 ? (ne = Z, le = $) : (ne = B + Y * W, le = U + Y * q);
      const ce = H - ne, ie = z - le;
      return Math.sqrt(ce * ce + ie * ie);
    }
    return c;
  }
}, Ae = {
  addLatLng(y, t, o) {
    y.addLatLng(t, o);
  },
  setLatLngs(y, t) {
    y.setLatLngs(t);
  },
  closestLayerPoint(y, t) {
    return y.closestLayerPoint(t);
  }
}, Ne = {
  // placeholder for polygon helper methods
}, Se = {
  setBounds(y, t) {
    y.setBounds(t);
  }
}, xe = {
  createMarker(y, t, o) {
    const c = L.marker(y, t);
    if (o && o.dotNetRef && o.events) {
      const i = Object.keys(o.events);
      i.indexOf("move") > -1 && c.on("move", function(l) {
        var n = o.events.move;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for marker move event", r);
        }
      }), i.indexOf("dragstart") > -1 && c.on("dragstart", function(l) {
        var n = o.events.dragstart;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for marker dragstart event", r);
        }
      }), i.indexOf("movestart") > -1 && c.on("movestart", function(l) {
        var n = o.events.movestart;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for marker movestart event", r);
        }
      }), i.indexOf("drag") > -1 && c.on("drag", function(l) {
        var n = o.events.drag;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for marker drag event", r);
        }
      }), i.indexOf("dragend") > -1 && c.on("dragend", function(l) {
        var n = o.events.dragend;
        try {
          let r = a.LeafletDragEndEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for marker dragend event", r);
        }
      }), i.indexOf("moveend") > -1 && c.on("moveend", function(l) {
        var n = o.events.moveend;
        try {
          let r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for marker moveend event", r);
        }
      }), i.indexOf("click") > -1 && c.on("click", function(l) {
        var n = o.events.click;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event click", d);
        }
      }), i.indexOf("dblclick") > -1 && c.on("dblclick", function(l) {
        var n = o.events.dblclick;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event dblclick", d);
        }
      }), i.indexOf("mousedown") > -1 && c.on("mousedown", function(l) {
        var n = o.events.mousedown;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event mousedown", d);
        }
      }), i.indexOf("mouseup") > -1 && c.on("mouseup", function(l) {
        var n = o.events.mouseup;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event mouseup", d);
        }
      }), i.indexOf("mouseover") > -1 && c.on("mouseover", function(l) {
        var n = o.events.mouseover;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event mouseover", d);
        }
      }), i.indexOf("mouseout") > -1 && c.on("mouseout", function(l) {
        var n = o.events.mouseout;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event mouseout", d);
        }
      }), i.indexOf("contextmenu") > -1 && c.on("contextmenu", function(l) {
        var n = o.events.contextmenu;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event contextmenu", d);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          var r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event add", d);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          var r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event remove", d);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          var r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event popupopen", d);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          var r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event popupclose", d);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          var r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event tooltipopen", d);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          var r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event tooltipclose", d);
        }
      });
    }
    return c;
  }
}, Oe = {
  setLatLng(y, t) {
    y.setLatLng(t);
  },
  setRadius(y, t) {
    y.setRadius(t);
  }
}, be = {
  createPopup(y, t, o) {
    const c = L.popup(y, t);
    if (o && o.dotNetRef && o.events && Object.keys(o.events).indexOf("click") > -1) {
      var i = o.events.click;
      c.on("click", function(n) {
        try {
          let r = a.LeafletMouseEventArgs.fromLeaflet(n).toDto();
          o.dotNetRef.invokeMethodAsync(i, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for popup click event", r);
        }
      });
    }
    return c;
  }
}, De = {
  createTooltip(y, t, o) {
    const c = L.tooltip(y, t);
    if (o && o.dotNetRef && o.events) {
      const i = Object.keys(o.events);
      i.indexOf("contentupdate") > -1 && c.on("contentupdate", function(l) {
        var n = o.events.contentupdate;
        try {
          var r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event contentupdate", d);
        }
      }), i.indexOf("click") > -1 && c.on("click", function(l) {
        var n = o.events.click;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event click", d);
        }
      }), i.indexOf("dblclick") > -1 && c.on("dblclick", function(l) {
        var n = o.events.dblclick;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event dblclick", d);
        }
      }), i.indexOf("mousedown") > -1 && c.on("mousedown", function(l) {
        var n = o.events.mousedown;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event mousedown", d);
        }
      }), i.indexOf("mouseup") > -1 && c.on("mouseup", function(l) {
        var n = o.events.mouseup;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event mouseup", d);
        }
      }), i.indexOf("mouseover") > -1 && c.on("mouseover", function(l) {
        var n = o.events.mouseover;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event mouseover", d);
        }
      }), i.indexOf("mouseout") > -1 && c.on("mouseout", function(l) {
        var n = o.events.mouseout;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event mouseout", d);
        }
      }), i.indexOf("contextmenu") > -1 && c.on("contextmenu", function(l) {
        var n = o.events.contextmenu;
        try {
          var r = a.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event contextmenu", d);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          var r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event add", d);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          var r = a.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event remove", d);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          var r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event popupopen", d);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          var r = a.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event popupclose", d);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          var r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event tooltipopen", d);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          var r = a.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (d) {
          console.error("Error invoking dotnet handler for event tooltipclose", d);
        }
      });
    }
    return c;
  }
};
function Ce(y) {
  var o;
  const t = (o = L.CRS) == null ? void 0 : o[y];
  if (!t) {
    const c = Object.keys(L.CRS || {});
    throw new Error(
      `Unknown CRS '${y}'. Available CRS keys: ${c.join(", ")}`
    );
  }
  return t;
}
class Re extends L.Control {
  constructor(t) {
    super(t), this.container = null, this.isDrawing = !1, this.isEditing = !1, this.selectedCount = 0, this.isAddingVertices = !1, this.isRemovingVertices = !1, this.isMovingVertices = !1, this.dotNetRef = t == null ? void 0 : t.dotNetRef, this.controlOptions = t || {};
  }
  onAdd(t) {
    return this.container = L.DomUtil.create("div", "leaflet-editing-control leaflet-bar"), this.container.style.cssText = `
            background: white !important;
            padding: 10px !important;
            border-radius: 4px !important;
            box-shadow: 0 1px 5px rgba(0,0,0,0.4) !important;
            display: flex !important;
            gap: 8px !important;
            visibility: visible !important;
            opacity: 1 !important;
        `, L.DomEvent.disableClickPropagation(this.container), L.DomEvent.disableScrollPropagation(this.container), this.render(), this.container;
  }
  onRemove(t) {
    this.container && L.DomEvent.off(this.container);
  }
  render() {
    if (!this.container) return;
    this.container.innerHTML = "";
    const t = this.isDrawing || this.isEditing;
    this.addButton("btn-polygon", () => this.handlePolygonClick(), t), this.addButton("btn-line", () => this.handleLineClick(), t), this.addButton("btn-edit", () => this.handleEditClick(), this.selectedCount === 0 || t), this.addButton("btn-delete", () => this.handleDeleteClick(), this.selectedCount === 0 || t), this.isEditing && (this.addButton("btn-move-vertex", () => this.handleMoveVertexClick(), !1, this.isMovingVertices), this.addButton("btn-add-vertex", () => this.handleAddVertexClick(), !1, this.isAddingVertices), this.addButton("btn-remove-vertex", () => this.handleRemoveVertexClick(), !1, this.isRemovingVertices)), this.addButton("btn-confirm", () => this.handleConfirmClick(), !t), this.addButton("btn-cancel", () => this.handleCancelClick(), !t);
  }
  addButton(t, o, c = !1, i = !1) {
    const l = L.DomUtil.create("button", "leaflet-editing-button", this.container);
    l.id = t, l.type = "button", l.disabled = c;
    const n = this.controlOptions.buttonSize || 40;
    this.controlOptions.iconSize;
    const r = i;
    l.style.cssText = `
            background: ${r ? "#4CAF50" : "white"};
            border: 2px solid ${r ? "#4CAF50" : "rgba(0,0,0,0.2)"};
            border-radius: 4px;
            padding: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            margin: 0 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: ${n}px;
            min-height: ${n}px;
            color: ${r ? "white" : "currentColor"};
            box-shadow: ${r ? "0 2px 8px rgba(76, 175, 80, 0.4)" : "none"};
        `, c && (l.style.opacity = "0.4", l.style.cursor = "not-allowed");
    let d = "", O = "";
    t === "btn-polygon" ? (O = this.controlOptions.polygonTooltip || "Draw new polygon", d = this.controlOptions.polygonIcon || "") : t === "btn-line" ? (O = this.controlOptions.lineTooltip || "Draw new line", d = this.controlOptions.lineIcon || "") : t === "btn-edit" ? (O = this.controlOptions.editTooltip || "Edit selected features", d = this.controlOptions.editIcon || "") : t === "btn-delete" ? (O = this.controlOptions.deleteTooltip || "Delete selected features", d = this.controlOptions.deleteIcon || "") : t === "btn-confirm" ? (O = this.controlOptions.confirmTooltip || "Confirm drawing", d = this.controlOptions.confirmIcon || "") : t === "btn-cancel" ? (O = this.controlOptions.cancelTooltip || "Cancel drawing", d = this.controlOptions.cancelIcon || "") : t === "btn-add-vertex" ? (O = this.controlOptions.addVertexTooltip || "Add vertex", d = this.controlOptions.addVertexIcon || "") : t === "btn-remove-vertex" ? (O = this.controlOptions.removeVertexTooltip || "Remove vertex", d = this.controlOptions.removeVertexIcon || "") : t === "btn-move-vertex" && (O = this.controlOptions.moveVertexTooltip || "Move vertex", d = this.controlOptions.moveVertexIcon || ""), l.innerHTML = d, l.setAttribute("aria-label", O), l.setAttribute("title", O), L.DomEvent.on(l, "click", (w) => {
      L.DomEvent.stopPropagation(w), L.DomEvent.preventDefault(w), o();
    });
  }
  async handlePolygonClick() {
    if (this.dotNetRef)
      try {
        await this.dotNetRef.invokeMethodAsync("OnControlPolygonClick");
      } catch (t) {
        console.error("Error calling OnControlPolygonClick:", t);
      }
  }
  async handleLineClick() {
    if (this.dotNetRef)
      try {
        await this.dotNetRef.invokeMethodAsync("OnControlLineClick");
      } catch (t) {
        console.error("Error calling OnControlLineClick:", t);
      }
  }
  async handleEditClick() {
    if (this.dotNetRef)
      try {
        await this.dotNetRef.invokeMethodAsync("OnControlEditClick");
      } catch (t) {
        console.error("Error calling OnControlEditClick:", t);
      }
  }
  async handleConfirmClick() {
    if (this.dotNetRef)
      try {
        await this.dotNetRef.invokeMethodAsync("OnControlConfirmClick");
      } catch (t) {
        console.error("Error calling OnControlConfirmClick:", t);
      }
  }
  async handleCancelClick() {
    if (this.dotNetRef)
      try {
        await this.dotNetRef.invokeMethodAsync("OnControlCancelClick");
      } catch (t) {
        console.error("Error calling OnControlCancelClick:", t);
      }
  }
  async handleDeleteClick() {
    if (this.dotNetRef)
      try {
        await this.dotNetRef.invokeMethodAsync("OnControlDeleteClick");
      } catch (t) {
        console.error("Error calling OnControlDeleteClick:", t);
      }
  }
  async handleAddVertexClick() {
    if (this.dotNetRef)
      try {
        await this.dotNetRef.invokeMethodAsync("OnControlAddVertexClick");
      } catch (t) {
        console.error("Error calling OnControlAddVertexClick:", t);
      }
  }
  async handleRemoveVertexClick() {
    if (this.dotNetRef)
      try {
        await this.dotNetRef.invokeMethodAsync("OnControlRemoveVertexClick");
      } catch (t) {
        console.error("Error calling OnControlRemoveVertexClick:", t);
      }
  }
  async handleMoveVertexClick() {
    if (this.dotNetRef)
      try {
        await this.dotNetRef.invokeMethodAsync("OnControlMoveVertexClick");
      } catch (t) {
        console.error("Error calling OnControlMoveVertexClick:", t);
      }
  }
  // Public methods to update state from C#
  setDrawing(t) {
    this.isDrawing = t, this.render();
  }
  setSelectedCount(t) {
    this.selectedCount = t, this.render();
  }
  setEditing(t) {
    this.isEditing = t, this.render();
  }
  setAddingVertices(t) {
    this.isAddingVertices = t, this.render();
  }
  setRemovingVertices(t) {
    this.isRemovingVertices = t, this.render();
  }
  setMovingVertices(t) {
    this.isMovingVertices = t, this.render();
  }
}
const fe = {
  create(y, t) {
    return new Re(t);
  },
  remove(y) {
    y.remove();
  },
  setDrawing(y, t) {
    y.setDrawing(t);
  },
  setSelectedCount(y, t) {
    y.setSelectedCount(t);
  },
  setEditing(y, t) {
    y.setEditing(t);
  },
  setAddingVertices(y, t) {
    y.setAddingVertices(t);
  },
  setRemovingVertices(y, t) {
    y.setRemovingVertices(t);
  },
  setMovingVertices(y, t) {
    y.setMovingVertices(t);
  }
};
window.LeafletEditingControl = fe;
const Te = {
  Map: se,
  Layer: ue,
  GridLayer: de,
  TileLayer: ye,
  WmsTileLayer: me,
  ProtobufVectorTileLayer: ve,
  SlicerVectorTileLayer: he,
  LayerGroup: Le,
  FeatureGroup: ke,
  GeoJsonLayer: ae,
  EditableGeoJsonLayer: Ee,
  Polyline: Ae,
  Polygon: Ne,
  Rectangle: Se,
  Marker: xe,
  CircleMarker: Oe,
  Popup: be,
  Tooltip: De,
  getCrs: Ce,
  LeafletEditingControl: fe
};
typeof window < "u" && (window.LeafletMap = Te);
export {
  Te as LeafletMap,
  Te as default
};
//# sourceMappingURL=leafletMap.js.map
