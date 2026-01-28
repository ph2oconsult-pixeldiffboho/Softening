import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("SoftH2O: Engine boot sequence initiated...");

const mountApp = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error("SoftH2O Critical: Could not find mount point #root");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("SoftH2O: React DOM render successful.");
  } catch (err) {
    console.error("SoftH2O: Failed to initialize React application:", err);
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: system-ui, -apple-system, sans-serif; text-align: center; color: #1e293b; background: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; border: 1px solid #e2e8f0; padding: 32px; border-radius: 24px; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
          <h1 style="color: #ef4444; font-size: 1.5rem; font-weight: 800; margin-bottom: 12px;">Boot Error</h1>
          <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 24px;">The application encountered a critical error during startup. This usually happens due to script loading failures.</p>
          <div style="background: #1e293b; color: #38bdf8; padding: 16px; border-radius: 12px; text-align: left; font-family: monospace; font-size: 12px; overflow-x: auto; margin-bottom: 24px;">
            ${err instanceof Error ? err.message : String(err)}
          </div>
          <button onclick="window.location.reload()" style="background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            Try Again
          </button>
        </div>
      </div>
    `;
  }
};

// Ensure DOM is ready before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
