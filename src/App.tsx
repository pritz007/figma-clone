import React from 'react';
import useStore from './store/useStore';
import Canvas from './components/Canvas/Canvas';
import Toolbar from './components/Toolbar/Toolbar';
import Sidebar from './components/Sidebar/Sidebar';

const App: React.FC = () => {
  console.log('App rendering with all components');
  
  const {
    layers,
    selectedLayerId,
    activeTool,
    setSelectedLayer,
    setActiveTool,
    toggleLayerVisibility,
    toggleLayerLock,
  } = useStore();

  console.log('Store values:', { layers, selectedLayerId, activeTool });

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh', 
      width: '100vw',
      backgroundColor: '#f5f5f5'
    }}>
      <Toolbar activeTool={activeTool} onToolSelect={setActiveTool} />
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 48px)' }}>
        <Sidebar
          layers={layers}
          selectedLayerId={selectedLayerId}
          onLayerSelect={setSelectedLayer}
          onLayerVisibilityToggle={toggleLayerVisibility}
          onLayerLockToggle={toggleLayerLock}
        />
        <div style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#ffffff'
        }}>
          <Canvas />
        </div>
      </div>
    </div>
  );
};

export default App; 