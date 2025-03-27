import React, { useState } from 'react';
import useStore from '../../store/useStore';

const Sidebar: React.FC = () => {
  const { shapes, selectedShapeId, setSelectedShape } = useStore();
  const [activeTab, setActiveTab] = useState<'properties' | 'settings'>('properties');

  const selectedShape = shapes.find(shape => shape.id === selectedShapeId);

  return (
    <div style={{
      width: '250px',
      height: '100%',
      padding: '16px',
      backgroundColor: '#f5f5f5',
      borderLeft: '1px solid #e0e0e0',
      overflow: 'auto'
    }}>
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e0e0e0', 
        marginBottom: '16px',
        paddingBottom: '8px'
      }}>
        <button 
          onClick={() => setActiveTab('properties')}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: activeTab === 'properties' ? '#e0e0e0' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'properties' ? 'bold' : 'normal'
          }}
        >
          Properties
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: activeTab === 'settings' ? '#e0e0e0' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'settings' ? 'bold' : 'normal'
          }}
        >
          Settings
        </button>
      </div>

      {activeTab === 'properties' && (
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 'bold' }}>Properties</h3>
          
          {selectedShape ? (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Type
                </label>
                <div style={{ padding: '8px', backgroundColor: '#e9e9e9', borderRadius: '4px' }}>
                  {selectedShape.type.charAt(0).toUpperCase() + selectedShape.type.slice(1)}
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Position
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px' }}>X</label>
                    <div style={{ padding: '8px', backgroundColor: '#e9e9e9', borderRadius: '4px' }}>
                      {Math.round(selectedShape.x)}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px' }}>Y</label>
                    <div style={{ padding: '8px', backgroundColor: '#e9e9e9', borderRadius: '4px' }}>
                      {Math.round(selectedShape.y)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Size
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px' }}>Width</label>
                    <div style={{ padding: '8px', backgroundColor: '#e9e9e9', borderRadius: '4px' }}>
                      {Math.round(Math.abs(selectedShape.width))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px' }}>Height</label>
                    <div style={{ padding: '8px', backgroundColor: '#e9e9e9', borderRadius: '4px' }}>
                      {Math.round(Math.abs(selectedShape.height))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Appearance
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px' }}>Fill</label>
                    <div style={{ 
                      padding: '8px', 
                      backgroundColor: '#e9e9e9', 
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        backgroundColor: selectedShape.fill,
                        border: '1px solid #ccc',
                        borderRadius: '2px'
                      }} />
                      {selectedShape.fill}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px' }}>Stroke</label>
                    <div style={{ 
                      padding: '8px', 
                      backgroundColor: '#e9e9e9', 
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        backgroundColor: selectedShape.stroke,
                        border: '1px solid #ccc',
                        borderRadius: '2px'
                      }} />
                      {selectedShape.stroke}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px' }}>Width</label>
                    <div style={{ padding: '8px', backgroundColor: '#e9e9e9', borderRadius: '4px' }}>
                      {selectedShape.strokeWidth}px
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedShape.type === 'text' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Text Content
                  </label>
                  <div style={{ padding: '8px', backgroundColor: '#e9e9e9', borderRadius: '4px', minHeight: '60px' }}>
                    {selectedShape.text || 'No text content'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#888', fontStyle: 'italic' }}>
              Select a shape to view its properties
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 'bold' }}>Settings</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Canvas Settings
            </label>
            <div style={{ padding: '8px', backgroundColor: '#e9e9e9', borderRadius: '4px', marginBottom: '8px' }}>
              <span style={{ display: 'block', marginBottom: '4px' }}>Grid: Visible</span>
              <span style={{ display: 'block' }}>Snap to Grid: Enabled</span>
            </div>
            <p style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
              Grid and snap settings can be toggled with G and Shift+G
            </p>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Keyboard Shortcuts
            </label>
            <div style={{ padding: '8px', backgroundColor: '#e9e9e9', borderRadius: '4px' }}>
              <table style={{ width: '100%', fontSize: '12px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '2px 4px' }}>Ctrl+Z</td>
                    <td style={{ padding: '2px 4px' }}>Undo</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 4px' }}>Ctrl+Shift+Z</td>
                    <td style={{ padding: '2px 4px' }}>Redo</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 4px' }}>Delete</td>
                    <td style={{ padding: '2px 4px' }}>Delete shape</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 4px' }}>Esc</td>
                    <td style={{ padding: '2px 4px' }}>Deselect</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 4px' }}>G</td>
                    <td style={{ padding: '2px 4px' }}>Toggle grid</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              About
            </label>
            <div style={{ padding: '8px', backgroundColor: '#e9e9e9', borderRadius: '4px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '12px' }}>
                Figma Clone v1.0.0
              </p>
              <p style={{ margin: '0', fontSize: '12px' }}>
                A simple Figma-inspired design tool
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 