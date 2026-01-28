import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("SoftH2O: Engine boot sequence initiated...");

const mountApp = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("SoftH2O: Mount point #root not found. Retrying in 50ms...");
    setTimeout(mountApp, 50);
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("SoftH2O: Application mounted successfully.");
  } catch (error) {
    console.error("SoftH2O: Render failed:", error);
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; padding: 20px;">
        <div style="background: white; border: 1px solid #fee2e2; padding: 32px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 400px; text-align: center;">
          <h1 style="color: #dc2626; margin-bottom: 12px; font-size: 1.25rem;">Boot Error</h1>
          <p style="color: #4b5563; font-size: 0.875rem;">The water treatment engine failed to initialize.</p>
          <pre style="margin-top: 16px; background: #f3f4f6; padding: 12px; border-radius: 8px; font-size: 11px; text-align: left; overflow-x: auto;">${error instanceof Error ? error.message : String(error)}</pre>
        </div>
      </div>
    `;
  }
};

// Start mounting immediately since the script is deferred and at the bottom of the body
mountApp();
