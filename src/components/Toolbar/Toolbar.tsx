import React from 'react';
import useStore from '../../store/useStore';

interface ToolbarProps {
  activeTool: string | null;
  onToolSelect: (tool: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolSelect }) => {
  const { selectedShapeId, updateShape } = useStore();

  const tools = [
    { id: 'select', icon: '🖱️', label: 'Select' },
    { id: 'rect', icon: '⬜', label: 'Rectangle' },
    { id: 'circle', icon: '⭕', label: 'Circle' },
    { id: 'text', icon: 'T', label: 'Text' },
    { id: 'hand', icon: '✋', label: 'Hand' },
  ];

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedShapeId) {
      updateShape(selectedShapeId, { fill: e.target.value });
    }
  };

  const handleStrokeWidthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedShapeId) {
      updateShape(selectedShapeId, { strokeWidth: parseInt(e.target.value) });
    }
  };

  return (
    <div style={{
      height: '48px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '8px',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 8px',
        borderRight: '1px solid #e0e0e0'
      }}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: activeTool === tool.id ? '#e3f2fd' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
            onClick={() => onToolSelect(tool.id)}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 8px',
        borderRight: '1px solid #e0e0e0'
      }}>
        <input
          type="color"
          onChange={handleColorChange}
          title="Fill Color"
          style={{
            width: '32px',
            height: '32px',
            padding: 0,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        />
        <select
          onChange={handleStrokeWidthChange}
          title="Stroke Width"
          style={{
            height: '32px',
            padding: '0 8px',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="1">1px</option>
          <option value="2">2px</option>
          <option value="4">4px</option>
          <option value="8">8px</option>
          <option value="16">16px</option>
        </select>
      </div>
    </div>
  );
};

export default Toolbar; 