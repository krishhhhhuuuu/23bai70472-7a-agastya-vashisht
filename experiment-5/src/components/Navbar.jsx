import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function MyNavbar() {

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>

        <Navbar.Brand>Experiment 5</Navbar.Brand>

        <Navbar.Toggle />

        <Navbar.Collapse>

          <Nav className="ms-auto">

            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/cart">Cart</Nav.Link>
            <Nav.Link as={Link} to="/reports">Reports</Nav.Link>

          </Nav>

          <ThemeToggle />

        </Navbar.Collapse>

      </Container>
    </Navbar>
  );
}