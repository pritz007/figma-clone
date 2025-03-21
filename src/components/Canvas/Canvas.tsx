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
    setActiveTool
  } = useStore();

  console.log('Canvas received from store:', { shapes, selectedShapeId, activeTool });

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });

  // Initialize tool if none selected
  useEffect(() => {
    if (!activeTool) {
      console.log('Setting default tool: rect');
      setActiveTool('rect');
    }
  }, [activeTool, setActiveTool]);

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

  // Main render function
  const renderCanvas = useCallback(() => {
    console.log('Rendering canvas, shapes:', shapes.length);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        ctx.strokeRect(
          shape.x - 5,
          shape.y - 5,
          shape.width + 10,
          shape.height + 10
        );
        ctx.setLineDash([]);
      }
    });

    ctx.restore();
  }, [shapes, selectedShapeId, scale, offset]);

  // Re-render when dependencies change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedShapeId) {
          console.log('Deleting shape:', selectedShapeId);
          deleteShape(selectedShapeId);
          setSelectedShape(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShapeId, deleteShape, setSelectedShape]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offset.x) / scale,
      y: (e.clientY - rect.top - offset.y) / scale,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Mouse down, active tool:', activeTool);
    
    if (activeTool === 'hand') {
      setIsDrawing(true);
      setStartPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!activeTool || activeTool === 'select') {
      // Handle selection
      return;
    }

    const point = getCanvasPoint(e);
    console.log('Starting drawing at point:', point);
    setIsDrawing(true);
    setStartPoint(point);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    if (activeTool === 'hand') {
      const dx = e.clientX - startPoint.x;
      const dy = e.clientY - startPoint.y;
      setOffset((prev: Point) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setStartPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    const point = getCanvasPoint(e);
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
        style={{ 
          cursor: activeTool === 'hand' ? 'grab' : 'default',
          display: 'block', 
          width: '100%', 
          height: '100%'
        }}
      />
    </div>
  );
};

export default Canvas; 