import { useSelector, useDispatch } from "react-redux";
import { removeItem, clearCart } from "../redux/slices/cartSlice";
import { useMemo } from "react";

import MyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";

export default function Cart() {

  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  }, [cartItems]);

  return (
    <>
      <MyNavbar />

      <Container className="py-5">

        <h2 className="text-center">Cart Page</h2>

        <ListGroup className="mt-4">

          {cartItems.map((item, index) => (
            <ListGroup.Item
              key={index}
              className="d-flex justify-content-between"
            >

              {item.name} - ₹{item.price}

              <Button
                variant="danger"
                size="sm"
                onClick={() => dispatch(removeItem(index))}
              >
                Remove
              </Button>

            </ListGroup.Item>
          ))}

        </ListGroup>

        <h4 className="text-center mt-4">
          Total Price: ₹{totalPrice}
        </h4>

        <div className="text-center mt-3">

          <Button
            variant="warning"
            onClick={() => dispatch(clearCart())}
          >
            Clear Cart
          </Button>

        </div>

      </Container>

      <Footer />
    </>
  );
}