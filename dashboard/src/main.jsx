// Import the browser renderer that knows how to display React components.
import { createRoot } from "react-dom/client";

// Import our main component and the shared stylesheet.
import App from "./App.jsx";
import "./styles.css";
import "./workflows.css";

// Find the root element from index.html and display App inside it.
createRoot(document.getElementById("root")).render(<App />);
