import { useSelector } from "react-redux";
import { useMemo } from "react";

import MyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "react-bootstrap/Container";

export default function Reports() {

  const cartItems = useSelector((state) => state.cart.items);

  const totalItems = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  return (
    <>
      <MyNavbar />

      <Container className="py-5 text-center">

        <h2>Reports Page</h2>

        <p>Total items in cart: {totalItems}</p>

        <p>This page demonstrates Redux Toolkit + useMemo.</p>

      </Container>

      <Footer />
    </>
  );
}