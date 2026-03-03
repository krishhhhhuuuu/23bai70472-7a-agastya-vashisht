import MyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "react-bootstrap/Container";

export default function About() {

  return (
    <>
      <MyNavbar />

      <Container className="py-5 text-center">

        <h1>About Page</h1>
        <p>This page explains the React project.</p>

      </Container>

      <Footer />
    </>
  );
}