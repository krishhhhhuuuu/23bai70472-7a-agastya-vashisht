import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  const [user] = useState({
    name: "Navkaran Singh",
    role: "Student",
    uid: "24bda70021",
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <AppContext.Provider value={{ theme, toggleTheme, user }}>
      {children}
    </AppContext.Provider>
  );
};
