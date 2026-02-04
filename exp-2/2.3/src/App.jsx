import { Routes, Route } from "react-router-dom";

import Navigation from "./components/Navigation";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Section from "./Pages/Section";

export default function App() {
  return (
    <>
      <Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/section" element={<Section />} />
      </Routes>
    </>
  );
}
