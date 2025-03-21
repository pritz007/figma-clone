import React from 'react';

interface Layer {
  id: string;
  name: string;
  type: 'shape' | 'group';
  isVisible: boolean;
  isLocked: boolean;
}

interface SidebarProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerVisibilityToggle: (layerId: string) => void;
  onLayerLockToggle: (layerId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerVisibilityToggle,
  onLayerLockToggle,
}) => {
  return (
    <div style={{
      width: '240px',
      height: '100%',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e0e0e0',
      padding: '16px',
      overflowY: 'auto'
    }}>
      <h3>Layers</h3>
      {layers.length === 0 ? (
        <div style={{ padding: '8px', color: '#999' }}>
          No layers yet. Create shapes to see them here.
        </div>
      ) : (
        layers.map((layer) => (
          <div
            key={layer.id}
            style={{
              padding: '8px',
              margin: '4px 0',
              backgroundColor: layer.id === selectedLayerId ? '#e3f2fd' : 'transparent',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => onLayerSelect(layer.id)}
          >
            <span
              onClick={(e) => {
                e.stopPropagation();
                onLayerVisibilityToggle(layer.id);
              }}
            >
              {layer.isVisible ? '👁️' : '👁️‍🗨️'}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onLayerLockToggle(layer.id);
              }}
            >
              {layer.isLocked ? '🔒' : '🔓'}
            </span>
            <span>{layer.name}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default Sidebar; 