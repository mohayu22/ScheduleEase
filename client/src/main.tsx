import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeLocalStorage } from "./lib/storage";

// Initialize localStorage with default data if needed
initializeLocalStorage();

createRoot(document.getElementById("root")!).render(<App />);
