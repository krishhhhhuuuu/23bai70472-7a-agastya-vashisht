import { useContext, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeItem, updateQty, clearCart } from "../redux/slices/cartSlice";
import { AppContext } from "../context/AppContext";
import MyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";

export default function Cart() {
  const { theme } = useContext(AppContext);
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  // useMemo: derived calculations
  const { totalPrice, totalQty, savings } = useMemo(() => {
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const savings = Math.round(totalPrice * 0.05); // mock 5% discount
    return { totalPrice, totalQty, savings };
  }, [cartItems]);

  const tableBg = theme === "dark" ? "#1e1e1e" : "#fff";
  const tableVariant = theme === "dark" ? "dark" : undefined;

  return (
    <>
      <MyNavbar />

      <div className="hero-section" style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)" }}>
        <h1>🛒 Your Cart</h1>
        <p>{totalQty} item{totalQty !== 1 ? "s" : ""} in your cart</p>
      </div>

      <Container className="py-5">
        {cartItems.length === 0 ? (
          <Alert variant="info" className="text-center py-5">
            <div style={{ fontSize: "3rem" }}>🛒</div>
            <h5 className="mt-2">Your cart is empty</h5>
            <p className="mb-0">Go to Home and add some products!</p>
          </Alert>
        ) : (
          <Row className="g-4">
            <Col lg={8}>
              <Table
                responsive
                bordered
                hover
                variant={tableVariant}
                style={{ backgroundColor: tableBg }}
              >
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="me-2">{item.emoji}</span>
                        {item.name}
                      </td>
                      <td>₹{item.price}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => dispatch(updateQty({ id: item.id, qty: item.qty - 1 }))}
                          >
                            −
                          </Button>
                          <span className="fw-bold">{item.qty}</span>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => dispatch(updateQty({ id: item.id, qty: item.qty + 1 }))}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="fw-semibold">₹{item.price * item.qty}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => dispatch(removeItem(item.id))}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>

            {/* Order Summary */}
            <Col lg={4}>
              <Card style={{ backgroundColor: tableBg }}>
                <Card.Body>
                  <Card.Title className="fw-bold">Order Summary</Card.Title>
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span>Items ({totalQty})</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Discount (5%)</span>
                    <span>− ₹{savings}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total</span>
                    <span>₹{totalPrice - savings}</span>
                  </div>
                  <Badge bg="success" className="mt-2">
                    You save ₹{savings}!
                  </Badge>
                  <div className="d-grid mt-4 gap-2">
                    <Button variant="success" size="lg">
                      Checkout
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => dispatch(clearCart())}
                    >
                      Clear Cart
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      <Footer />
    </>
  );
}
