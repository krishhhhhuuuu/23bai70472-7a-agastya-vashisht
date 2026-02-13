import MyNavbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function About() {
  return (
    <>
      <MyNavbar />
      <div style={{ padding: "60px", textAlign: "center" }}>
        <h1>About Page</h1>
        <p>
          This page is created as part of Experiment 3 to demonstrate React
          Router navigation in a Single Page Application.
        </p>
      </div>
      <Footer />
    </>
  );
}
