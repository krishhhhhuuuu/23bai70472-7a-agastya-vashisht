import { useContext } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Badge from "react-bootstrap/Badge";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppContext } from "../context/AppContext";
import ThemeToggle from "./ThemeToggle";

export default function MyNavbar() {
  const { theme } = useContext(AppContext);
  const cartItems = useSelector((state) => state.cart.items);
  const totalQty = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const location = useLocation();

  return (
    <Navbar
      bg={theme === "dark" ? undefined : "dark"}
      variant="dark"
      expand="lg"
      style={theme === "dark" ? { backgroundColor: "#1e1e1e" } : {}}
      sticky="top"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          🛒 ShopReact
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />

        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-center gap-1">
            <Nav.Link as={Link} to="/" active={location.pathname === "/"}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/about" active={location.pathname === "/about"}>
              About
            </Nav.Link>
            <Nav.Link as={Link} to="/cart" active={location.pathname === "/cart"}>
              Cart{" "}
              {totalQty > 0 && (
                <Badge bg="danger" pill>
                  {totalQty}
                </Badge>
              )}
            </Nav.Link>
            <Nav.Link as={Link} to="/reports" active={location.pathname === "/reports"}>
              Reports
            </Nav.Link>
          </Nav>
          <ThemeToggle />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
