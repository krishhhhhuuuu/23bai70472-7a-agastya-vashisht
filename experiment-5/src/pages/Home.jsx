import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../redux/slices/cartSlice";
import { AppContext } from "../context/AppContext";
import MyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import { useState } from "react";

const PRODUCTS = [
  { id: 1, name: "Wireless Headphones", price: 2499, category: "Electronics", emoji: "🎧" },
  { id: 2, name: "Mechanical Keyboard", price: 3999, category: "Electronics", emoji: "⌨️" },
  { id: 3, name: "Running Shoes", price: 1799, category: "Fashion", emoji: "👟" },
  { id: 4, name: "Yoga Mat", price: 899, category: "Fitness", emoji: "🧘" },
  { id: 5, name: "Coffee Mug", price: 349, category: "Kitchen", emoji: "☕" },
  { id: 6, name: "Desk Lamp", price: 1299, category: "Home", emoji: "💡" },
];

export default function Home() {
  const { theme } = useContext(AppContext);
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const isInCart = (id) => cartItems.some((i) => i.id === id);

  const handleAdd = (product) => {
    dispatch(addItem(product));
    setToastMsg(`${product.emoji} ${product.name} added to cart!`);
    setShowToast(true);
  };

  const cardBg = theme === "dark" ? "#1e1e1e" : "#fff";
  const cardText = theme === "dark" ? "#f0f0f0" : "#212529";

  return (
    <>
      <MyNavbar />

      {/* Hero */}
      <div className="hero-section">
        <h1>Welcome 👋</h1>
        <p>Discover amazing products — add them to your cart and track your spending.</p>
      </div>

      <Container className="py-5">
        <h3 className="mb-4 fw-bold">🛍️ Featured Products</h3>
        <Row xs={1} sm={2} lg={3} className="g-4">
          {PRODUCTS.map((product) => (
            <Col key={product.id}>
              <Card
                className="product-card h-100"
                style={{ backgroundColor: cardBg, color: cardText }}
              >
                <Card.Body className="d-flex flex-column">
                  <div style={{ fontSize: "3rem", textAlign: "center", marginBottom: "12px" }}>
                    {product.emoji}
                  </div>
                  <Badge bg="secondary" className="category-badge mb-2 align-self-start">
                    {product.category}
                  </Badge>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text className="fw-bold text-success fs-5">₹{product.price}</Card.Text>
                  <Button
                    variant={isInCart(product.id) ? "success" : "primary"}
                    className="mt-auto"
                    onClick={() => handleAdd(product)}
                  >
                    {isInCart(product.id) ? "✓ Add More" : "Add to Cart"}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Footer />

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={2500}
          autohide
          bg="success"
        >
          <Toast.Body className="text-white fw-semibold">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
