
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  // SDEK React UI Kit theme (light). We import this first so local css can override if needed.
  import "@cdek-it/react-ui-kit/dist/theme-light.css";
  import "primeicons/primeicons.css";
  import "./index.css";
  // Project local overrides that should be loaded after kit theme and index.css
  import "./styles/globals.css";

  createRoot(document.getElementById("root")!).render(<App />);
  