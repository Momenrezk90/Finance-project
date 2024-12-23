// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';  // Import the 'react-dom/client' package
import App from './App';
import './styles/index.css';

// Create a root element and render the App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
