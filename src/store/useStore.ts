import create from 'zustand';
import { SetState, GetState } from 'zustand';

export interface Shape {
  id: string;
  type: 'rect' | 'circle' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  text?: string;
}

interface Layer {
  id: string;
  name: string;
  type: 'shape' | 'group';
  isVisible: boolean;
  isLocked: boolean;
  shapeId?: string;
}

// Define a history state interface to track changes
interface HistoryState {
  shapes: Shape[];
  layers: Layer[];
}

export interface AppState {
  shapes: Shape[];
  layers: Layer[];
  selectedShapeId: string | null;
  selectedLayerId: string | null;
  activeTool: 'select' | 'rect' | 'circle' | 'text' | 'hand' | null;
  
  // History management
  history: HistoryState[];
  currentHistoryIndex: number;
  
  // Actions
  addShape: (shape: Shape) => void;
  updateShape: (id: string, changes: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  setSelectedShape: (id: string | null) => void;
  setSelectedLayer: (id: string | null) => void;
  setActiveTool: (tool: 'select' | 'rect' | 'circle' | 'text' | 'hand' | null) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  
  // Layer management
  moveShapeUp: (id: string) => void;
  moveShapeDown: (id: string) => void;
  
  // Export actions
  exportToImage: () => void;
}

const useStore = create<AppState>((set: SetState<AppState>, get: GetState<AppState>) => {
  // Helper function to save current state to history
  const saveToHistory = () => {
    const { shapes, layers, history, currentHistoryIndex } = get();
    
    // Remove any future history if we've gone back and then made changes
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    
    // Add current state to history
    newHistory.push({ shapes: JSON.parse(JSON.stringify(shapes)), layers });
    
    // Update history state
    set({
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1,
    });
  };
  
  return {
    shapes: [],
    layers: [],
    selectedShapeId: null,
    selectedLayerId: null,
    activeTool: null,
    
    history: [{ shapes: [], layers: [] }], // Initial empty state
    currentHistoryIndex: 0,
    
    addShape: (shape: Shape) => {
      set((state: AppState) => ({
        shapes: [...state.shapes, shape],
      }));
      
      // Save to history after shape is added
      saveToHistory();
    },
    
    updateShape: (id: string, changes: Partial<Shape>) => {
      set((state: AppState) => ({
        shapes: state.shapes.map((shape) =>
          shape.id === id ? { ...shape, ...changes } : shape
        ),
      }));
      
      // Save to history after shape is updated
      saveToHistory();
    },
    
    deleteShape: (id: string) => {
      set((state: AppState) => ({
        shapes: state.shapes.filter((s) => s.id !== id),
        selectedShapeId:
          state.selectedShapeId === id ? null : state.selectedShapeId,
      }));
      
      // Save to history after shape is deleted
      saveToHistory();
    },
    
    setSelectedShape: (id: string | null) =>
      set(() => ({
        selectedShapeId: id,
      })),
    
    setSelectedLayer: (id: string | null) =>
      set(() => ({
        selectedLayerId: id,
      })),
    
    setActiveTool: (tool: 'select' | 'rect' | 'circle' | 'text' | 'hand' | null) =>
      set(() => ({
        activeTool: tool,
      })),
    
    toggleLayerVisibility: (id: string) =>
      set((state: AppState) => {
        const { shapes } = state;
        console.log('Toggling visibility for layer', id);
        return { shapes };
      }),
    
    toggleLayerLock: (id: string) =>
      set((state: AppState) => {
        const { shapes } = state;
        console.log('Toggling lock for layer', id);
        return { shapes };
      }),
    
    // Layer management
    moveShapeUp: (id: string) => {
      set((state: AppState) => {
        const shapes = [...state.shapes];
        const index = shapes.findIndex(shape => shape.id === id);
        
        if (index !== -1 && index < shapes.length - 1) {
          [shapes[index], shapes[index + 1]] = [shapes[index + 1], shapes[index]];
        }
        
        return { shapes };
      });
      
      // Save to history after shape is moved
      saveToHistory();
    },
      
    moveShapeDown: (id: string) => {
      set((state: AppState) => {
        const shapes = [...state.shapes];
        const index = shapes.findIndex(shape => shape.id === id);
        
        if (index > 0 && index !== -1) {
          [shapes[index], shapes[index - 1]] = [shapes[index - 1], shapes[index]];
        }
        
        return { shapes };
      });
      
      // Save to history after shape is moved
      saveToHistory();
    },
      
    // History actions
    undo: () => {
      const { currentHistoryIndex, history } = get();
      
      if (currentHistoryIndex > 0) {
        const newIndex = currentHistoryIndex - 1;
        const previousState = history[newIndex];
        
        set({
          shapes: JSON.parse(JSON.stringify(previousState.shapes)),
          currentHistoryIndex: newIndex,
        });
      }
    },
    
    redo: () => {
      const { currentHistoryIndex, history } = get();
      
      if (currentHistoryIndex < history.length - 1) {
        const newIndex = currentHistoryIndex + 1;
        const nextState = history[newIndex];
        
        set({
          shapes: JSON.parse(JSON.stringify(nextState.shapes)),
          currentHistoryIndex: newIndex,
        });
      }
    },
      
    // Export to image
    exportToImage: () => {
      const { shapes } = get();
      
      // Create a temporary canvas and get its 2D context
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }
      
      // Set canvas size
      canvas.width = 1200;
      canvas.height = 800;
      
      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw all shapes
      shapes.forEach((shape: Shape) => {
        ctx.beginPath();
        ctx.fillStyle = shape.fill;
        ctx.strokeStyle = shape.stroke;
        ctx.lineWidth = shape.strokeWidth;
        
        switch (shape.type) {
          case 'rect':
            ctx.rect(shape.x, shape.y, shape.width, shape.height);
            break;
          case 'circle':
            const radius = Math.abs(shape.width) / 2;
            ctx.arc(
              shape.x + radius,
              shape.y + radius,
              radius,
              0,
              Math.PI * 2
            );
            break;
          case 'text':
            if (shape.text) {
              ctx.font = '20px Arial';
              ctx.fillText(shape.text, shape.x, shape.y);
            }
            break;
        }
        
        ctx.fill();
        ctx.stroke();
      });
      
      // Convert canvas to data URL and trigger download
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'figma-design.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        console.error('Error exporting image:', e);
      }
    },
  };
});

export default useStore; 