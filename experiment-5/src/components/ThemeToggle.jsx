import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Button from "react-bootstrap/Button";

export default function ThemeToggle() {

  const { theme, toggleTheme } = useContext(AppContext);

  return (
    <Button
      variant="secondary"
      onClick={toggleTheme}
      className="ms-3"
    >
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </Button>
  );
}