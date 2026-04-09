import MyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "react-bootstrap/Container";

export default function Home() {

  return (
    <>
      <MyNavbar />

      <Container className="py-5 text-center">

        <h1>Home Page</h1>
        <p>Welcome to Experiment 5 React Application</p>

      </Container>

      <Footer />
    </>
  );
}