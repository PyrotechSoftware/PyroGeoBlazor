var s;
((m) => {
  function t(S) {
    if (!S) return null;
    const e = {};
    return "_leaflet_id" in S && (e.LeafletId = S._leaflet_id), S && S.constructor && S.constructor.name && (e.Type = S.constructor.name), e;
  }
  m.minimalLayerInfo = t;
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
      const a = {
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new o(a);
    }
  }
  m.LeafletEventArgs = o;
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
      const a = {
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
      return new c(a);
    }
  }
  m.LeafletMouseEventArgs = c;
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
      const a = {
        OldSize: (e == null ? void 0 : e.oldSize) ?? null,
        NewSize: (e == null ? void 0 : e.newSize) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new i(a);
    }
  }
  m.LeafletResizeEventArgs = i;
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
      const a = {
        Popup: (e == null ? void 0 : e.popup) ?? (e == null ? void 0 : e.layer) ?? (e == null ? void 0 : e.target) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new l(a);
    }
  }
  m.LeafletPopupEventArgs = l;
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
      const a = {
        Distance: typeof (e == null ? void 0 : e.distance) == "number" ? e.distance : null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new n(a);
    }
  }
  m.LeafletDragEndEventArgs = n;
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
      const a = (e == null ? void 0 : e.message) ?? ((k = e == null ? void 0 : e.error) == null ? void 0 : k.message) ?? null, v = typeof (e == null ? void 0 : e.code) == "number" ? e.code : typeof (e == null ? void 0 : e.status) == "number" ? e.status : null, x = {
        Message: a,
        Code: v,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new r(x);
    }
  }
  m.LeafletErrorEventArgs = r;
  class u extends o {
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
      var v, x, k, D, V, H, U;
      const a = {
        Layer: t(e == null ? void 0 : e.layer) ?? t(e == null ? void 0 : e.target) ?? null,
        Properties: (e == null ? void 0 : e.properties) ?? ((x = (v = e == null ? void 0 : e.layer) == null ? void 0 : v.feature) == null ? void 0 : x.properties) ?? null,
        GeometryType: (e == null ? void 0 : e.geometryType) ?? ((V = (D = (k = e == null ? void 0 : e.layer) == null ? void 0 : k.feature) == null ? void 0 : D.geometry) == null ? void 0 : V.type) ?? null,
        Id: (e == null ? void 0 : e.id) ?? ((U = (H = e == null ? void 0 : e.layer) == null ? void 0 : H.feature) == null ? void 0 : U.id) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new u(a);
    }
  }
  m.LeafletGeoJsonEventArgs = u;
  class A extends o {
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
      const a = {
        OriginalEvent: (e == null ? void 0 : e.originalEvent) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new A(a);
    }
  }
  m.LeafletKeyboardEventArgs = A;
  class C extends o {
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
      const a = {
        Layer: t(e == null ? void 0 : e.layer) ?? t(e == null ? void 0 : e.target) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new C(a);
    }
  }
  m.LeafletLayerEventArgs = C;
  class R extends o {
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
      var v, x;
      const a = {
        Layer: t(e == null ? void 0 : e.layer) ?? t(e == null ? void 0 : e.target) ?? null,
        Name: (e == null ? void 0 : e.name) ?? ((x = (v = e == null ? void 0 : e.layer) == null ? void 0 : v.options) == null ? void 0 : x.name) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new R(a);
    }
  }
  m.LeafletLayersControlEventArgs = R;
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
      let a = null;
      if (e != null && e.bounds && typeof e.bounds.getNorthEast == "function") {
        const x = e.bounds.getNorthEast(), k = e.bounds.getSouthWest();
        a = { NorthEast: x, SouthWest: k };
      }
      const v = {
        LatLng: e.latlng ?? null,
        Bounds: a ?? null,
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
      return new _(v);
    }
  }
  m.LeafletLocationEventArgs = _;
  class w extends o {
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
      const a = {
        Tile: (e == null ? void 0 : e.tile) ?? (e == null ? void 0 : e.tile) ?? null,
        Coords: (e == null ? void 0 : e.coords) ?? (e == null ? void 0 : e.coord) ?? null,
        Error: (e == null ? void 0 : e.error) ?? (e == null ? void 0 : e.message) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new w(a);
    }
  }
  m.LeafletTileErrorEventArgs = w;
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
      const a = {
        Tile: (e == null ? void 0 : e.tile) ?? (e == null ? void 0 : e.tile) ?? null,
        Coords: (e == null ? void 0 : e.coords) ?? (e == null ? void 0 : e.coord) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new J(a);
    }
  }
  m.LeafletTileEventArgs = J;
  class f extends o {
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
      const a = {
        Tooltip: (e == null ? void 0 : e.tooltip) ?? (e == null ? void 0 : e.layer) ?? (e == null ? void 0 : e.target) ?? null,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new f(a);
    }
  }
  m.LeafletTooltipEventArgs = f;
  class d extends o {
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
      const a = (e == null ? void 0 : e.center) ?? (e != null && e.target && typeof e.target.getCenter == "function" ? e.target.getCenter() : null), v = typeof (e == null ? void 0 : e.zoom) == "number" ? e.zoom : typeof (e == null ? void 0 : e.newZoom) == "number" ? e.newZoom : null, x = "noUpdate" in (e ?? {}) ? !!e.noUpdate : null, k = {
        Center: a,
        Zoom: v,
        NoUpdate: x,
        Type: (e == null ? void 0 : e.type) ?? null,
        // Use minimalLayerInfo to avoid passing full Layer objects with circular refs
        Target: t(e == null ? void 0 : e.target) ?? null,
        SourceTarget: t(e == null ? void 0 : e.sourceTarget) ?? null,
        PropagatedFrom: t(e == null ? void 0 : e.propagatedFrom) ?? null
      };
      return new d(k);
    }
  }
  m.LeafletZoomAnimEventArgs = d;
  class y extends c {
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
      const a = (e == null ? void 0 : e.layerName) ?? null, v = (e == null ? void 0 : e.feature) ?? null, x = {
        LayerName: a,
        Feature: v,
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
      return new y(x);
    }
  }
  m.LeafletFeatureMouseEventArgs = y;
  class h extends w {
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
      const a = {
        Url: (e == null ? void 0 : e.url) ?? null,
        z: typeof (e == null ? void 0 : e.z) == "number" ? e.z : null,
        x: typeof (e == null ? void 0 : e.x) == "number" ? e.x : null,
        y: typeof (e == null ? void 0 : e.y) == "number" ? e.y : null,
        Tile: (e == null ? void 0 : e.tile) ?? (e == null ? void 0 : e.tile) ?? null,
        Coords: typeof (e == null ? void 0 : e.coords) == "object" ? e.coords : null,
        Error: (e == null ? void 0 : e.error) ?? null
      };
      return new h(a);
    }
  }
  m.LeafletTileFetchErrorEventArgs = h;
})(s || (s = {}));
const se = {
  createMap(m, t, o) {
    const c = L.map(m, t);
    if (o && o.dotNetRef && o.events) {
      const l = Object.keys(o.events);
      l.indexOf("resize") > -1 && c.on("resize", function(n) {
        var r = o.events.resize;
        let u = s.LeafletResizeEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, u);
      }), l.indexOf("viewreset") > -1 && c.on("viewreset", function(n) {
        var r = o.events.viewreset;
        let u = s.LeafletEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, u);
      }), l.indexOf("zoomlevelschange") > -1 && c.on("zoomlevelschange", function(n) {
        var r = o.events.zoomlevelschange;
        let u = s.LeafletEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, u);
      }), l.indexOf("zoomend") > -1 && c.on("zoomend", function(n) {
        var r = o.events.zoomend;
        let u = s.LeafletEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, u);
      }), l.indexOf("moveend") > -1 && c.on("moveend", function(n) {
        var r = o.events.moveend;
        let u = s.LeafletEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, u);
      }), l.indexOf("click") > -1 && c.on("click", function(n) {
        var r = o.events.click;
        let u = s.LeafletMouseEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, u);
      }), l.indexOf("dblclick") > -1 && c.on("dblclick", function(n) {
        var r = o.events.dblclick;
        let u = s.LeafletMouseEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, u);
      }), l.indexOf("contextmenu") > -1 && c.on("contextmenu", function(n) {
        var r = o.events.contextmenu;
        let u = s.LeafletMouseEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, u);
      }), l.indexOf("popupopen") > -1 && c.on("popupopen", function(n) {
        var r = o.events.popupopen;
        let u = s.LeafletPopupEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, u);
      }), l.indexOf("popupclose") > -1 && c.on("popupclose", function(n) {
        var r = o.events.popupclose;
        let u = s.LeafletPopupEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, u);
      }), l.indexOf("locationerror") > -1 && c.on("locationerror", function(n) {
        var r = o.events.locationerror;
        let u = s.LeafletErrorEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, u);
      }), l.indexOf("locationfound") > -1 && c.on("locationfound", function(n) {
        var r = o.events.locationfound;
        let u = s.LeafletLocationEventArgs.fromLeaflet(n).toDto();
        o.dotNetRef.invokeMethodAsync(r, u);
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
}, de = {
  addTo(m, t, o) {
    if (o && o.dotNetRef && o.events) {
      const c = Object.keys(o.events);
      c.indexOf("add") > -1 && m.on("add", function(i) {
        var l = o.events.add;
        try {
          let n = s.LeafletEventArgs.fromLeaflet(i).toDto();
          o.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking add handler:", n);
        }
      }), c.indexOf("remove") > -1 && m.on("remove", function(i) {
        var l = o.events.remove;
        try {
          let n = s.LeafletEventArgs.fromLeaflet(i).toDto();
          o.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking remove handler:", n);
        }
      }), c.indexOf("popupopen") > -1 && m.on("popupopen", function(i) {
        var l = o.events.popupopen;
        try {
          let n = s.LeafletPopupEventArgs.fromLeaflet(i).toDto();
          o.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking popupopen handler:", n);
        }
      }), c.indexOf("popupclose") > -1 && m.on("popupclose", function(i) {
        var l = o.events.popupclose;
        try {
          let n = s.LeafletPopupEventArgs.fromLeaflet(i).toDto();
          o.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking popupclose handler:", n);
        }
      }), c.indexOf("tooltipopen") > -1 && m.on("tooltipopen", function(i) {
        var l = o.events.tooltipopen;
        try {
          let n = s.LeafletTooltipEventArgs.fromLeaflet(i).toDto();
          o.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tooltipopen handler:", n);
        }
      }), c.indexOf("tooltipclose") > -1 && m.on("tooltipclose", function(i) {
        var l = o.events.tooltipclose;
        try {
          let n = s.LeafletTooltipEventArgs.fromLeaflet(i).toDto();
          o.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tooltipclose handler:", n);
        }
      });
    }
    m.addTo(t);
  },
  remove(m) {
    m.remove();
  }
}, ue = {
  createGridLayer(m, t) {
    const o = L.gridLayer();
    if (t && t.dotNetRef && t.events) {
      const c = Object.keys(t.events);
      c.indexOf("loading") > -1 && o.on("loading", function(i) {
        var l = t.events.loading;
        try {
          let n = s.LeafletEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking loading handler:", n);
        }
      }), c.indexOf("tileunload") > -1 && o.on("tileunload", function(i) {
        var l = t.events.tileunload;
        try {
          let n = s.LeafletTileEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tileunload handler:", n);
        }
      }), c.indexOf("tileloadstart") > -1 && o.on("tileloadstart", function(i) {
        var l = t.events.tileloadstart;
        try {
          let n = s.LeafletTileEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tileloadstart handler:", n);
        }
      }), c.indexOf("tileerror") > -1 && o.on("tileerror", function(i) {
        var l = t.events.tileerror;
        try {
          let n = s.LeafletTileErrorEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tileerror handler:", n);
        }
      }), c.indexOf("tileload") > -1 && o.on("tileload", function(i) {
        var l = t.events.tileload;
        try {
          let n = s.LeafletTileEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tileload handler:", n);
        }
      }), c.indexOf("load") > -1 && o.on("load", function(i) {
        var l = t.events.load;
        try {
          let n = s.LeafletEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking load handler:", n);
        }
      }), c.indexOf("add") > -1 && o.on("add", function(i) {
        var l = t.events.add;
        try {
          let n = s.LeafletEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking add handler:", n);
        }
      }), c.indexOf("remove") > -1 && o.on("remove", function(i) {
        var l = t.events.remove;
        try {
          let n = s.LeafletEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking remove handler:", n);
        }
      }), c.indexOf("popupopen") > -1 && o.on("popupopen", function(i) {
        var l = t.events.popupopen;
        try {
          let n = s.LeafletPopupEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking popupopen handler:", n);
        }
      }), c.indexOf("popupclose") > -1 && o.on("popupclose", function(i) {
        var l = t.events.popupclose;
        try {
          let n = s.LeafletPopupEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking popupclose handler:", n);
        }
      }), c.indexOf("tooltipopen") > -1 && o.on("tooltipopen", function(i) {
        var l = t.events.tooltipopen;
        try {
          let n = s.LeafletTooltipEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tooltipopen handler:", n);
        }
      }), c.indexOf("tooltipclose") > -1 && o.on("tooltipclose", function(i) {
        var l = t.events.tooltipclose;
        try {
          let n = s.LeafletTooltipEventArgs.fromLeaflet(i).toDto();
          t.dotNetRef.invokeMethodAsync(l, n);
        } catch (n) {
          console.error("Error invoking tooltipclose handler:", n);
        }
      });
    }
    return o;
  }
}, ye = {
  createTileLayer(m, t, o) {
    const c = L.tileLayer(m, t);
    if (o && o.dotNetRef && o.events) {
      const i = Object.keys(o.events);
      i.indexOf("tileabort") > -1 && c.on("tileabort", function(l) {
        var n = o.events.tileabort;
        try {
          let r = s.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileabort handler:", r);
        }
      }), i.indexOf("loading") > -1 && c.on("loading", function(l) {
        var n = o.events.loading;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking loading handler:", r);
        }
      }), i.indexOf("tileunload") > -1 && c.on("tileunload", function(l) {
        var n = o.events.tileunload;
        try {
          let r = s.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileunload handler:", r);
        }
      }), i.indexOf("tileloadstart") > -1 && c.on("tileloadstart", function(l) {
        var n = o.events.tileloadstart;
        try {
          let r = s.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileloadstart handler:", r);
        }
      }), i.indexOf("tileerror") > -1 && c.on("tileerror", function(l) {
        var n = o.events.tileerror;
        try {
          let r = s.LeafletTileErrorEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileerror handler:", r);
        }
      }), i.indexOf("tileload") > -1 && c.on("tileload", function(l) {
        var n = o.events.tileload;
        try {
          let r = s.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileload handler:", r);
        }
      }), i.indexOf("load") > -1 && c.on("load", function(l) {
        var n = o.events.load;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking load handler:", r);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking add handler:", r);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking remove handler:", r);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          let r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupopen handler:", r);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          let r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupclose handler:", r);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          let r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipopen handler:", r);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          let r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipclose handler:", r);
        }
      });
    }
    return c;
  }
}, me = {
  createWmsTileLayer(m, t, o) {
    const c = L.tileLayer.wms(m, t);
    if (o && o.dotNetRef && o.events) {
      const i = Object.keys(o.events);
      i.indexOf("tileabort") > -1 && c.on("tileabort", function(l) {
        var n = o.events.tileabort;
        try {
          let r = s.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileabort handler:", r);
        }
      }), i.indexOf("loading") > -1 && c.on("loading", function(l) {
        var n = o.events.loading;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking loading handler:", r);
        }
      }), i.indexOf("tileunload") > -1 && c.on("tileunload", function(l) {
        var n = o.events.tileunload;
        try {
          let r = s.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileunload handler:", r);
        }
      }), i.indexOf("tileloadstart") > -1 && c.on("tileloadstart", function(l) {
        var n = o.events.tileloadstart;
        try {
          let r = s.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileloadstart handler:", r);
        }
      }), i.indexOf("tileerror") > -1 && c.on("tileerror", function(l) {
        var n = o.events.tileerror;
        try {
          let r = s.LeafletTileErrorEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileerror handler:", r);
        }
      }), i.indexOf("tileload") > -1 && c.on("tileload", function(l) {
        var n = o.events.tileload;
        try {
          let r = s.LeafletTileEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tileload handler:", r);
        }
      }), i.indexOf("load") > -1 && c.on("load", function(l) {
        var n = o.events.load;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking load handler:", r);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking add handler:", r);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking remove handler:", r);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          let r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupopen handler:", r);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          let r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupclose handler:", r);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          let r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipopen handler:", r);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          let r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipclose handler:", r);
        }
      });
    }
    return c;
  }
}, K = {
  getRendererFactory(m) {
    if (!m)
      return;
    const t = m.toLowerCase();
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
  setupFeatureSelection(m, t, o) {
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
    }, l = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), A = (t == null ? void 0 : t.selectedFeatureStyle) ?? c, C = (f) => {
      if (f && f.setStyle) {
        const d = {};
        A.color && (d.color = A.color), A.weight !== void 0 && (d.weight = A.weight), A.opacity !== void 0 && (d.opacity = A.opacity), A.fillColor && (d.fillColor = A.fillColor), A.fillOpacity !== void 0 && (d.fillOpacity = A.fillOpacity), A.fill !== void 0 && (d.fill = A.fill), A.stroke !== void 0 && (d.stroke = A.stroke), A.dashArray && (d.dashArray = A.dashArray), A.lineCap && (d.lineCap = A.lineCap), A.lineJoin && (d.lineJoin = A.lineJoin), f.setStyle(d);
      }
    }, R = (f) => {
      var d;
      f && f.setStyle && ((d = f.options) != null && d.originalStyle) && f.setStyle(f.options.originalStyle);
    }, _ = (f) => (f == null ? void 0 : f.id) ?? (f == null ? void 0 : f.ID) ?? (f == null ? void 0 : f.fid) ?? (f == null ? void 0 : f.FID) ?? (f == null ? void 0 : f.objectid) ?? (f == null ? void 0 : f.OBJECTID) ?? JSON.stringify(f);
    m.on("click", function(f) {
      if (f.layer && f.layer.properties) {
        const d = _(f.layer.properties);
        u.has(d) || u.set(d, []);
        const y = u.get(d);
        y.includes(f.layer) || y.push(f.layer);
      }
    });
    const w = (f) => {
      const d = u.get(f) || [];
      return d.forEach((y) => {
        y.options.originalStyle || (y.options.originalStyle = {
          fillColor: y.options.fillColor,
          color: y.options.color,
          weight: y.options.weight,
          fillOpacity: y.options.fillOpacity,
          fill: y.options.fill
        }), C(y);
      }), d;
    }, J = (f) => {
      const d = n.get(f);
      d && d.forEach((y) => R(y));
    };
    if ((t == null ? void 0 : t.enableFeatureSelection) !== !1 && m.on("click", function(f) {
      var d, y;
      if (f.layer && f.layer.properties) {
        const h = m._pyroOptions || t;
        if ((h == null ? void 0 : h.enableFeatureSelection) === !1)
          return;
        const S = _(f.layer.properties), e = {
          id: S,
          type: ((d = f.layer.feature) == null ? void 0 : d.type) ?? "Feature",
          geometry: (y = f.layer.feature) == null ? void 0 : y.geometry,
          properties: f.layer.properties
        };
        if (l.has(S)) {
          const v = n.get(S);
          if (J(S), l.delete(S), n.delete(S), v && v.some((k) => r.has(k))) {
            const k = (h == null ? void 0 : h.hoverStyle) || i;
            v.forEach((D) => {
              var V, H, U, G, z;
              if (D.setStyle) {
                const X = { ...{
                  color: ((V = D.options.originalStyle) == null ? void 0 : V.color) || D.options.color,
                  weight: ((H = D.options.originalStyle) == null ? void 0 : H.weight) || D.options.weight,
                  opacity: ((U = D.options.originalStyle) == null ? void 0 : U.opacity) || D.options.opacity,
                  fillColor: ((G = D.options.originalStyle) == null ? void 0 : G.fillColor) || D.options.fillColor,
                  fillOpacity: ((z = D.options.originalStyle) == null ? void 0 : z.fillOpacity) || D.options.fillOpacity
                }, ...k };
                D.setStyle(X);
              }
            });
          }
          o != null && o.dotNetRef && o.events.featureunselected && o.dotNetRef.invokeMethodAsync(
            o.events.featureunselected,
            {
              feature: e,
              latlng: f.latlng,
              layerPoint: f.layerPoint,
              containerPoint: f.containerPoint
            }
          );
        } else {
          (h == null ? void 0 : h.multipleFeatureSelection) === !0 || (l.forEach((k, D) => J(D)), l.clear(), n.clear());
          const x = w(S);
          x.forEach((k) => {
            k.bringToFront && k.bringToFront();
          }), l.set(S, e), n.set(S, x), o != null && o.dotNetRef && o.events.featureselected && o.dotNetRef.invokeMethodAsync(
            o.events.featureselected,
            {
              feature: e,
              latlng: f.latlng,
              layerPoint: f.layerPoint,
              containerPoint: f.containerPoint
            }
          );
        }
        o != null && o.dotNetRef && o.events.featureclicked && o.dotNetRef.invokeMethodAsync(
          o.events.featureclicked,
          {
            feature: e,
            latlng: f.latlng,
            layerPoint: f.layerPoint,
            containerPoint: f.containerPoint
          }
        );
      }
    }), m.clearSelection = function() {
      l.forEach((f, d) => J(d)), l.clear(), n.clear(), r.forEach((f, d) => {
        d && d.setStyle && f && d.setStyle(f);
      }), r.clear();
    }, (t == null ? void 0 : t.interactive) === !0 && (t == null ? void 0 : t.enableHoverStyle) !== !1) {
      const f = (t == null ? void 0 : t.hoverStyle) || i;
      m.on("mouseover", function(d) {
        if (d.layer && d.layer.properties) {
          const y = _(d.layer.properties);
          u.has(y) || u.set(y, []);
          const h = u.get(y);
          h.includes(d.layer) || h.push(d.layer), l.has(y) || (u.get(y) || []).forEach((e) => {
            if (e.bringToFront && e.bringToFront(), !r.has(e)) {
              r.set(e, {
                color: e.options.color,
                weight: e.options.weight,
                opacity: e.options.opacity,
                fillColor: e.options.fillColor,
                fillOpacity: e.options.fillOpacity
              });
              const v = { ...{
                color: e.options.color,
                weight: e.options.weight,
                opacity: e.options.opacity,
                fillColor: e.options.fillColor,
                fillOpacity: e.options.fillOpacity
              }, ...f };
              e.setStyle && e.setStyle(v);
            }
          });
        }
      }), m.on("mouseout", function(d) {
        if (d.layer && d.layer.properties) {
          const y = _(d.layer.properties);
          (u.get(y) || []).forEach((S) => {
            if (r.has(S)) {
              const e = r.get(S);
              l.has(y) ? C(S) : e && S.setStyle && S.setStyle(e), r.delete(S);
            }
          });
        }
      });
    }
  },
  attachGridLayerEvents(m, t) {
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
      l && m.on(l.eventName, function(n) {
        const r = t.events[i];
        try {
          const A = s[l.argType].fromLeaflet(n).toDto();
          t.dotNetRef.invokeMethodAsync(r, A);
        } catch (u) {
          console.error(`Error invoking ${l.eventName} handler:`, u);
        }
      });
    }
  },
  attachInteractiveEvents(m, t, o) {
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
      c.indexOf(l) > -1 && m.on(n, function(r) {
        var A, C;
        const u = o.events[l];
        try {
          const R = {
            latlng: r.latlng ? { lat: r.latlng.lat, lng: r.latlng.lng } : null,
            layerPoint: r.layerPoint ? { x: r.layerPoint.x, y: r.layerPoint.y } : null,
            containerPoint: r.containerPoint ? { x: r.containerPoint.x, y: r.containerPoint.y } : null,
            feature: r.layer && r.layer.properties ? {
              id: r.layer.properties.id ?? r.layer.properties.ID ?? r.layer.properties.fid ?? r.layer.properties.FID,
              type: ((A = r.layer.feature) == null ? void 0 : A.type) ?? "Feature",
              geometry: (C = r.layer.feature) == null ? void 0 : C.geometry,
              properties: r.layer.properties
            } : null
          };
          o.dotNetRef.invokeMethodAsync(u, R);
        } catch (R) {
          console.error(`Error invoking ${l} handler:`, R);
        }
      });
  },
  setInteractive(m, t) {
    m.options && (m.options.interactive = t), m._vectorTiles && Object.values(m._vectorTiles).forEach((o) => {
      o && o._features && Object.values(o._features).forEach((c) => {
        c && (c.options.interactive = t);
      });
    }), m.redraw && m.redraw();
  },
  setEnableFeatureSelection(m, t) {
    m._pyroOptions && (m._pyroOptions.enableFeatureSelection = t), !t && m.clearSelection && m.clearSelection();
  },
  setMultipleFeatureSelection(m, t) {
    m._pyroOptions && (m._pyroOptions.multipleFeatureSelection = t), !t && m.clearSelection;
  }
}, ge = {
  createProtobufVectorTileLayer(m, t, o) {
    if (!L.vectorGrid || typeof L.vectorGrid.protobuf != "function")
      throw console.error("Leaflet.VectorGrid plugin is not loaded. Please include Leaflet.VectorGrid.bundled.js"), new Error("Leaflet.VectorGrid plugin is required but not loaded");
    t != null && t.layerName && (m = m.replace("{LayerName}", t.layerName));
    let c = t == null ? void 0 : t.vectorTileLayerStyles;
    if (c && typeof c == "object" && Object.keys(c).length > 0) {
      const r = {};
      for (const [C, R] of Object.entries(c))
        r[C] = function(_) {
          return R;
        };
      const u = Object.values(c)[0], A = Object.keys(c);
      for (const C of A) {
        const R = C.split(":").pop();
        R && !r[R] && (r[R] = function(_) {
          return u;
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
    const n = L.vectorGrid.protobuf(m, i);
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
}, he = (m) => {
  if (!m)
    return;
  const t = m.toLowerCase();
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
}, ve = {
  createSlicerVectorTileLayer(m, t, o) {
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
    }, l = he(t == null ? void 0 : t.rendererFactory);
    l !== void 0 && (i.rendererFactory = l);
    const n = L.vectorGrid.slicer(m, i);
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
    }, u = {
      color: "red",
      weight: 2,
      opacity: 1
    }, A = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map(), R = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), w = (t == null ? void 0 : t.selectedFeatureStyle) ?? r, J = (e) => {
      if (e && e.setStyle) {
        const a = {};
        w.color && (a.color = w.color), w.weight !== void 0 && (a.weight = w.weight), w.opacity !== void 0 && (a.opacity = w.opacity), w.fillColor && (a.fillColor = w.fillColor), w.fillOpacity !== void 0 && (a.fillOpacity = w.fillOpacity), w.fill !== void 0 && (a.fill = w.fill), w.stroke !== void 0 && (a.stroke = w.stroke), w.dashArray && (a.dashArray = w.dashArray), w.lineCap && (a.lineCap = w.lineCap), w.lineJoin && (a.lineJoin = w.lineJoin), e.setStyle(a);
      }
    }, f = (e) => {
      var a;
      e && e.setStyle && ((a = e.options) != null && a.originalStyle) && e.setStyle(e.options.originalStyle);
    }, d = (e) => (e == null ? void 0 : e.id) ?? (e == null ? void 0 : e.ID) ?? (e == null ? void 0 : e.fid) ?? (e == null ? void 0 : e.FID) ?? (e == null ? void 0 : e.objectid) ?? (e == null ? void 0 : e.OBJECTID) ?? JSON.stringify(e), y = (e) => {
      if (e && e.properties) {
        const a = d(e.properties);
        _.has(a) || _.set(a, []);
        const v = _.get(a);
        v.includes(e) || v.push(e);
      }
    }, h = (e) => {
      const a = _.get(e) || [];
      return a.forEach((v) => {
        v.options.originalStyle || (v.options.originalStyle = {
          fillColor: v.options.fillColor,
          color: v.options.color,
          weight: v.options.weight,
          fillOpacity: v.options.fillOpacity,
          fill: v.options.fill
        }), J(v);
      }), a;
    }, S = (e) => {
      const a = C.get(e);
      a && a.forEach((v) => f(v));
    };
    if ((t == null ? void 0 : t.enableFeatureSelection) !== !1 && n.on("click", function(e) {
      var a, v;
      if (e.layer && e.layer.properties) {
        const x = n._pyroOptions || t;
        if ((x == null ? void 0 : x.enableFeatureSelection) === !1)
          return;
        y(e.layer);
        const k = d(e.layer.properties), D = {
          id: k,
          type: ((a = e.layer.feature) == null ? void 0 : a.type) ?? "Feature",
          geometry: (v = e.layer.feature) == null ? void 0 : v.geometry,
          properties: e.layer.properties
        };
        if (A.has(k)) {
          const H = C.get(k);
          if (S(k), A.delete(k), C.delete(k), H && H.some((G) => R.has(G))) {
            const G = (x == null ? void 0 : x.hoverStyle) || u;
            H.forEach((z) => {
              var Q, X, p, te, g;
              if (z.setStyle) {
                const E = { ...{
                  color: ((Q = z.options.originalStyle) == null ? void 0 : Q.color) || z.options.color,
                  weight: ((X = z.options.originalStyle) == null ? void 0 : X.weight) || z.options.weight,
                  opacity: ((p = z.options.originalStyle) == null ? void 0 : p.opacity) || z.options.opacity,
                  fillColor: ((te = z.options.originalStyle) == null ? void 0 : te.fillColor) || z.options.fillColor,
                  fillOpacity: ((g = z.options.originalStyle) == null ? void 0 : g.fillOpacity) || z.options.fillOpacity
                }, ...G };
                z.setStyle(E);
              }
            });
          }
          o != null && o.dotNetRef && o.events.featureunselected && o.dotNetRef.invokeMethodAsync(
            o.events.featureunselected,
            {
              feature: D,
              latlng: e.latlng,
              layerPoint: e.layerPoint,
              containerPoint: e.containerPoint
            }
          );
        } else {
          (x == null ? void 0 : x.multipleFeatureSelection) === !0 || (A.forEach((G, z) => S(z)), A.clear(), C.clear());
          const U = h(k);
          U.forEach((G) => {
            G.bringToFront && G.bringToFront();
          }), A.set(k, D), C.set(k, U), o != null && o.dotNetRef && o.events.featureselected && o.dotNetRef.invokeMethodAsync(
            o.events.featureselected,
            {
              feature: D,
              latlng: e.latlng,
              layerPoint: e.layerPoint,
              containerPoint: e.containerPoint
            }
          );
        }
        o != null && o.dotNetRef && o.events.featureclicked && o.dotNetRef.invokeMethodAsync(
          o.events.featureclicked,
          {
            feature: D,
            latlng: e.latlng,
            layerPoint: e.layerPoint,
            containerPoint: e.containerPoint
          }
        );
      }
    }), n.clearSelection = function() {
      A.forEach((e, a) => S(a)), A.clear(), C.clear(), R.forEach((e, a) => {
        a && a.setStyle && e && a.setStyle(e);
      }), R.clear();
    }, (t == null ? void 0 : t.interactive) === !0 && (t == null ? void 0 : t.enableHoverStyle) !== !1) {
      const e = (t == null ? void 0 : t.hoverStyle) || u;
      n.on("mouseover", function(a) {
        if (a.layer && a.layer.properties) {
          y(a.layer);
          const v = d(a.layer.properties);
          A.has(v) || (_.get(v) || []).forEach((k) => {
            if (k.bringToFront && k.bringToFront(), !R.has(k)) {
              R.set(k, {
                color: k.options.color,
                weight: k.options.weight,
                opacity: k.options.opacity,
                fillColor: k.options.fillColor,
                fillOpacity: k.options.fillOpacity
              });
              const V = { ...{
                color: k.options.color,
                weight: k.options.weight,
                opacity: k.options.opacity,
                fillColor: k.options.fillColor,
                fillOpacity: k.options.fillOpacity
              }, ...e };
              k.setStyle && k.setStyle(V);
            }
          });
        }
      }), n.on("mouseout", function(a) {
        if (a.layer && a.layer.properties) {
          const v = d(a.layer.properties);
          (_.get(v) || []).forEach((k) => {
            if (R.has(k)) {
              const D = R.get(k);
              A.has(v) ? J(k) : D && k.setStyle && k.setStyle(D), R.delete(k);
            }
          });
        }
      });
    }
    if (o != null && o.dotNetRef && o.events) {
      const e = Object.keys(o.events), a = {
        loading: { eventName: "loading", argType: "LeafletEventArgs" },
        tileunload: { eventName: "tileunload", argType: "LeafletTileEventArgs" },
        tileloadstart: { eventName: "tileloadstart", argType: "LeafletTileEventArgs" },
        tileerror: { eventName: "tileerror", argType: "LeafletTileErrorEventArgs" },
        tileload: { eventName: "tileload", argType: "LeafletTileEventArgs" },
        load: { eventName: "load", argType: "LeafletEventArgs" },
        add: { eventName: "add", argType: "LeafletEventArgs" },
        remove: { eventName: "remove", argType: "LeafletEventArgs" }
      };
      for (const v of e) {
        const x = a[v];
        x && n.on(x.eventName, function(k) {
          const D = o.events[v];
          try {
            const H = s[x.argType].fromLeaflet(k).toDto();
            o.dotNetRef.invokeMethodAsync(D, H);
          } catch (V) {
            console.error(`Error invoking ${x.eventName} handler:`, V);
          }
        });
      }
      if (t != null && t.interactive) {
        const v = {
          mouseover: "mouseover",
          mouseout: "mouseout",
          mousemove: "mousemove",
          dblclick: "dblclick",
          contextmenu: "contextmenu"
        };
        for (const [x, k] of Object.entries(v))
          e.indexOf(x) > -1 && n.on(k, function(D) {
            var H, U;
            const V = o.events[x];
            try {
              const G = {
                latlng: D.latlng ? { lat: D.latlng.lat, lng: D.latlng.lng } : null,
                layerPoint: D.layerPoint ? { x: D.layerPoint.x, y: D.layerPoint.y } : null,
                containerPoint: D.containerPoint ? { x: D.containerPoint.x, y: D.containerPoint.y } : null,
                feature: D.layer && D.layer.properties ? {
                  id: D.layer.properties.id ?? D.layer.properties.ID ?? D.layer.properties.fid ?? D.layer.properties.FID,
                  type: ((H = D.layer.feature) == null ? void 0 : H.type) ?? "Feature",
                  geometry: (U = D.layer.feature) == null ? void 0 : U.geometry,
                  properties: D.layer.properties
                } : null
              };
              o.dotNetRef.invokeMethodAsync(V, G);
            } catch (G) {
              console.error(`Error invoking ${x} handler:`, G);
            }
          });
      }
    }
    return n.setInteractive = function(e) {
      n.options && (n.options.interactive = e), n._vectorTiles && Object.values(n._vectorTiles).forEach((a) => {
        a && a._features && Object.values(a._features).forEach((v) => {
          v && (v.options.interactive = e);
        });
      }), n.redraw && n.redraw();
    }, n.setEnableFeatureSelection = function(e) {
      n._pyroOptions && (n._pyroOptions.enableFeatureSelection = e), !e && n.clearSelection && n.clearSelection();
    }, n.setMultipleFeatureSelection = function(e) {
      n._pyroOptions && (n._pyroOptions.multipleFeatureSelection = e);
    }, n;
  }
}, Le = {
  createLayerGroup(m = [], t, o) {
    const c = L.layerGroup(m, t);
    if (o && o.dotNetRef && o.events) {
      const i = Object.keys(o.events);
      i.indexOf("click") > -1 && c.on("click", function(l) {
        var n = o.events.click;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking click handler:", r);
        }
      }), i.indexOf("dblclick") > -1 && c.on("dblclick", function(l) {
        var n = o.events.dblclick;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dblclick handler:", r);
        }
      }), i.indexOf("mousedown") > -1 && c.on("mousedown", function(l) {
        var n = o.events.mousedown;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mousedown handler:", r);
        }
      }), i.indexOf("mouseup") > -1 && c.on("mouseup", function(l) {
        var n = o.events.mouseup;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseup handler:", r);
        }
      }), i.indexOf("mouseover") > -1 && c.on("mouseover", function(l) {
        var n = o.events.mouseover;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseover handler:", r);
        }
      }), i.indexOf("mouseout") > -1 && c.on("mouseout", function(l) {
        var n = o.events.mouseout;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseout handler:", r);
        }
      }), i.indexOf("contextmenu") > -1 && c.on("contextmenu", function(l) {
        var n = o.events.contextmenu;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking contextmenu handler:", r);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking add handler:", r);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking remove handler:", r);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          let r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupopen handler:", r);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          let r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupclose handler:", r);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          let r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipopen handler:", r);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          let r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipclose handler:", r);
        }
      });
    }
    return c;
  }
}, ke = {
  createFeatureGroup(m = [], t, o) {
    const c = L.featureGroup(m, t);
    if (o && o.dotNetRef && o.events) {
      const i = Object.keys(o.events);
      i.indexOf("layeradd") > -1 && c.on("layeradd", function(l) {
        var n = o.events.layeradd;
        try {
          let r = s.LeafletLayerEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking layeradd handler:", r);
        }
      }), i.indexOf("layerremove") > -1 && c.on("layerremove", function(l) {
        var n = o.events.layerremove;
        try {
          let r = s.LeafletLayerEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking layerremove handler:", r);
        }
      }), i.indexOf("click") > -1 && c.on("click", function(l) {
        var n = o.events.click;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking click handler:", r);
        }
      }), i.indexOf("dblclick") > -1 && c.on("dblclick", function(l) {
        var n = o.events.dblclick;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dblclick handler:", r);
        }
      }), i.indexOf("mousedown") > -1 && c.on("mousedown", function(l) {
        var n = o.events.mousedown;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mousedown handler:", r);
        }
      }), i.indexOf("mouseup") > -1 && c.on("mouseup", function(l) {
        var n = o.events.mouseup;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseup handler:", r);
        }
      }), i.indexOf("mouseover") > -1 && c.on("mouseover", function(l) {
        var n = o.events.mouseover;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseover handler:", r);
        }
      }), i.indexOf("mouseout") > -1 && c.on("mouseout", function(l) {
        var n = o.events.mouseout;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseout handler:", r);
        }
      }), i.indexOf("contextmenu") > -1 && c.on("contextmenu", function(l) {
        var n = o.events.contextmenu;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking contextmenu handler:", r);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking add handler:", r);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking remove handler:", r);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          let r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupopen handler:", r);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          let r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupclose handler:", r);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          let r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipopen handler:", r);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          let r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipclose handler:", r);
        }
      }), i.indexOf("click") > -1 && c.on("click", function(l) {
        var n = o.events.click;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking click handler:", r);
        }
      }), i.indexOf("dblclick") > -1 && c.on("dblclick", function(l) {
        var n = o.events.dblclick;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dblclick handler:", r);
        }
      }), i.indexOf("mousedown") > -1 && c.on("mousedown", function(l) {
        var n = o.events.mousedown;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mousedown handler:", r);
        }
      }), i.indexOf("mouseup") > -1 && c.on("mouseup", function(l) {
        var n = o.events.mouseup;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseup handler:", r);
        }
      }), i.indexOf("mouseover") > -1 && c.on("mouseover", function(l) {
        var n = o.events.mouseover;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseover handler:", r);
        }
      }), i.indexOf("mouseout") > -1 && c.on("mouseout", function(l) {
        var n = o.events.mouseout;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking mouseout handler:", r);
        }
      }), i.indexOf("contextmenu") > -1 && c.on("contextmenu", function(l) {
        var n = o.events.contextmenu;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking contextmenu handler:", r);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking add handler:", r);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking remove handler:", r);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          let r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupopen handler:", r);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          let r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking popupclose handler:", r);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          let r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipopen handler:", r);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          let r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking tooltipclose handler:", r);
        }
      });
    }
    return c;
  }
}, ae = {
  createGeoJsonLayer(m, t, o) {
    const c = {
      markersInheritOptions: (t == null ? void 0 : t.markersInheritOptions) ?? !1
    };
    if (t != null && t.interop && t.onEachFeatureEnabled && (c.onEachFeature = function(f, d) {
      const y = s.minimalLayerInfo(d);
      t.interop.invokeMethodAsync("OnEachFeature", f, y);
    }), t != null && t.interop && t.pointToLayerEnabled && (c.pointToLayer = function(f, d) {
      return t.interop.invokeMethodAsync("PointToLayer", f, d).then((y) => {
        console.log("PointToLayer result:", y);
      }), L.marker(d);
    }), t != null && t.interop && t.styleEnabled) {
      const f = /* @__PURE__ */ new Map();
      c.style = function(d) {
        return f.has(d) ? f.get(d) : {};
      }, c.styleCache = f;
    }
    t != null && t.interop && t.coordsToLatLngEnabled && (c.coordsToLatLng = function(f) {
      let d = L.latLng(f[1], f[0], f[2]);
      return t.interop.invokeMethodAsync("CoordsToLatLng", f).then((y) => {
        y && (d = L.latLng(y.lat, y.lng, y.alt));
      }), d;
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
    let r = null, u = null;
    const A = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map();
    function R(f, d = 5e4, y = !1) {
      if (!f)
        return f;
      try {
        const h = JSON.stringify(f);
        if (y && console.log(`Feature size: ${h.length} characters`), h.length <= d)
          return f;
        y && console.warn(`Feature is large (${h.length} chars), creating lightweight version`);
        const S = {
          type: f.type,
          id: f.id,
          properties: f.properties,
          geometry: f.geometry ? {
            type: f.geometry.type
            // Coordinates omitted to reduce size
          } : void 0
        };
        if (y) {
          const e = JSON.stringify(S).length;
          console.log(`Lightweight feature size: ${e} characters (reduced by ${h.length - e})`);
        }
        return S;
      } catch (h) {
        return console.error("Error creating callback feature:", h), f;
      }
    }
    i.createCallbackFeature = R;
    const _ = i.addData.bind(i);
    i.addData = async function(f) {
      let d = f;
      if (t != null && t.interop && t.filterEnabled)
        try {
          t.debugLogging && console.log("Starting async filtering..."), d = await w(f, t.interop, t.debugLogging), t.debugLogging && console.log("Filtering complete, processed data:", d);
        } catch (S) {
          throw console.error("Error during filtering:", S), S;
        }
      if (t != null && t.interop && t.styleEnabled)
        try {
          t.debugLogging && console.log("Starting async styling..."), await J(d, t.interop, t.debugLogging), t.debugLogging && console.log("Styling complete");
        } catch (S) {
          throw console.error("Error during styling:", S), S;
        }
      const y = [], h = i.options.onEachFeature;
      return h && (t != null && t.interop) && t.onEachFeatureEnabled && (i.options.onEachFeature = function(S, e) {
        const a = s.minimalLayerInfo(e), v = t.interop.invokeMethodAsync("OnEachFeature", S, a);
        y.push(v);
      }), t != null && t.debugLogging && console.log("Calling Leaflet addData with:", d), _(d), h && (i.options.onEachFeature = h), y.length > 0 && await Promise.all(y), i;
    };
    async function w(f, d, y = !1) {
      var h, S, e;
      try {
        if (!f)
          return y && console.log("Filter: data is null or undefined, returning as-is"), f;
        if (y && console.log("Filtering GeoJSON data, type:", f.type, "data:", JSON.stringify(f).substring(0, 200)), f.type === "Feature") {
          y && console.log("Filtering single feature:", f.id || "no-id");
          const a = R(f, 5e4, y), v = await d.invokeMethodAsync("Filter", a, null);
          return y && console.log("Filter result for feature:", v), v ? f : { type: "FeatureCollection", features: [] };
        }
        if (f.type === "FeatureCollection") {
          if (!f.features)
            return y && console.log("FeatureCollection has no features property, returning empty collection"), { type: "FeatureCollection", features: [] };
          if (!Array.isArray(f.features))
            return console.error("FeatureCollection.features is not an array:", typeof f.features), { type: "FeatureCollection", features: [] };
          if (y && console.log(`Filtering FeatureCollection with ${f.features.length} features`), f.features.length === 0)
            return y && console.log("FeatureCollection is empty, returning as-is"), f;
          const a = [];
          for (let x = 0; x < f.features.length; x++) {
            const k = f.features[x];
            try {
              y && console.log(`Calling filter for feature ${x}:`, (k == null ? void 0 : k.id) || ((h = k == null ? void 0 : k.properties) == null ? void 0 : h.id) || "no-id", "type:", (S = k == null ? void 0 : k.geometry) == null ? void 0 : S.type);
              const D = R(k, 5e4, y), V = await d.invokeMethodAsync("Filter", D, null);
              y && console.log(`Filter result for feature ${x}:`, V), a.push(V === !0);
            } catch (D) {
              console.error(`Error filtering feature ${x}:`, D), console.error(`Feature ${x} type:`, (e = k == null ? void 0 : k.geometry) == null ? void 0 : e.type), console.error(`Feature ${x} id:`, k == null ? void 0 : k.id);
              try {
                const V = JSON.stringify(k);
                console.error(`Feature ${x} size:`, V.length, "chars"), console.error(`Feature ${x} preview:`, V.substring(0, 500));
              } catch {
                console.error("Could not stringify feature");
              }
              a.push(!0);
            }
          }
          y && console.log("All filter results:", a);
          const v = f.features.filter((x, k) => a[k]);
          return y && console.log(`Filtered from ${f.features.length} to ${v.length} features`), {
            ...f,
            features: v
          };
        }
        return y && console.log("Unknown or unsupported GeoJSON type:", f.type, "returning as-is"), f;
      } catch (a) {
        throw console.error("Exception in filterGeoJsonAsync:", a), console.error("Data that caused error:", f), a;
      }
    }
    async function J(f, d, y = !1) {
      var h, S;
      try {
        if (!f)
          return;
        const e = c.styleCache;
        if (!e) {
          y && console.log("No style cache found, skipping style precomputation");
          return;
        }
        if (y && console.log("Precomputing styles for GeoJSON data, type:", f.type), f.type === "Feature") {
          y && console.log("Computing style for single feature:", f.id || "no-id");
          const a = R(f, 5e4, y), v = await d.invokeMethodAsync("Style", a);
          e.set(f, v || {}), y && console.log("Style computed:", v);
          return;
        }
        if (f.type === "FeatureCollection" && Array.isArray(f.features)) {
          y && console.log(`Computing styles for ${f.features.length} features`);
          for (let a = 0; a < f.features.length; a++) {
            const v = f.features[a];
            try {
              y && console.log(`Computing style for feature ${a}:`, (v == null ? void 0 : v.id) || ((h = v == null ? void 0 : v.properties) == null ? void 0 : h.id) || "no-id");
              const x = R(v, 5e4, y), k = await d.invokeMethodAsync("Style", x);
              e.set(v, k || {}), y && console.log(`Style for feature ${a}:`, k);
            } catch (x) {
              console.error(`Error computing style for feature ${a}:`, x), console.error(`Feature ${a} type:`, (S = v == null ? void 0 : v.geometry) == null ? void 0 : S.type), console.error(`Feature ${a} id:`, v == null ? void 0 : v.id);
              try {
                const k = JSON.stringify(v);
                console.error(`Feature ${a} size:`, k.length, "chars"), console.error(`Feature ${a} preview:`, k.substring(0, 500));
              } catch {
                console.error("Could not stringify feature");
              }
              e.set(v, {});
            }
          }
          y && console.log(`Precomputed styles for ${e.size} features`);
        }
      } catch (e) {
        throw console.error("Exception in precomputeStylesAsync:", e), e;
      }
    }
    if (o && o.dotNetRef && o.events) {
      const f = Object.keys(o.events);
      if (f.indexOf("layeradd") > -1 && i.on("layeradd", function(d) {
        var y = o.events.layeradd;
        try {
          let h = s.LeafletLayerEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking layeradd handler:", h);
        }
      }), f.indexOf("layerremove") > -1 && i.on("layerremove", function(d) {
        var y = o.events.layerremove;
        try {
          let h = s.LeafletLayerEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking layerremove handler:", h);
        }
      }), f.indexOf("featureclicked") > -1 && i.on("click", function(d) {
        var h, S;
        var y = o.events.featureclicked;
        try {
          const e = ((h = d.layer) == null ? void 0 : h.feature) || ((S = d.propagatedFrom) == null ? void 0 : S.feature), a = d.layer || d.propagatedFrom;
          if (e && a) {
            const v = i.createCallbackFeature(e, 5e4, !1), x = {
              ...s.LeafletEventArgs.fromLeaflet(d).toDto(),
              layer: s.minimalLayerInfo(a),
              feature: v
            };
            o.dotNetRef.invokeMethodAsync(y, x);
          }
        } catch (e) {
          console.error("Error invoking featureclicked handler:", e);
        }
      }), (t == null ? void 0 : t.enableFeatureSelection) !== !1 && i.on("click", function(d) {
        var y, h;
        try {
          const S = ((y = d.layer) == null ? void 0 : y.feature) || ((h = d.propagatedFrom) == null ? void 0 : h.feature), e = d.layer || d.propagatedFrom;
          if (!S || !e || e._editingEnabled)
            return;
          const a = i.createCallbackFeature(S, 5e4, !1), v = {
            ...s.LeafletEventArgs.fromLeaflet(d).toDto(),
            layer: s.minimalLayerInfo(e),
            feature: a
          };
          if ((t == null ? void 0 : t.multipleFeatureSelection) === !0)
            if (A.has(e)) {
              const k = A.get(e);
              k && e.setStyle && (C.has(e) && C.delete(e), e.setStyle(k)), A.delete(e), o != null && o.events.featureunselected && o.dotNetRef.invokeMethodAsync(
                o.events.featureunselected,
                v
              );
            } else {
              let k;
              if (C.has(e) ? (k = C.get(e), C.delete(e)) : e.options && (k = {
                color: e.options.color,
                weight: e.options.weight,
                opacity: e.options.opacity,
                fillColor: e.options.fillColor,
                fillOpacity: e.options.fillOpacity,
                dashArray: e.options.dashArray
              }), k && A.set(e, k), e.bringToFront && e.bringToFront(), e.setStyle) {
                const D = (t == null ? void 0 : t.selectedFeatureStyle) || l;
                e.setStyle(D);
              }
              o != null && o.events.featureselected && o.dotNetRef.invokeMethodAsync(
                o.events.featureselected,
                v
              );
            }
          else if (r === e)
            u && e.setStyle && (C.has(e) && C.delete(e), e.setStyle(u)), r = null, u = null, o != null && o.events.featureunselected && o.dotNetRef.invokeMethodAsync(
              o.events.featureunselected,
              v
            );
          else {
            if (r && u && r.setStyle && r.setStyle(u), r = e, C.has(e) ? (u = C.get(e), C.delete(e)) : e.options && (u = {
              color: e.options.color,
              weight: e.options.weight,
              opacity: e.options.opacity,
              fillColor: e.options.fillColor,
              fillOpacity: e.options.fillOpacity,
              dashArray: e.options.dashArray
            }), e.bringToFront && e.bringToFront(), e.setStyle) {
              const k = (t == null ? void 0 : t.selectedFeatureStyle) || l;
              e.setStyle(k);
            }
            o != null && o.events.featureselected && o.dotNetRef.invokeMethodAsync(
              o.events.featureselected,
              v
            );
          }
        } catch (S) {
          console.error("Error handling feature selection:", S);
        }
      }), (t == null ? void 0 : t.enableHoverStyle) !== !1) {
        console.log("Hover enabled, enableHoverStyle value:", t == null ? void 0 : t.enableHoverStyle);
        const d = (t == null ? void 0 : t.hoverStyle) || n;
        i.on("mouseover", function(y) {
          var h, S;
          try {
            const e = ((h = y.layer) == null ? void 0 : h.feature) || ((S = y.propagatedFrom) == null ? void 0 : S.feature), a = y.layer || y.propagatedFrom;
            if (!e || !a || !a.setStyle)
              return;
            if (a.bringToFront && a.bringToFront(), !C.has(a)) {
              if (a.options) {
                const k = {
                  color: a.options.color,
                  weight: a.options.weight,
                  opacity: a.options.opacity,
                  fillColor: a.options.fillColor,
                  fillOpacity: a.options.fillOpacity,
                  dashArray: a.options.dashArray
                };
                C.set(a, k);
              }
              const x = { ...{
                color: a.options.color,
                weight: a.options.weight,
                opacity: a.options.opacity,
                fillColor: a.options.fillColor,
                fillOpacity: a.options.fillOpacity,
                dashArray: a.options.dashArray
              }, ...d };
              a.setStyle(x);
            }
          } catch (e) {
            console.error("Error applying hover style:", e);
          }
        }), i.on("mouseout", function(y) {
          var h, S;
          try {
            const e = ((h = y.layer) == null ? void 0 : h.feature) || ((S = y.propagatedFrom) == null ? void 0 : S.feature), a = y.layer || y.propagatedFrom;
            if (!e || !a || !a.setStyle)
              return;
            if (C.has(a)) {
              const v = C.get(a);
              if ((t == null ? void 0 : t.multipleFeatureSelection) === !0 ? A.has(a) : r === a) {
                const D = (t == null ? void 0 : t.selectedFeatureStyle) || l;
                a.setStyle(D);
              } else v && a.setStyle(v);
              C.delete(a);
            }
          } catch (e) {
            console.error("Error restoring hover style:", e);
          }
        });
      }
      f.indexOf("click") > -1 && i.on("click", function(d) {
        var y = o.events.click;
        try {
          let h = s.LeafletEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking click handler:", h);
        }
      }), f.indexOf("dblclick") > -1 && i.on("dblclick", function(d) {
        var y = o.events.dblclick;
        try {
          let h = s.LeafletEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking dblclick handler:", h);
        }
      }), f.indexOf("mousedown") > -1 && i.on("mousedown", function(d) {
        var y = o.events.mousedown;
        try {
          let h = s.LeafletEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking mousedown handler:", h);
        }
      }), f.indexOf("mouseup") > -1 && i.on("mouseup", function(d) {
        var y = o.events.mouseup;
        try {
          let h = s.LeafletEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking mouseup handler:", h);
        }
      }), f.indexOf("mouseover") > -1 && i.on("mouseover", function(d) {
        var y = o.events.mouseover;
        try {
          let h = s.LeafletEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking mouseover handler:", h);
        }
      }), f.indexOf("mouseout") > -1 && i.on("mouseout", function(d) {
        var y = o.events.mouseout;
        try {
          let h = s.LeafletEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking mouseout handler:", h);
        }
      }), f.indexOf("contextmenu") > -1 && i.on("contextmenu", function(d) {
        var y = o.events.contextmenu;
        try {
          let h = s.LeafletEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking contextmenu handler:", h);
        }
      }), f.indexOf("add") > -1 && i.on("add", function(d) {
        var y = o.events.add;
        try {
          let h = s.LeafletEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking add handler:", h);
        }
      }), f.indexOf("remove") > -1 && i.on("remove", function(d) {
        var y = o.events.remove;
        try {
          let h = s.LeafletEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking remove handler:", h);
        }
      }), f.indexOf("popupopen") > -1 && i.on("popupopen", function(d) {
        var y = o.events.popupopen;
        try {
          let h = s.LeafletPopupEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking popupopen handler:", h);
        }
      }), f.indexOf("popupclose") > -1 && i.on("popupclose", function(d) {
        var y = o.events.popupclose;
        try {
          let h = s.LeafletPopupEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking popupclose handler:", h);
        }
      }), f.indexOf("tooltipopen") > -1 && i.on("tooltipopen", function(d) {
        var y = o.events.tooltipopen;
        try {
          let h = s.LeafletTooltipEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking tooltipopen handler:", h);
        }
      }), f.indexOf("tooltipclose") > -1 && i.on("tooltipclose", function(d) {
        var y = o.events.tooltipclose;
        try {
          let h = s.LeafletTooltipEventArgs.fromLeaflet(d).toDto();
          o.dotNetRef.invokeMethodAsync(y, h);
        } catch (h) {
          console.error("Error invoking tooltipclose handler:", h);
        }
      });
    }
    return i.clearSelection = function() {
      r && u && r.setStyle && r.setStyle(u), r = null, u = null, A.forEach((f, d) => {
        f && d.setStyle && d.setStyle(f);
      }), A.clear(), C.forEach((f, d) => {
        f && d.setStyle && d.setStyle(f);
      }), C.clear();
    }, Object.defineProperty(i, "SelectedFeatures", {
      get: function() {
        return (t == null ? void 0 : t.multipleFeatureSelection) === !0 ? Array.from(A.keys()).map((d) => d.feature).filter((d) => d != null) : r && r.feature ? [r.feature] : [];
      }
    }), m && setTimeout(() => {
      i.addData(m);
    }, 0), i;
  }
}, Ee = {
  createEditableGeoJsonLayer(m, t, o) {
    const c = ae.createGeoJsonLayer(m, t, o);
    let i = !1, l = [], n = null, r = [], u = null, A = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map();
    const R = {
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
    }, w = (t == null ? void 0 : t.drawingStyle) || R, J = (t == null ? void 0 : t.editingStyle) || _, f = (t == null ? void 0 : t.enableSnapping) !== !1, d = (t == null ? void 0 : t.snapDistance) || 15, y = (t == null ? void 0 : t.showDrawingGuides) !== !1, h = (t == null ? void 0 : t.allowDoubleClickFinish) !== !1, S = (t == null ? void 0 : t.minPolygonPoints) || 3, e = (t == null ? void 0 : t.minLinePoints) || 2, a = () => c._map || null, v = (g) => {
      const N = a();
      if (N)
        try {
          const E = N.getContainer();
          g === null || g === "" ? E.style.cursor = "" : E.style.cursor = g;
        } catch (E) {
          console.error("Error setting cursor:", E);
        }
    }, x = (g) => "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(g), k = (t == null ? void 0 : t.addCursor) || "", D = (t == null ? void 0 : t.removeCursor) || "", V = k ? x(k) : null, H = D ? x(D) : null, U = (g) => {
      const N = a();
      if (!N)
        throw new Error("Layer is not added to a map");
      const E = L.circleMarker(g, {
        radius: 6,
        fillColor: "#ff7800",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      });
      return E.addTo(N), E;
    }, G = () => {
      if (r.forEach((g) => {
        const N = a();
        N && N.removeLayer(g);
      }), r = [], u) {
        const g = a();
        g && g.removeLayer(u), u = null;
      }
    }, z = () => {
      const g = a();
      g && (u && g.removeLayer(u), l.length > 0 && (u = L.polyline(l, w), u.addTo(g)));
    }, Q = (g, N) => {
      if (!f) return null;
      const E = N.latLngToContainerPoint(g);
      let O = null, b = d;
      return c.eachLayer((T) => {
        if (T.getLatLngs) {
          const F = T.getLatLngs();
          (Array.isArray(F[0]) ? F[0] : F).forEach((I) => {
            const B = N.latLngToContainerPoint(I), $ = E.distanceTo(B);
            $ < b && (b = $, O = I);
          });
        }
      }), l.forEach((T) => {
        const F = N.latLngToContainerPoint(T), P = E.distanceTo(F);
        P < b && (b = P, O = T);
      }), O;
    };
    c.startEditing = function() {
      i = !0;
      const g = a();
      if (!g) {
        console.error("Cannot start editing: layer not added to map");
        return;
      }
      g.doubleClickZoom.disable();
    }, c.stopEditing = function() {
      i = !1, G(), l = [], n = null;
      const g = a();
      g && g.doubleClickZoom.enable(), v("default");
    }, c.addPolygon = function() {
      if (!i) {
        console.error("Cannot start drawing: editing mode not enabled");
        return;
      }
      G(), l = [], n = "polygon";
      const g = a();
      if (!g) return;
      v("crosshair");
      const N = (O) => {
        if (n !== "polygon") return;
        let b = O.latlng;
        const T = Q(b, g);
        T && (b = T), l.push(b);
        const F = U(b);
        r.push(F), z(), y && l.length === 1 && console.log("Click to add points. Double-click or press Enter to finish.");
      }, E = (O) => {
        n === "polygon" && h && l.length >= S && (O.originalEvent.preventDefault(), c.confirmDrawing());
      };
      g.on("click", N), g.on("dblclick", E), c._drawingHandlers = { onMapClick: N, onMapDblClick: E };
    }, c.addLine = function() {
      if (!i) {
        console.error("Cannot start drawing: editing mode not enabled");
        return;
      }
      G(), l = [], n = "polyline";
      const g = a();
      if (!g) return;
      v("crosshair");
      const N = (O) => {
        if (n !== "polyline") return;
        let b = O.latlng;
        const T = Q(b, g);
        T && (b = T), l.push(b);
        const F = U(b);
        r.push(F), z(), y && l.length === 1 && console.log("Click to add points. Double-click or press Enter to finish.");
      }, E = (O) => {
        n === "polyline" && h && l.length >= e && (O.originalEvent.preventDefault(), c.confirmDrawing());
      };
      g.on("click", N), g.on("dblclick", E), c._drawingHandlers = { onMapClick: N, onMapDblClick: E };
    }, c.confirmDrawing = function() {
      if (!n || l.length === 0) {
        console.warn("No drawing to confirm");
        return;
      }
      const g = n === "polygon" ? S : e;
      if (l.length < g) {
        console.warn(`Need at least ${g} points to complete a ${n}`);
        return;
      }
      const N = l.map((b) => [b.lng, b.lat]);
      n === "polygon" && N.push(N[0]);
      const E = {
        type: "Feature",
        geometry: {
          type: n === "polygon" ? "Polygon" : "LineString",
          coordinates: n === "polygon" ? [N] : N
        },
        properties: {
          created: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
      c.addData(E), o != null && o.dotNetRef && o.events.featurecreated && o.dotNetRef.invokeMethodAsync(
        o.events.featurecreated,
        { feature: E, layer: null }
      );
      const O = a();
      if (O && c._drawingHandlers) {
        const b = c._drawingHandlers;
        O.off("click", b.onMapClick), O.off("dblclick", b.onMapDblClick), delete c._drawingHandlers;
      }
      G(), l = [], n = null, v("default");
    }, c.cancelDrawing = function() {
      const g = a();
      if (g && c._drawingHandlers) {
        const N = c._drawingHandlers;
        g.off("click", N.onMapClick), g.off("dblclick", N.onMapDblClick), delete c._drawingHandlers;
      }
      G(), l = [], n = null, v("default"), o != null && o.dotNetRef && o.events.drawingcancelled && o.dotNetRef.invokeMethodAsync(
        o.events.drawingcancelled
      );
    }, c.editSelectedFeatures = function() {
      const g = c.SelectedFeatures || [];
      if (g.length === 0) {
        console.warn("No features selected for editing");
        return;
      }
      if (!a()) {
        console.error("Cannot edit features: layer not added to map");
        return;
      }
      C.clear(), g.forEach((E) => {
        c.eachLayer((O) => {
          if (O.feature === E && (O instanceof L.Polygon || O instanceof L.Polyline)) {
            const b = O instanceof L.Polygon, T = O.getLatLngs(), P = (b ? T[0] : T).map((B) => ({ lat: B.lat, lng: B.lng }));
            C.set(E, { coords: P, isPolygon: b }), O._currentCursor = "move", O.editing ? O.editing.enable() : X(O);
            const I = O.getElement ? O.getElement() : null;
            I && (I.style.cursor = "move"), A.set(E, O);
          }
        });
      }), v("move");
    }, c.disableEditingFeatures = function() {
      A.forEach((g, N) => {
        g.editing && g.editing.enabled() ? g.editing.disable() : p(g);
      }), A.clear();
    }, c.confirmEditing = function() {
      A.forEach((g, N) => {
        g.editing && g.editing.enabled() ? g.editing.disable() : p(g);
        const E = g instanceof L.Polygon, O = g.getLatLngs(), T = (E ? O[0] : O).map((P) => [P.lng, P.lat]);
        E ? (T.push(T[0]), N.geometry.coordinates = [T]) : N.geometry.coordinates = T;
        const F = g.getElement ? g.getElement() : null;
        F && (F.style.cursor = ""), o != null && o.dotNetRef && o.events.featuremodified && o.dotNetRef.invokeMethodAsync(
          o.events.featuremodified,
          { feature: N, layer: null }
        );
      }), A.clear(), C.clear(), v("default");
    }, c.cancelEditing = function() {
      A.forEach((g, N) => {
        g.editing && g.editing.enabled() ? g.editing.disable() : p(g);
        const E = C.get(N);
        if (E) {
          const { coords: b, isPolygon: T } = E, F = b.map((I) => L.latLng(I.lat, I.lng));
          T ? g.setLatLngs([F]) : g.setLatLngs(F);
          const P = b.map((I) => [I.lng, I.lat]);
          T ? (P.push(P[0]), N.geometry.coordinates = [P]) : N.geometry.coordinates = P;
        }
        const O = g.getElement ? g.getElement() : null;
        O && (O.style.cursor = "");
      }), A.clear(), C.clear(), v("default");
    }, c.deleteSelectedFeatures = async function() {
      const g = c.SelectedFeatures || [];
      if (g.length === 0 || !a()) return;
      if (o != null && o.dotNetRef && o.events.featuredeleting)
        try {
          const O = await o.dotNetRef.invokeMethodAsync(
            o.events.featuredeleting,
            {
              features: g,
              cancel: !1
            }
          );
          if (O && (O.cancel === !0 || O.Cancel === !0))
            return;
        } catch (O) {
          console.error("Error calling featuredeleting event:", O);
          return;
        }
      c.disableEditingFeatures(), g.forEach((O) => {
        c.eachLayer((b) => {
          b.feature === O && (c.removeLayer(b), o != null && o.dotNetRef && o.events.featuredeleted && o.dotNetRef.invokeMethodAsync(
            o.events.featuredeleted,
            { feature: O, layer: null }
          ));
        });
      });
      const E = c.SelectedFeatures;
      E && Array.isArray(E) && E.splice(0, E.length), c.SelectedFeature = null, o != null && o.dotNetRef && o.events.featureunselected && o.dotNetRef.invokeMethodAsync(
        o.events.featureunselected,
        { feature: null, layer: null }
      );
    };
    const X = (g, N) => {
      if (g._editingEnabled) return;
      const E = a();
      if (!E) return;
      const O = g.getLatLngs(), b = g instanceof L.Polygon, T = b ? O[0] : O, F = b ? 3 : 2, P = [], I = () => {
        P.forEach(($) => {
          const Z = a();
          Z && Z.removeLayer($);
        }), P.length = 0, T.forEach(($, Z) => {
          const j = B($, Z);
          P.push(j);
        }), g._vertexMarkers = P;
      }, B = ($, Z) => {
        const j = L.circleMarker($, {
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
        j.addTo(E), j.bringToFront && j.bringToFront();
        const M = j.getElement();
        M && (M.style.cursor = g._currentCursor || "move");
        const ee = (W) => {
          L.DomEvent.stopPropagation(W), L.DomEvent.preventDefault(W), !(T.length <= F) && (T.splice(Z, 1), b ? g.setLatLngs([T]) : g.setLatLngs(T), I());
        };
        return j._deleteHandler = ee, j.on("mousedown", (W) => {
          L.DomEvent.stopPropagation(W), E.dragging && E.dragging.disable();
          const q = (re) => {
            const Y = re.latlng;
            j.setLatLng(Y), T[Z] = Y, b ? g.setLatLngs([T]) : g.setLatLngs(T);
          }, oe = () => {
            E.off("mousemove", q), E.off("mouseup", oe), E.dragging && E.dragging.enable();
          };
          E.on("mousemove", q), E.on("mouseup", oe);
        }), j;
      };
      I(), g._vertexMarkers = P, g._editingEnabled = !0, g._updateVertexMarkers = I, g._coords = T, g._isPolygon = b, g._minVertices = F, g.setStyle(J);
    }, p = (g) => {
      if (!g._editingEnabled) return;
      const N = a();
      if (N && g._vertexMarkers && g._vertexMarkers.forEach((E) => {
        N.removeLayer(E);
      }), g._addVertexClickHandler && (g.off("click", g._addVertexClickHandler), delete g._addVertexClickHandler), delete g._vertexMarkers, delete g._editingEnabled, delete g._updateVertexMarkers, delete g._coords, delete g._isPolygon, delete g._minVertices, g.feature)
        if ((c.SelectedFeatures || []).includes(g.feature) && (t != null && t.selectedFeatureStyle))
          g.setStyle(t.selectedFeatureStyle);
        else {
          const O = (t == null ? void 0 : t.style) || {};
          g.setStyle(O);
        }
    };
    c.setAddVertexMode = function(g) {
      let N = "move";
      g ? V ? (N = `url('${V}') 0 0, crosshair`, v(N)) : (N = "crosshair", v(N)) : (N = "move", v(N)), A.forEach((E) => {
        if (!E._editingEnabled) return;
        E._currentCursor = N;
        const O = E.getElement ? E.getElement() : null;
        if (O && (O.style.cursor = N), E._vertexMarkers && E._vertexMarkers.forEach((b) => {
          const T = b.getElement();
          T && (T.style.cursor = N);
        }), g) {
          const b = (T) => {
            L.DomEvent.stopPropagation(T);
            const F = E._coords, P = E._isPolygon;
            if (!F) return;
            const I = T.latlng;
            let B = 1 / 0, $ = 0;
            for (let Z = 0; Z < F.length; Z++) {
              const j = (Z + 1) % F.length;
              if (!P && j === 0) continue;
              const M = F[Z], ee = F[j], W = te(I, M, ee);
              W < B && (B = W, $ = j);
            }
            F.splice($, 0, I), P ? E.setLatLngs([F]) : E.setLatLngs(F), E._updateVertexMarkers && E._updateVertexMarkers();
          };
          E.on("click", b), E._addVertexClickHandler = b;
        } else
          E._addVertexClickHandler && (E.off("click", E._addVertexClickHandler), delete E._addVertexClickHandler);
      });
    }, c.setRemoveVertexMode = function(g) {
      let N = "move";
      g ? H ? (N = `url('${H}') 0 0, crosshair`, v(N)) : (N = "crosshair", v(N)) : (N = "move", v(N)), A.forEach((E) => {
        if (!E._editingEnabled || !E._vertexMarkers) return;
        E._currentCursor = N;
        const O = E.getElement ? E.getElement() : null;
        O && (O.style.cursor = N), E._vertexMarkers.forEach((b) => {
          const T = b.getElement();
          T && (T.style.cursor = N), g ? b._deleteHandler && b.on("click", b._deleteHandler) : b._deleteHandler && b.off("click", b._deleteHandler);
        });
      });
    }, c.setMoveVertexMode = function(g) {
      if (g) {
        c.setAddVertexMode(!1), c.setRemoveVertexMode(!1);
        const N = "move";
        v(N), A.forEach((E) => {
          if (!E._editingEnabled) return;
          E._currentCursor = N;
          const O = E.getElement ? E.getElement() : null;
          O && (O.style.cursor = N), E._vertexMarkers && E._vertexMarkers.forEach((b) => {
            const T = b.getElement();
            T && (T.style.cursor = N);
          });
        });
      }
    };
    function te(g, N, E) {
      const O = a();
      if (!O) return 1 / 0;
      const b = O.latLngToContainerPoint(g), T = O.latLngToContainerPoint(N), F = O.latLngToContainerPoint(E), P = b.x, I = b.y, B = T.x, $ = T.y, Z = F.x, j = F.y, M = P - B, ee = I - $, W = Z - B, q = j - $, oe = M * W + ee * q, re = W * W + q * q;
      let Y = -1;
      re !== 0 && (Y = oe / re);
      let ne, le;
      Y < 0 ? (ne = B, le = $) : Y > 1 ? (ne = Z, le = j) : (ne = B + Y * W, le = $ + Y * q);
      const ce = P - ne, ie = I - le;
      return Math.sqrt(ce * ce + ie * ie);
    }
    return c;
  }
}, Ae = {
  addLatLng(m, t, o) {
    m.addLatLng(t, o);
  },
  setLatLngs(m, t) {
    m.setLatLngs(t);
  },
  closestLayerPoint(m, t) {
    return m.closestLayerPoint(t);
  }
}, Ne = {
  // placeholder for polygon helper methods
}, Se = {
  setBounds(m, t) {
    m.setBounds(t);
  }
}, xe = {
  createMarker(m, t, o) {
    const c = L.marker(m, t);
    if (o && o.dotNetRef && o.events) {
      const i = Object.keys(o.events);
      i.indexOf("move") > -1 && c.on("move", function(l) {
        var n = o.events.move;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for marker move event", r);
        }
      }), i.indexOf("dragstart") > -1 && c.on("dragstart", function(l) {
        var n = o.events.dragstart;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for marker dragstart event", r);
        }
      }), i.indexOf("movestart") > -1 && c.on("movestart", function(l) {
        var n = o.events.movestart;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for marker movestart event", r);
        }
      }), i.indexOf("drag") > -1 && c.on("drag", function(l) {
        var n = o.events.drag;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for marker drag event", r);
        }
      }), i.indexOf("dragend") > -1 && c.on("dragend", function(l) {
        var n = o.events.dragend;
        try {
          let r = s.LeafletDragEndEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for marker dragend event", r);
        }
      }), i.indexOf("moveend") > -1 && c.on("moveend", function(l) {
        var n = o.events.moveend;
        try {
          let r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for marker moveend event", r);
        }
      }), i.indexOf("click") > -1 && c.on("click", function(l) {
        var n = o.events.click;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event click", u);
        }
      }), i.indexOf("dblclick") > -1 && c.on("dblclick", function(l) {
        var n = o.events.dblclick;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event dblclick", u);
        }
      }), i.indexOf("mousedown") > -1 && c.on("mousedown", function(l) {
        var n = o.events.mousedown;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event mousedown", u);
        }
      }), i.indexOf("mouseup") > -1 && c.on("mouseup", function(l) {
        var n = o.events.mouseup;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event mouseup", u);
        }
      }), i.indexOf("mouseover") > -1 && c.on("mouseover", function(l) {
        var n = o.events.mouseover;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event mouseover", u);
        }
      }), i.indexOf("mouseout") > -1 && c.on("mouseout", function(l) {
        var n = o.events.mouseout;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event mouseout", u);
        }
      }), i.indexOf("contextmenu") > -1 && c.on("contextmenu", function(l) {
        var n = o.events.contextmenu;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event contextmenu", u);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          var r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event add", u);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          var r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event remove", u);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          var r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event popupopen", u);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          var r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event popupclose", u);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          var r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event tooltipopen", u);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          var r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event tooltipclose", u);
        }
      });
    }
    return c;
  }
}, Oe = {
  setLatLng(m, t) {
    m.setLatLng(t);
  },
  setRadius(m, t) {
    m.setRadius(t);
  }
}, De = {
  createPopup(m, t, o) {
    const c = L.popup(m, t);
    if (o && o.dotNetRef && o.events && Object.keys(o.events).indexOf("click") > -1) {
      var i = o.events.click;
      c.on("click", function(n) {
        try {
          let r = s.LeafletMouseEventArgs.fromLeaflet(n).toDto();
          o.dotNetRef.invokeMethodAsync(i, r);
        } catch (r) {
          console.error("Error invoking dotnet handler for popup click event", r);
        }
      });
    }
    return c;
  }
}, be = {
  createTooltip(m, t, o) {
    const c = L.tooltip(m, t);
    if (o && o.dotNetRef && o.events) {
      const i = Object.keys(o.events);
      i.indexOf("contentupdate") > -1 && c.on("contentupdate", function(l) {
        var n = o.events.contentupdate;
        try {
          var r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event contentupdate", u);
        }
      }), i.indexOf("click") > -1 && c.on("click", function(l) {
        var n = o.events.click;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event click", u);
        }
      }), i.indexOf("dblclick") > -1 && c.on("dblclick", function(l) {
        var n = o.events.dblclick;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event dblclick", u);
        }
      }), i.indexOf("mousedown") > -1 && c.on("mousedown", function(l) {
        var n = o.events.mousedown;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event mousedown", u);
        }
      }), i.indexOf("mouseup") > -1 && c.on("mouseup", function(l) {
        var n = o.events.mouseup;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event mouseup", u);
        }
      }), i.indexOf("mouseover") > -1 && c.on("mouseover", function(l) {
        var n = o.events.mouseover;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event mouseover", u);
        }
      }), i.indexOf("mouseout") > -1 && c.on("mouseout", function(l) {
        var n = o.events.mouseout;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event mouseout", u);
        }
      }), i.indexOf("contextmenu") > -1 && c.on("contextmenu", function(l) {
        var n = o.events.contextmenu;
        try {
          var r = s.LeafletMouseEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event contextmenu", u);
        }
      }), i.indexOf("add") > -1 && c.on("add", function(l) {
        var n = o.events.add;
        try {
          var r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event add", u);
        }
      }), i.indexOf("remove") > -1 && c.on("remove", function(l) {
        var n = o.events.remove;
        try {
          var r = s.LeafletEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event remove", u);
        }
      }), i.indexOf("popupopen") > -1 && c.on("popupopen", function(l) {
        var n = o.events.popupopen;
        try {
          var r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event popupopen", u);
        }
      }), i.indexOf("popupclose") > -1 && c.on("popupclose", function(l) {
        var n = o.events.popupclose;
        try {
          var r = s.LeafletPopupEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event popupclose", u);
        }
      }), i.indexOf("tooltipopen") > -1 && c.on("tooltipopen", function(l) {
        var n = o.events.tooltipopen;
        try {
          var r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event tooltipopen", u);
        }
      }), i.indexOf("tooltipclose") > -1 && c.on("tooltipclose", function(l) {
        var n = o.events.tooltipclose;
        try {
          var r = s.LeafletTooltipEventArgs.fromLeaflet(l).toDto();
          o.dotNetRef.invokeMethodAsync(n, r);
        } catch (u) {
          console.error("Error invoking dotnet handler for event tooltipclose", u);
        }
      });
    }
    return c;
  }
};
function Ce(m) {
  var o;
  const t = (o = L.CRS) == null ? void 0 : o[m];
  if (!t) {
    const c = Object.keys(L.CRS || {});
    throw new Error(
      `Unknown CRS '${m}'. Available CRS keys: ${c.join(", ")}`
    );
  }
  return t;
}
class Te extends L.Control {
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
    let u = "", A = "";
    t === "btn-polygon" ? (A = this.controlOptions.polygonTooltip || "Draw new polygon", u = this.controlOptions.polygonIcon || "") : t === "btn-line" ? (A = this.controlOptions.lineTooltip || "Draw new line", u = this.controlOptions.lineIcon || "") : t === "btn-edit" ? (A = this.controlOptions.editTooltip || "Edit selected features", u = this.controlOptions.editIcon || "") : t === "btn-delete" ? (A = this.controlOptions.deleteTooltip || "Delete selected features", u = this.controlOptions.deleteIcon || "") : t === "btn-confirm" ? (A = this.controlOptions.confirmTooltip || "Confirm drawing", u = this.controlOptions.confirmIcon || "") : t === "btn-cancel" ? (A = this.controlOptions.cancelTooltip || "Cancel drawing", u = this.controlOptions.cancelIcon || "") : t === "btn-add-vertex" ? (A = this.controlOptions.addVertexTooltip || "Add vertex", u = this.controlOptions.addVertexIcon || "") : t === "btn-remove-vertex" ? (A = this.controlOptions.removeVertexTooltip || "Remove vertex", u = this.controlOptions.removeVertexIcon || "") : t === "btn-move-vertex" && (A = this.controlOptions.moveVertexTooltip || "Move vertex", u = this.controlOptions.moveVertexIcon || ""), l.innerHTML = u, l.setAttribute("aria-label", A), l.setAttribute("title", A), L.DomEvent.on(l, "click", (C) => {
      L.DomEvent.stopPropagation(C), L.DomEvent.preventDefault(C), o();
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
  create(m, t) {
    return new Te(t);
  },
  remove(m) {
    m.remove();
  },
  setDrawing(m, t) {
    m.setDrawing(t);
  },
  setSelectedCount(m, t) {
    m.setSelectedCount(t);
  },
  setEditing(m, t) {
    m.setEditing(t);
  },
  setAddingVertices(m, t) {
    m.setAddingVertices(t);
  },
  setRemovingVertices(m, t) {
    m.setRemovingVertices(t);
  },
  setMovingVertices(m, t) {
    m.setMovingVertices(t);
  }
};
window.LeafletEditingControl = fe;
const Re = {
  Map: se,
  Layer: de,
  GridLayer: ue,
  TileLayer: ye,
  WmsTileLayer: me,
  ProtobufVectorTileLayer: ge,
  SlicerVectorTileLayer: ve,
  LayerGroup: Le,
  FeatureGroup: ke,
  GeoJsonLayer: ae,
  EditableGeoJsonLayer: Ee,
  Polyline: Ae,
  Polygon: Ne,
  Rectangle: Se,
  Marker: xe,
  CircleMarker: Oe,
  Popup: De,
  Tooltip: be,
  getCrs: Ce,
  LeafletEditingControl: fe
};
typeof window < "u" && (window.LeafletMap = Re);
export {
  Re as LeafletMap,
  Re as default
};
//# sourceMappingURL=leafletMap.js.map
