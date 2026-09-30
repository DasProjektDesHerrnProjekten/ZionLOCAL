import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Check if running in SEB (Safe Exam Browser) or offline mode
const isSEB = navigator.userAgent.includes('SEB') ||
             window.location.search.includes('seb=true') ||
             window.name.includes('SEB');
const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === 'true';

// Only load external fonts and analytics if NOT in SEB and NOT in offline mode
if (!isSEB && !isOfflineMode) {
  import("@fontsource/plus-jakarta-sans/400.css");
  import("@fontsource/plus-jakarta-sans/500.css");
  import("@fontsource/plus-jakarta-sans/600.css");
  import("@fontsource/plus-jakarta-sans/700.css");
  import("@fontsource/inter/400.css");
  import("@fontsource/inter/500.css");
  import("@fontsource/inter/600.css");
}

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Ensure DOM is ready before creating root
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Make sure there's a <div id=\"root\"></div> in your HTML.");
}

createRoot(rootElement).render(
  <>
    <App />
  </>
);
