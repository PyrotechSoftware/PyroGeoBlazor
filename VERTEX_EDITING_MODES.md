# Vertex Editing Modes Implementation

## Overview
Implementing ArcGIS Pro-style vertex editing with separate mode buttons:
- **Edit Mode**: Drag vertices to move them
- **Add Vertex Mode**: Click directly on line/edge to add new vertices
- **Remove Vertex Mode**: Click on vertices to remove them

## Button Layout

### Normal Mode (no selection)
- ✅ Polygon, Line
- ❌ Edit, Delete, Add Vertex, Remove Vertex, Confirm, Cancel

### Feature Selected (not editing)
- ✅ Polygon, Line, Edit, Delete
- ❌ Add Vertex, Remove Vertex, Confirm, Cancel

### Editing Mode (Edit button clicked)
- ❌ Polygon, Line, Edit, Delete
- ✅ Add Vertex, Remove Vertex, Confirm, Cancel
- Vertices shown as draggable red markers
- No automatic click behaviors

### Add Vertex Mode (Add Vertex button clicked while editing)
- ❌ Polygon, Line, Edit, Delete, Remove Vertex
- ✅ **Add Vertex (highlighted)**, Confirm, Cancel
- Click anywhere on the polygon/line edge → new vertex added at clicked location
- Automatically finds nearest edge and inserts vertex there

### Remove Vertex Mode (Remove Vertex button clicked while editing)
- ❌ Polygon, Line, Edit, Delete, Add Vertex
- ✅ **Remove Vertex (highlighted)**, Confirm, Cancel
- Click vertex marker → removes vertex (respects minimum)

## Implementation Status
- [x] C# event handlers added
- [x] C# state tracking
- [x] TypeScript button rendering
- [x] TypeScript mode switching
- [x] editableGeoJsonLayer mode handlers
- [x] Icons for new buttons
- [x] Click-on-line to add vertex (no midpoint markers)
- [x] Click-on-vertex to remove (only in Remove mode)

## Implementation Details

### Add Vertex Mode
- Adds click handler directly to the polygon/polyline layer
- Calculates distance from click point to all edges
- Finds nearest edge and inserts vertex at appropriate index
- Automatically updates vertex markers

### Remove Vertex Mode
- Enables click handlers on vertex markers
- Respects minimum vertex count (3 for polygons, 2 for lines)
- Shows warning if attempting to delete below minimum

### Default Edit Mode
- Vertices are draggable by default
- No deletion or addition until mode is activated
- Clean, uncluttered interface
