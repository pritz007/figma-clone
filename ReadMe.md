# Figma Clone Documentation

## 1. Project Overview

This project is a lightweight clone of Figma, a popular design tool, built with React, TypeScript, and HTML5 Canvas. The application enables users to draw shapes, manipulate them, and organize them through layers.

### Key Features
- Drawing tools (Rectangle, Circle, Text)
- Canvas operations (Pan, Zoom)
- Layer management
- Shape customization (Color, Stroke width)
- Selection and deletion

## 2. Setup and Installation

### Prerequisites
- Node.js version 14 or compatible
- npm package manager

### Installation Steps
1. Clone the repository:
```bash
git clone [repository-url]
cd figma-clone
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Access the application at http://localhost:3000

## 3. Project Architecture

The project uses a modern React application structure with TypeScript for type safety.

### Technology Stack
- **React 17**: UI library
- **TypeScript**: For type safety
- **Zustand**: For state management
- **HTML5 Canvas API**: For drawing operations
- **Vite**: As the build tool and development server

### Folder Structure
```
figma-clone/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   └── Canvas.tsx
│   │   ├── Sidebar/
│   │   │   └── Sidebar.tsx
│   │   └── Toolbar/
│   │       └── Toolbar.tsx
│   ├── store/
│   │   └── useStore.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 4. Component Documentation

### App.tsx
The root component that organizes the layout and coordinates the other components. It connects to the store and passes data and functions to the child components.

### Components/Canvas/Canvas.tsx
The main drawing area where shapes are created and manipulated.

**Key Features:**
- Renders an HTML Canvas element
- Handles mouse events for drawing shapes
- Manages zoom and pan operations
- Renders all shapes from the store
- Handles shape selection

**Implementation Details:**
- Uses `useRef` to access the Canvas DOM element
- Uses `useCallback` for optimized rendering functions
- Implements mouse event handlers for drawing operations
- Manages canvas transformations (scale, translate)

### Components/Toolbar/Toolbar.tsx
Contains tools for shape creation and property manipulation.

**Key Features:**
- Tool selection buttons (Rectangle, Circle, Text, Hand, Select)
- Color picker for shape fill
- Stroke width selector

**Implementation Details:**
- Uses inline styles for UI elements
- Connects to the store to update the active tool
- Handles shape property updates when a shape is selected

### Components/Sidebar/Sidebar.tsx
Displays the layer hierarchy and allows for layer operations.

**Key Features:**
- Lists all layers (shapes)
- Allows selection of layers
- Toggle layer visibility
- Toggle layer lock status

**Implementation Details:**
- Displays a message when no layers exist
- Renders layer controls (visibility, lock)
- Connects to the store for layer operations

## 5. State Management

The application uses Zustand for state management, which provides a simple yet powerful way to manage global state.

### Store Structure (useStore.ts)
```typescript
interface AppState {
  shapes: Shape[];
  layers: Layer[];
  selectedShapeId: string | null;
  selectedLayerId: string | null;
  activeTool: string | null;
  
  // Actions
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  setSelectedShape: (id: string | null) => void;
  setSelectedLayer: (id: string | null) => void;
  setActiveTool: (tool: string | null) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
}
```

### Key State Elements
- **shapes**: Array of all shapes on the canvas
- **layers**: Array of layer metadata corresponding to shapes
- **selectedShapeId**: Currently selected shape
- **activeTool**: Currently selected tool
- **Actions**: Functions to modify the state

## 6. Drawing Implementation

The drawing functionality is implemented using the HTML5 Canvas API.

### Shape Creation Process
1. User selects a drawing tool
2. User clicks and drags on the canvas
3. A shape preview is rendered during drag
4. On mouse release, the shape is added to the store
5. The canvas re-renders to include the new shape

### Shape Types
- **Rectangle**: Drawn using `ctx.rect()`
- **Circle**: Drawn using `ctx.arc()`
- **Text**: Rendered using `ctx.fillText()`

### Canvas Transformations
- **Zoom**: Implemented with `ctx.scale()`
- **Pan**: Implemented with `ctx.translate()`

## 7. Technical Challenges and Solutions

### Challenge 1: Canvas Resize and Initialization
**Solution**: Implemented a resize handler that updates canvas dimensions based on container size and re-renders content.

### Challenge 2: React Integration with Canvas
**Solution**: Used refs to access the canvas DOM element and implemented a clean rendering cycle with useCallback and useEffect.

### Challenge 3: Styled-components Integration
**Solution**: Due to compatibility issues, switched to inline styles for all component styling.

### Challenge 4: Node.js Version Compatibility
**Solution**: Adjusted package dependencies and configuration to ensure compatibility with Node.js version 14.

## 8. Future Improvements

1. **Enhanced Shape Selection**: Implement better shape selection with transform handles
2. **Group Operations**: Add ability to group shapes
3. **Advanced Text Editing**: Implement rich text editing
4. **Undo/Redo**: Add operation history and undo/redo functionality
5. **Export Options**: Enable exporting designs as images or SVGs
6. **Additional Shape Types**: Add more shape types like polygon, line, etc.
7. **Alignment Tools**: Add alignment and distribution tools
8. **Grid and Guides**: Implement snap-to-grid and guide lines

## 9. Conclusion

This Figma clone demonstrates the implementation of key design tool features using web technologies. While it provides basic functionality, it serves as a foundation for more advanced features. The modular architecture allows for easy extension and enhancement of capabilities.

