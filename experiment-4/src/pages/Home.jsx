import MyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "react-bootstrap/Container";

export default function Home() {
  return (
    <>
      <MyNavbar />

      <Container
        fluid
        className="d-flex flex-column justify-content-center align-items-center text-center"
        style={{ minHeight: "80vh" }}
      >
        <h1 className="display-3">Home Page</h1>
        <p className="lead">Welcome to Experiment 4 Project.</p>
      </Container>

      <Footer />
    </>
  );
}