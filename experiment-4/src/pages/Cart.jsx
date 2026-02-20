import { useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import MyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

export default function Cart() {
  const { state, dispatch } = useContext(AppContext);

  const total = useMemo(() => {
    return state.cart.reduce((sum, item) => sum + item.price, 0);
  }, [state.cart]);

  return (
    <>
      <MyNavbar />

      <Container
        fluid
        className="d-flex flex-column justify-content-center align-items-center text-center"
        style={{ minHeight: "80vh" }}
      >
        <h2>Cart Page</h2>

        <div className="mt-3">
          <Button
            onClick={() =>
              dispatch({
                type: "ADD_ITEM",
                payload: { name: "Product", price: 100 },
              })
            }
          >
            Add Item
          </Button>

          <Button
            variant="danger"
            className="ms-2"
            onClick={() => dispatch({ type: "CLEAR_CART" })}
          >
            Clear Cart
          </Button>
        </div>

        <h4 className="mt-4">Items: {state.cart.length}</h4>
        <h4>Total: ₹{total}</h4>
      </Container>

      <Footer />
    </>
  );
}