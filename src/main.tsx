import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

console.log('main.tsx executing');
console.log('Root element:', document.getElementById('root'));

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
); 