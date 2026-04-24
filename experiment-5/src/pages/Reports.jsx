import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../context/AppContext";
import MyNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Alert from "react-bootstrap/Alert";
import ProgressBar from "react-bootstrap/ProgressBar";

export default function Reports() {
  const { theme } = useContext(AppContext);
  const cartItems = useSelector((state) => state.cart.items);

  // useMemo: all analytics derived from Redux state
  const analytics = useMemo(() => {
    const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0);
    const totalValue = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const avgPrice = cartItems.length > 0 ? Math.round(totalValue / totalItems) : 0;
    const mostExpensive = cartItems.length > 0
      ? cartItems.reduce((max, i) => (i.price > max.price ? i : max), cartItems[0])
      : null;

    const categoryBreakdown = cartItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.price * item.qty;
      return acc;
    }, {});

    return { totalItems, totalValue, avgPrice, mostExpensive, categoryBreakdown };
  }, [cartItems]);

  const cardBg = theme === "dark" ? "#1e1e1e" : "#fff";
  const tableVariant = theme === "dark" ? "dark" : undefined;

  const STAT_CARDS = [
    { label: "Total Products", value: cartItems.length, color: "#667eea", icon: "📦" },
    { label: "Total Quantity", value: analytics.totalItems, color: "#f093fb", icon: "🔢" },
    { label: "Cart Value", value: `₹${analytics.totalValue}`, color: "#4facfe", icon: "💰" },
    { label: "Avg Price/Item", value: `₹${analytics.avgPrice}`, color: "#43e97b", icon: "📊" },
  ];

  return (
    <>
      <MyNavbar />

      <div className="hero-section" style={{ background: "linear-gradient(135deg, #4facfe, #00f2fe)" }}>
        <h1>📊 Reports & Analytics</h1>
        <p>Insights derived from your cart using Redux + useMemo</p>
      </div>

      <Container className="py-5">


        {/* Stat Cards */}
        <Row xs={2} lg={4} className="g-3 mb-5">
          {STAT_CARDS.map((s) => (
            <Col key={s.label}>
              <div className="stat-card" style={{ background: s.color }}>
                <div style={{ fontSize: "2rem" }}>{s.icon}</div>
                <div style={{ fontSize: "1.6rem", marginTop: "8px" }}>{s.value}</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>{s.label}</div>
              </div>
            </Col>
          ))}
        </Row>

        {cartItems.length === 0 ? (
          <Alert variant="info" className="text-center py-4">
            No cart data yet. Add products from the Home page to see analytics.
          </Alert>
        ) : (
          <Row className="g-4">
            {/* Cart Items Table */}
            <Col lg={7}>
              <Card style={{ backgroundColor: cardBg }}>
                <Card.Body>
                  <Card.Title className="fw-bold mb-3">🛒 Cart Breakdown</Card.Title>
                  <Table responsive variant={tableVariant} className="mb-0">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Qty</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.emoji} {item.name}</td>
                          <td>{item.category}</td>
                          <td>{item.qty}</td>
                          <td className="fw-semibold">₹{item.price * item.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            {/* Category Breakdown */}
            <Col lg={5}>
              <Card style={{ backgroundColor: cardBg }}>
                <Card.Body>
                  <Card.Title className="fw-bold mb-3">📂 Spend by Category</Card.Title>
                  {Object.entries(analytics.categoryBreakdown).map(([cat, val]) => {
                    const pct = Math.round((val / analytics.totalValue) * 100);
                    return (
                      <div key={cat} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>{cat}</span>
                          <span className="fw-semibold">₹{val} ({pct}%)</span>
                        </div>
                        <ProgressBar now={pct} label={`${pct}%`} />
                      </div>
                    );
                  })}

                  {analytics.mostExpensive && (
                    <Alert variant="warning" className="mt-3 mb-0 py-2">
                      💎 Most expensive: <strong>{analytics.mostExpensive.name}</strong> @ ₹{analytics.mostExpensive.price}
                    </Alert>
                  )}
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
