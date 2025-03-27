import React, { useEffect, useRef, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useStore from '../../store/useStore';

interface Point {
  x: number;
  y: number;
}

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

const Canvas: React.FC = () => {
  console.log('Canvas component rendering');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    shapes,
    selectedShapeId,
    activeTool,
    addShape,
    updateShape,
    deleteShape,
    setSelectedShape,
    setActiveTool,
    undo,
    redo
  } = useStore();

  console.log('Canvas received from store:', { shapes, selectedShapeId, activeTool });

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [selectionDragStart, setSelectionDragStart] = useState<Point | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Initialize tool if none selected
  useEffect(() => {
    if (!activeTool) {
      console.log('Setting default tool: rect');
      setActiveTool('rect');
    }
  }, [activeTool, setActiveTool]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
        console.log('Undo triggered via keyboard');
      }
      
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) || 
          (e.key === 'y' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        redo();
        console.log('Redo triggered via keyboard');
      }
      
      // Delete selected shape
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedShapeId) {
          console.log('Deleting shape:', selectedShapeId);
          deleteShape(selectedShapeId);
          setSelectedShape(null);
        }
      }
      
      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedShape(null);
        console.log('Deselected shapes via Escape key');
      }
      
      // Toggle grid: G
      if (e.key === 'g') {
        setShowGrid(prev => !prev);
        console.log('Grid toggled:', !showGrid);
      }
      
      // Toggle snap to grid: Shift+G
      if (e.key === 'G' && e.shiftKey) {
        setSnapToGrid(prev => !prev);
        console.log('Snap to grid toggled:', !snapToGrid);
      }
      
      // Switch tools with keyboard shortcuts
      switch (e.key) {
        case 'v': // Select tool
          setActiveTool('select');
          break;
        case 'r': // Rectangle tool
          setActiveTool('rect');
          break;
        case 'c': // Circle tool
          setActiveTool('circle');
          break;
        case 't': // Text tool
          setActiveTool('text');
          break;
        case 'h': // Hand tool
          setActiveTool('hand');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShapeId, deleteShape, setSelectedShape, undo, redo, setActiveTool, showGrid, snapToGrid]);

  // Reset canvas size when window resizes
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      console.log('Canvas resized:', canvas.width, canvas.height);
      renderCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if a point is inside a shape
  const isPointInShape = useCallback((point: Point, shape: Shape): boolean => {
    switch (shape.type) {
      case 'rect':
        return (
          point.x >= shape.x &&
          point.x <= shape.x + shape.width &&
          point.y >= shape.y &&
          point.y <= shape.y + shape.height
        );
      case 'circle':
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const radius = Math.abs(shape.width) / 2;
        const distance = Math.sqrt(
          Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
        );
        return distance <= radius;
      case 'text':
        // Simplified bounding box for text
        return (
          point.x >= shape.x &&
          point.x <= shape.x + shape.width &&
          point.y >= shape.y - 20 && // Text height approximation
          point.y <= shape.y
        );
      default:
        return false;
    }
  }, []);

  // Find shape under a point
  const findShapeAtPoint = useCallback((point: Point): string | null => {
    // Reverse to check top-most shapes first (last in array)
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (isPointInShape(point, shape)) {
        return shape.id;
      }
    }
    return null;
  }, [shapes, isPointInShape]);
  
  // Snap a point to the grid
  const snapPointToGrid = useCallback((point: Point): Point => {
    if (!snapToGrid) return point;
    
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  }, [gridSize, snapToGrid]);

  // Draw grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showGrid) return;
    
    ctx.save();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    
    // Apply canvas transformations
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);
    
    // Calculate grid bounds based on current view
    const visibleWidthInCanvas = width / scale;
    const visibleHeightInCanvas = height / scale;
    const startX = Math.floor((-offset.x / scale) / gridSize) * gridSize;
    const startY = Math.floor((-offset.y / scale) / gridSize) * gridSize;
    const endX = startX + visibleWidthInCanvas + gridSize;
    const endY = startY + visibleHeightInCanvas + gridSize;
    
    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
    
    ctx.restore();
  }, [showGrid, gridSize, offset, scale]);

  // Main render function
  const renderCanvas = useCallback(() => {
    console.log('Rendering canvas, shapes:', shapes.length);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw shapes
    shapes.forEach((shape: Shape) => {
      ctx.beginPath();
      ctx.strokeStyle = shape.stroke;
      ctx.fillStyle = shape.fill;
      ctx.lineWidth = shape.strokeWidth;

      switch (shape.type) {
        case 'rect':
          ctx.rect(shape.x, shape.y, shape.width, shape.height);
          break;
        case 'circle':
          ctx.arc(
            shape.x + shape.width / 2,
            shape.y + shape.height / 2,
            Math.abs(shape.width) / 2,
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

      // Draw selection
      if (shape.id === selectedShapeId) {
        ctx.strokeStyle = '#00f';
        ctx.setLineDash([5, 5]);
        
        // Draw selection based on shape type
        switch (shape.type) {
          case 'rect':
            ctx.strokeRect(
              shape.x - 5,
              shape.y - 5,
              shape.width + 10,
              shape.height + 10
            );
            break;
          case 'circle':
            ctx.beginPath();
            ctx.arc(
              shape.x + shape.width / 2,
              shape.y + shape.height / 2,
              Math.abs(shape.width) / 2 + 5,
              0,
              Math.PI * 2
            );
            ctx.stroke();
            break;
          case 'text':
            // Text selection box
            const textWidth = ctx.measureText(shape.text || '').width;
            ctx.strokeRect(
              shape.x - 5,
              shape.y - 25,
              textWidth + 10,
              30
            );
            break;
        }
        
        // Draw handles for resizing
        ctx.setLineDash([]);
        ctx.fillStyle = '#00f';
        
        // Draw resize handles based on shape type
        if (shape.type === 'rect') {
          // Corner handles
          [
            { x: shape.x - 5, y: shape.y - 5 },                        // Top-left
            { x: shape.x + shape.width - 5, y: shape.y - 5 },          // Top-right
            { x: shape.x - 5, y: shape.y + shape.height - 5 },         // Bottom-left
            { x: shape.x + shape.width - 5, y: shape.y + shape.height - 5 }, // Bottom-right
          ].forEach(handle => {
            ctx.fillRect(handle.x, handle.y, 10, 10);
          });
        } else if (shape.type === 'circle') {
          // Handle at top, right, bottom, left of circle
          const cx = shape.x + shape.width / 2;
          const cy = shape.y + shape.height / 2;
          const radius = Math.abs(shape.width) / 2;
          
          [
            { x: cx, y: cy - radius - 5 },       // Top
            { x: cx + radius - 5, y: cy },       // Right
            { x: cx, y: cy + radius - 5 },       // Bottom
            { x: cx - radius - 5, y: cy },       // Left
          ].forEach(handle => {
            ctx.fillRect(handle.x, handle.y, 10, 10);
          });
        }
      }
    });

    ctx.restore();
  }, [shapes, selectedShapeId, scale, offset, drawGrid]);

  // Re-render when dependencies change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: (e.clientX - rect.left - offset.x) / scale,
      y: (e.clientY - rect.top - offset.y) / scale,
    };
    
    return snapToGrid ? snapPointToGrid(point) : point;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Mouse down, active tool:', activeTool);
    const point = getCanvasPoint(e);
    
    if (activeTool === 'hand') {
      setIsDrawing(true);
      setStartPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (activeTool === 'select') {
      const shapeId = findShapeAtPoint(point);
      
      if (shapeId) {
        setSelectedShape(shapeId);
        setIsDraggingSelection(true);
        setSelectionDragStart(point);
      } else {
        setSelectedShape(null);
      }
      return;
    }

    console.log('Starting drawing at point:', point);
    setIsDrawing(true);
    setStartPoint(point);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && !isDraggingSelection) return;
    const point = getCanvasPoint(e);

    if (activeTool === 'hand' && startPoint) {
      const dx = e.clientX - startPoint.x;
      const dy = e.clientY - startPoint.y;
      setOffset((prev: Point) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setStartPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Handle shape dragging when selection tool is active
    if (activeTool === 'select' && isDraggingSelection && selectionDragStart && selectedShapeId) {
      const dx = point.x - selectionDragStart.x;
      const dy = point.y - selectionDragStart.y;
      
      const selectedShape = shapes.find(shape => shape.id === selectedShapeId);
      if (selectedShape) {
        // If snap to grid is enabled, snap the new position
        const newPosition = snapToGrid ? 
          snapPointToGrid({ x: selectedShape.x + dx, y: selectedShape.y + dy }) : 
          { x: selectedShape.x + dx, y: selectedShape.y + dy };
        
        updateShape(selectedShapeId, newPosition);
        
        setSelectionDragStart(point);
      }
      return;
    }

    if (!startPoint) return;
    
    const width = point.x - startPoint.x;
    const height = point.y - startPoint.y;

    // Update the current shape being drawn
    const newShape: Shape = {
      id: uuidv4(),
      type: activeTool as 'rect' | 'circle' | 'text',
      x: startPoint.x,
      y: startPoint.y,
      width,
      height,
      fill: '#00ff00',
      stroke: '#000000',
      strokeWidth: 2,
      text: activeTool === 'text' ? 'Double click to edit' : undefined,
    };

    // Update the canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw existing shapes
    shapes.forEach((shape: Shape) => {
      ctx.beginPath();
      ctx.strokeStyle = shape.stroke;
      ctx.fillStyle = shape.fill;
      ctx.lineWidth = shape.strokeWidth;

      switch (shape.type) {
        case 'rect':
          ctx.rect(shape.x, shape.y, shape.width, shape.height);
          break;
        case 'circle':
          ctx.arc(
            shape.x + shape.width / 2,
            shape.y + shape.height / 2,
            Math.abs(shape.width) / 2,
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

    // Draw the current shape
    ctx.beginPath();
    ctx.strokeStyle = newShape.stroke;
    ctx.fillStyle = newShape.fill;
    ctx.lineWidth = newShape.strokeWidth;

    switch (newShape.type) {
      case 'rect':
        ctx.rect(newShape.x, newShape.y, newShape.width, newShape.height);
        break;
      case 'circle':
        ctx.arc(
          newShape.x + newShape.width / 2,
          newShape.y + newShape.height / 2,
          Math.abs(newShape.width) / 2,
          0,
          Math.PI * 2
        );
        break;
      case 'text':
        if (newShape.text) {
          ctx.font = '20px Arial';
          ctx.fillText(newShape.text, newShape.x, newShape.y);
        }
        break;
    }

    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Mouse up, drawing:', isDrawing);
    
    if (isDraggingSelection) {
      setIsDraggingSelection(false);
      setSelectionDragStart(null);
      return;
    }
    
    if (!isDrawing || !startPoint) return;

    if (activeTool === 'hand') {
      setIsDrawing(false);
      setStartPoint(null);
      return;
    }

    const point = getCanvasPoint(e);
    const width = point.x - startPoint.x;
    const height = point.y - startPoint.y;

    if (Math.abs(width) > 5 && Math.abs(height) > 5) {
      const newShape: Shape = {
        id: uuidv4(),
        type: activeTool as 'rect' | 'circle' | 'text',
        x: startPoint.x,
        y: startPoint.y,
        width,
        height,
        fill: '#00ff00',
        stroke: '#000000',
        strokeWidth: 2,
        text: activeTool === 'text' ? 'Double click to edit' : undefined,
      };

      console.log('Adding new shape:', newShape);
      addShape(newShape);
      
      // Auto-select the newly created shape
      setSelectedShape(newShape.id);
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY;
    const scaleFactor = delta > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(10, scale * scaleFactor));
    console.log('Zooming, scale:', newScale);
    setScale(newScale);
  };
  
  // Handle double click for text editing
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    const shapeId = findShapeAtPoint(point);
    
    if (shapeId) {
      const shape = shapes.find(s => s.id === shapeId);
      
      if (shape && shape.type === 'text') {
        // Prompt for new text
        const newText = prompt('Enter text:', shape.text);
        if (newText !== null) {
          updateShape(shapeId, { text: newText });
        }
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        style={{ 
          cursor: activeTool === 'hand' ? 'grab' : 'default',
          display: 'block', 
          width: '100%', 
          height: '100%'
        }}
      />
      
      {/* Grid Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <input 
            type="checkbox" 
            id="showGrid" 
            checked={showGrid} 
            onChange={() => setShowGrid(!showGrid)} 
          />
          <label htmlFor="showGrid" style={{ marginLeft: '4px' }}>Show Grid</label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <input 
            type="checkbox" 
            id="snapToGrid" 
            checked={snapToGrid} 
            onChange={() => setSnapToGrid(!snapToGrid)} 
          />
          <label htmlFor="snapToGrid" style={{ marginLeft: '4px' }}>Snap to Grid</label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label htmlFor="gridSize" style={{ marginRight: '4px' }}>Grid Size:</label>
          <input 
            type="range" 
            id="gridSize" 
            min="5" 
            max="50" 
            value={gridSize} 
            onChange={(e) => setGridSize(Number(e.target.value))} 
            style={{ width: '80px' }}
          />
          <span style={{ marginLeft: '4px' }}>{gridSize}px</span>
        </div>
      </div>
      
      {/* Keyboard shortcuts info overlay */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        lineHeight: '1.4',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Keyboard Shortcuts:</div>
        <div>V: Select tool</div>
        <div>R: Rectangle tool</div>
        <div>C: Circle tool</div>
        <div>T: Text tool</div>
        <div>H: Hand tool</div>
        <div>G: Toggle grid</div>
        <div>Shift+G: Toggle snap</div>
        <div>Ctrl+Z: Undo</div>
        <div>Ctrl+Shift+Z: Redo</div>
        <div>Delete: Remove shape</div>
        <div>Esc: Deselect</div>
      </div>
    </div>
  );
};

export default Canvas; 