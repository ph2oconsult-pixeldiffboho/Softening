
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical: Root element #root not found.");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (err) {
    console.error("Failed to render React app:", err);
    rootElement.innerHTML = `
      <div style="padding: 2rem; font-family: system-ui; text-align: center; color: #334155;">
        <h1 style="color: #e11d48; font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem;">Initialization Error</h1>
        <p style="margin-bottom: 1rem;">The SoftH2O engine failed to initialize.</p>
        <pre style="background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; text-align: left; display: inline-block; font-size: 0.75rem; max-width: 100%; overflow-x: auto;">${err instanceof Error ? err.stack || err.message : String(err)}</pre>
      </div>
    `;
  }
}
