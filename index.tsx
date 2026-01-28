
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical: Could not find root element with id 'root'");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("React Mounting Error:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif; color: #334155;">
        <h2 style="color: #ef4444;">Application Failed to Load</h2>
        <p>There was an error initializing the SoftH2O engine.</p>
        <pre style="background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: left; display: inline-block; font-size: 12px;">${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
}
