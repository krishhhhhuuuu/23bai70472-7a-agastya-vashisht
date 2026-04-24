import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function Footer() {
  const { theme } = useContext(AppContext);

  return (
    <footer
      style={{
        background: theme === "dark" ? "#0a0a0a" : "#1a1a2e",
        color: "#ccc",
        textAlign: "center",
        padding: "20px",
        marginTop: "60px",
      }}
    >
      <p className="mb-1">© 2026 ShopReact — Experiment 5 Project</p>
      <small style={{ opacity: 0.6 }}>
        Built with React · Redux Toolkit · Context API · React Router
      </small>
    </footer>
  );
}
