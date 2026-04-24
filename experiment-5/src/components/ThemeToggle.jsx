import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Button from "react-bootstrap/Button";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(AppContext);

  return (
    <Button
      variant={theme === "light" ? "outline-light" : "outline-warning"}
      onClick={toggleTheme}
      className="ms-3"
      size="sm"
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </Button>
  );
}
