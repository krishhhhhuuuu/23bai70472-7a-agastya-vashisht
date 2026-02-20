import MyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "react-bootstrap/Container";

export default function About() {
  return (
    <>
      <MyNavbar />

      <Container
        fluid
        className="d-flex flex-column justify-content-center align-items-center text-center"
        style={{ minHeight: "80vh" }}
      >
        <h1 className="display-4">About Page</h1>
        <p className="lead">
          This page is part of Experiment 4 multi-page SPA.
        </p>
      </Container>

      <Footer />
    </>
  );
}