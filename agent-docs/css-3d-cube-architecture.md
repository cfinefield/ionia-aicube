# Refactor: Pure CSS 3D Cube with HTML Lens Rendering

Replace the Three.js WebGL implementation with a lightweight **pure CSS 3D cube** where each face renders **actual HTML content** instead of canvas-drawn graphics.

## Benefits

- **~98% smaller bundle** — No Three.js, no shaders, no WebGL context
- **Native HTML rendering** — Each lens is real DOM, not canvas drawing
- **Better performance** — CSS transforms are GPU-accelerated
- **Easier maintenance** — Lenses become simple HTML templates

---

## Proposed Changes

### Core Components

#### [NEW] [CSSCube.js](file:///Users/chris/Documents/aicube/src/CSSCube.js)
Pure CSS 3D cube using `transform-style: preserve-3d`. Manages:
- 6 face container elements
- Rotation state and animations via CSS transforms
- Face change events

#### [MODIFY] [main.js](file:///Users/chris/Documents/aicube/src/main.js)
- Remove Three.js imports and setup
- Initialize `CSSCube` instead
- Wire up keyboard/swipe navigation
- Keep lens panel update logic

#### [MODIFY] [style.css](file:///Users/chris/Documents/aicube/src/style.css)
Add:
- `.cube-scene` (perspective container)
- `.cube` (3D transform container)
- `.cube__face` (each face with `rotateY/X` transforms)
- Smooth rotation transitions
- Glassmorphic background without WebGL

#### [MODIFY] [index.html](file:///Users/chris/Documents/aicube/index.html)
- Remove `<canvas id="cube-canvas">`
- Add `.cube-scene > .cube > .cube__face[data-lens="N"]` structure

---

### Lens Conversions

Each lens will export a `renderHTML(data)` method returning an HTML string:

#### [MODIFY] [HumanLens.js](file:///Users/chris/Documents/aicube/src/lenses/HumanLens.js)  
Returns product card HTML (header, image, price, CTA button)

#### [MODIFY] [BrowserAgentLens.js](file:///Users/chris/Documents/aicube/src/lenses/BrowserAgentLens.js)  
Returns DOM tree visualization as styled HTML

#### [MODIFY] [CrawlerLens.js](file:///Users/chris/Documents/aicube/src/lenses/CrawlerLens.js)  
Returns markdown-styled content with code blocks

#### [MODIFY] [TransactionLens.js](file:///Users/chris/Documents/aicube/src/lenses/TransactionLens.js)  
Returns JSON syntax-highlighted view

#### [MODIFY] [PersonaLens.js](file:///Users/chris/Documents/aicube/src/lenses/PersonaLens.js)  
Returns persona-filtered content with relevance highlighting

#### [MODIFY] [ActionLens.js](file:///Users/chris/Documents/aicube/src/lenses/ActionLens.js)  
Returns intent-scope visualization

#### [MODIFY] [LensManager.js](file:///Users/chris/Documents/aicube/src/lenses/LensManager.js)  
Change `renderLens()` to call `renderHTML()` and return string

---

### Cleanup (Delete)

| File | Reason |
|------|--------|
| [Cube.js](file:///Users/chris/Documents/aicube/src/Cube.js) | Three.js-based, replaced by CSSCube |
| [CubeController.js](file:///Users/chris/Documents/aicube/src/CubeController.js) | Three.js rotation logic, replaced |
| [LiquidBackground.js](file:///Users/chris/Documents/aicube/src/LiquidBackground.js) | Shader-based background, replaced with CSS |
| [DesignManager.js](file:///Users/chris/Documents/aicube/src/DesignManager.js) | Canvas texture management, no longer needed |

---

## Verification Plan

### Manual Browser Testing
1. Run `npm run dev`
2. Open http://localhost:5173/
3. Verify:
   - Cube renders with 6 visible faces
   - Arrow keys rotate the cube smoothly
   - Swipe gestures work on touch devices
   - Each face shows distinct HTML content
   - Lens panel updates when face changes
   - No console errors
   - Smooth 60fps rotation animations

> [!NOTE]
> There are no existing automated tests in this project. Verification will be manual visual testing.
