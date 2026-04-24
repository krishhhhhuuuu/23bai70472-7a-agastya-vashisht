import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import MyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";

const FEATURES = [
  { icon: "🔀", title: "React Router", desc: "Multi-page navigation with client-side routing across Home, About, Cart, and Reports." },
  { icon: "🌐", title: "Context API", desc: "Global theme (light/dark) and user profile shared across all components via useContext." },
  { icon: "🗃️", title: "Redux Toolkit", desc: "Cart state managed with configureStore + createSlice with addItem, removeItem, updateQty, and clearCart actions." },
  { icon: "⚡", title: "useMemo", desc: "Derived data like total price, item count, and category breakdown are memoized for performance." },
];

export default function About() {
  const { theme } = useContext(AppContext);

  const cardBg = theme === "dark" ? "#1e1e1e" : "#fff";
  const cardText = theme === "dark" ? "#f0f0f0" : "#212529";

  return (
    <>
      <MyNavbar />

      <div className="hero-section" style={{ background: "linear-gradient(135deg, #11998e, #38ef7d)" }}>
        <h1>About This Project</h1>
        <p>Experiment 5 — React + Redux Toolkit + Context API</p>
      </div>

      <Container className="py-5">
        {/* Student Info */}
        <Card className="mb-5 p-4" style={{ backgroundColor: cardBg, color: cardText }}>
          <Row className="align-items-center">
            <Col xs="auto">
              <div style={{ fontSize: "4rem" }}>👤</div>
            </Col>
            <Col>
              <h4 className="mb-1">Agastya Vashisht</h4>
              <p className="mb-1 text-muted">React + Redux Toolkit + Context API</p>
              <Badge bg="primary">UID: 23BAI70472</Badge>
            </Col>
          </Row>
        </Card>

        {/* Features */}
        <h3 className="fw-bold mb-4">🧩 What's Implemented</h3>
        <Row xs={1} sm={2} className="g-4">
          {FEATURES.map((f, i) => (
            <Col key={i}>
              <Card className="h-100 p-3" style={{ backgroundColor: cardBg, color: cardText }}>
                <div style={{ fontSize: "2.5rem" }}>{f.icon}</div>
                <Card.Title className="mt-2">{f.title}</Card.Title>
                <Card.Text style={{ opacity: 0.8 }}>{f.desc}</Card.Text>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Tech Stack */}
        <div className="mt-5 text-center">
          <h5 className="mb-3">Tech Stack</h5>
          {["React 19", "Redux Toolkit", "React Router v7", "Bootstrap 5", "Vite"].map((t) => (
            <Badge key={t} bg="dark" className="me-2 mb-2 px-3 py-2" style={{ fontSize: "0.85rem" }}>
              {t}
            </Badge>
          ))}
        </div>
      </Container>

      <Footer />
    </>
  );
}
