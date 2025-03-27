import React, { useState } from 'react';
import useStore from '../../store/useStore';

interface ToolbarProps {
  className?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({ className = '' }) => {
  const { 
    activeTool, 
    setActiveTool, 
    selectedShapeId, 
    shapes,
    updateShape,
    setSelectedShape,
    undo,
    redo,
    exportToImage,
    history,
    currentHistoryIndex,
    deleteShape,
    moveShapeUp,
    moveShapeDown
  } = useStore();

  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#00ff00');
  
  // Check if undo and redo actions are possible
  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < history.length - 1;
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    
    if (selectedShapeId) {
      updateShape(selectedShapeId, { fill: newColor });
    }
  };
  
  const handleStrokeWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value);
    
    if (selectedShapeId) {
      updateShape(selectedShapeId, { strokeWidth: newWidth });
    }
  };
  
  const selectedShape = shapes.find(shape => shape.id === selectedShapeId);
  
  const toggleLayersPanel = () => {
    setShowLayersPanel(!showLayersPanel);
  };

  return (
    <div className={`toolbar ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
      backgroundColor: '#f0f0f0',
      borderRight: '1px solid #ccc',
      height: '100%',
      width: '60px',
      position: 'relative',
      overflow: 'visible'
    }}>
      <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => setActiveTool('select')}
          style={{
            backgroundColor: activeTool === 'select' ? '#ccc' : '#fff',
            padding: '8px',
            border: '1px solid #aaa',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          title="Select (V)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l8 16l2-8l8-2z" />
          </svg>
        </button>

        <button
          onClick={() => setActiveTool('rect')}
          style={{
            backgroundColor: activeTool === 'rect' ? '#ccc' : '#fff',
            padding: '8px',
            border: '1px solid #aaa',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          title="Rectangle (R)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="4" width="16" height="16" />
          </svg>
        </button>

        <button
          onClick={() => setActiveTool('circle')}
          style={{
            backgroundColor: activeTool === 'circle' ? '#ccc' : '#fff',
            padding: '8px',
            border: '1px solid #aaa',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          title="Circle (C)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8" />
          </svg>
        </button>

        <button
          onClick={() => setActiveTool('text')}
          style={{
            backgroundColor: activeTool === 'text' ? '#ccc' : '#fff',
            padding: '8px',
            border: '1px solid #aaa',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          title="Text (T)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 10h4M3 10h4M12 3v18M8 3h8" />
          </svg>
        </button>

        <button
          onClick={() => setActiveTool('hand')}
          style={{
            backgroundColor: activeTool === 'hand' ? '#ccc' : '#fff',
            padding: '8px',
            border: '1px solid #aaa',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          title="Hand (H)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 12.5v-2.5a2 2 0 0 0 -4 0v1-7.5a2 2 0 0 0 -4 0v7.5a2 2 0 0 0 -4 0v3l5 5M14 21.5l5.1-5.1" />
          </svg>
        </button>
      </div>

      <div style={{ 
        marginBottom: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center'
      }}>
        <div style={{ 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
            style={{
              backgroundColor: '#fff',
              padding: '8px',
              border: '1px solid #aaa',
              borderRadius: '4px',
              cursor: 'pointer',
              position: 'relative'
            }}
            title="Color picker"
          >
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: selectedShape?.fill || currentColor,
              border: '1px solid #000'
            }}></div>
          </button>
          
          {colorPickerOpen && (
            <div style={{ 
              position: 'absolute',
              top: '40px',
              left: '0',
              zIndex: 10,
              backgroundColor: '#fff',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>
              <input 
                type="color" 
                value={selectedShape?.fill || currentColor} 
                onChange={handleColorChange}
                style={{ width: '100%' }}
              />
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '5px',
                marginTop: '5px'
              }}>
                {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000', '#888888'].map(color => (
                  <div 
                    key={color}
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: color,
                      border: '1px solid #ccc',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setCurrentColor(color);
                      if (selectedShapeId) {
                        updateShape(selectedShapeId, { fill: color });
                      }
                    }}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {selectedShapeId && (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px'
          }}>
            <label style={{ fontSize: '10px' }}>Stroke</label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={selectedShape?.strokeWidth || 2} 
              onChange={handleStrokeWidthChange}
              style={{ width: '50px' }}
            />
          </div>
        )}
      </div>

      <div style={{ 
        marginBottom: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={undo}
          disabled={!canUndo}
          style={{
            backgroundColor: '#fff',
            padding: '8px',
            border: '1px solid #aaa',
            borderRadius: '4px',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            opacity: canUndo ? 1 : 0.5
          }}
          title="Undo (Ctrl+Z)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 14l-4-4 4-4" />
            <path d="M5 10h11c3 0 4 2 4 4a4 4 0 0 1-4 4h-8" />
          </svg>
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          style={{
            backgroundColor: '#fff',
            padding: '8px',
            border: '1px solid #aaa',
            borderRadius: '4px',
            cursor: canRedo ? 'pointer' : 'not-allowed',
            opacity: canRedo ? 1 : 0.5
          }}
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 14l4-4-4-4" />
            <path d="M19 10H8c-3 0-4 2-4 4a4 4 0 0 0 4 4h8" />
          </svg>
        </button>
      </div>

      <div style={{ 
        marginBottom: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={exportToImage}
          style={{
            backgroundColor: '#fff',
            padding: '8px',
            border: '1px solid #aaa',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          title="Export to PNG"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        
        <button
          onClick={toggleLayersPanel}
          style={{
            backgroundColor: showLayersPanel ? '#ccc' : '#fff',
            padding: '8px',
            border: '1px solid #aaa',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          title="Layers"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </button>
      </div>
      
      {/* Layers Panel */}
      {showLayersPanel && (
        <div style={{
          position: 'absolute',
          left: '70px',
          top: '0',
          width: '200px',
          height: '100%',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
          zIndex: 100,
          padding: '10px',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '16px' }}>Layers</h3>
          
          {shapes.length === 0 ? (
            <p style={{ color: '#888', fontSize: '12px' }}>No shapes yet</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[...shapes].reverse().map((shape) => (
                <li 
                  key={shape.id}
                  onClick={() => setSelectedShape(shape.id)}
                  style={{
                    padding: '8px',
                    backgroundColor: selectedShapeId === shape.id ? '#f0f0f0' : 'transparent',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Shape icon */}
                    <div>
                      {shape.type === 'rect' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}>
                          <rect x="4" y="4" width="16" height="16" />
                        </svg>
                      )}
                      {shape.type === 'circle' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}>
                          <circle cx="12" cy="12" r="8" />
                        </svg>
                      )}
                      {shape.type === 'text' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={shape.stroke} strokeWidth={shape.strokeWidth}>
                          <path d="M17 10h4M3 10h4M12 3v18M8 3h8" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Shape type and short id */}
                    <span style={{ fontSize: '12px' }}>
                      {shape.type.charAt(0).toUpperCase() + shape.type.slice(1)} 
                      {shape.type === 'text' && shape.text ? `: "${shape.text.substring(0, 10)}${shape.text.length > 10 ? '...' : ''}"` : ''}
                    </span>
                  </div>
                  
                  {/* Layer operations */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        moveShapeUp(shape.id);
                      }}
                      disabled={shapes.indexOf(shape) === shapes.length - 1}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        opacity: shapes.indexOf(shape) === shapes.length - 1 ? 0.3 : 1,
                        padding: '2px'
                      }}
                      title="Move Up"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 19V5M5 12l7-7 7 7"/>
                      </svg>
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        moveShapeDown(shape.id);
                      }}
                      disabled={shapes.indexOf(shape) === 0}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        opacity: shapes.indexOf(shape) === 0 ? 0.3 : 1,
                        padding: '2px'
                      }}
                      title="Move Down"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12l7 7 7-7"/>
                      </svg>
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this shape?')) {
                          deleteShape(shape.id);
                        }
                      }}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                      title="Delete"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Toolbar; 