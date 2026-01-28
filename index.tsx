import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

function startApp() {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error("SoftH2O Critical: Mount point #root not found in DOM.");
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
    console.error("SoftH2O: Failed to render application:", error);
  }
}

// Ensure the DOM is fully parsed before running the script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
