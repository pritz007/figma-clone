import React from 'react';
import Canvas from './components/Canvas/Canvas';
import Toolbar from './components/Toolbar/Toolbar';
import Sidebar from './components/Sidebar/Sidebar';

const App: React.FC = () => {
  return (
    <div className="app-container" style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <Toolbar />
      
      <div className="main-content" style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden'
      }}>
        <div className="canvas-container" style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Canvas />
        </div>
      </div>
      
      <Sidebar />
    </div>
  );
};

export default App; 