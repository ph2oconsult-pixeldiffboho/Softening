import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("SoftH2O: Engine initializing...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("SoftH2O Critical: Root element #root not found.");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("SoftH2O: Render triggered successfully.");
  } catch (err) {
    console.error("SoftH2O Mount Failure:", err);
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: system-ui, sans-serif; text-align: center; color: #1e293b;">
        <div style="display: inline-block; background: #fff1f2; border: 1px solid #fecaca; padding: 24px; border-radius: 16px; max-width: 500px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
          <h1 style="color: #be123c; font-size: 1.25rem; font-weight: 800; margin: 0 0 12px 0;">Initialization Error</h1>
          <p style="font-size: 0.875rem; color: #9f1239; margin-bottom: 20px;">The SoftH2O engine failed to start. This is often due to an environment compatibility issue.</p>
          <pre style="background: #1e293b; color: #f1f5f9; padding: 12px; border-radius: 8px; text-align: left; font-size: 11px; overflow-x: auto; max-height: 200px;">${err instanceof Error ? err.stack || err.message : String(err)}</pre>
          <button onclick="window.location.reload()" style="margin-top: 20px; background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">Retry Boot</button>
        </div>
      </div>
    `;
  }
}
