import create from 'zustand';
import { SetState } from 'zustand';

interface Shape {
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

interface AppState {
  shapes: Shape[];
  layers: Layer[];
  selectedShapeId: string | null;
  selectedLayerId: string | null;
  activeTool: string | null;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  setSelectedShape: (id: string | null) => void;
  setSelectedLayer: (id: string | null) => void;
  setActiveTool: (tool: string | null) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
}

const useStore = create<AppState>((set: SetState<AppState>) => ({
  shapes: [],
  layers: [],
  selectedShapeId: null,
  selectedLayerId: null,
  activeTool: null,

  addShape: (shape: Shape) =>
    set((state: AppState) => ({
      shapes: [...state.shapes, shape],
      layers: [
        ...state.layers,
        {
          id: `layer-${shape.id}`,
          name: `${shape.type} ${state.shapes.length + 1}`,
          type: 'shape',
          isVisible: true,
          isLocked: false,
          shapeId: shape.id,
        },
      ],
    })),

  updateShape: (id: string, updates: Partial<Shape>) =>
    set((state: AppState) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? { ...shape, ...updates } : shape
      ),
    })),

  deleteShape: (id: string) =>
    set((state: AppState) => ({
      shapes: state.shapes.filter((shape) => shape.id !== id),
      layers: state.layers.filter((layer) => layer.shapeId !== id),
    })),

  setSelectedShape: (id: string | null) =>
    set(() => ({
      selectedShapeId: id,
    })),

  setSelectedLayer: (id: string | null) =>
    set(() => ({
      selectedLayerId: id,
    })),

  setActiveTool: (tool: string | null) =>
    set(() => ({
      activeTool: tool,
    })),

  toggleLayerVisibility: (id: string) =>
    set((state: AppState) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, isVisible: !layer.isVisible } : layer
      ),
    })),

  toggleLayerLock: (id: string) =>
    set((state: AppState) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, isLocked: !layer.isLocked } : layer
      ),
    })),
}));

export default useStore; 