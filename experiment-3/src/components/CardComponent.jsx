import { Container, Row, Col, Card } from "react-bootstrap";

export default function CardComponent() {
  return (
    <Container className="py-5">
      <h2 className="text-center fw-bold mb-4">Features</h2>

      <Row className="g-4">
        <Col md={4}>
          <Card className="shadow h-100">
            <Card.Body>
              <Card.Title>Fast Performance</Card.Title>
              <Card.Text>
                Built using Vite and React for fast loading and smooth UI.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow h-100">
            <Card.Body>
              <Card.Title>Modern UI</Card.Title>
              <Card.Text>
                Uses Bootstrap and Material UI for clean design.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow h-100">
            <Card.Body>
              <Card.Title>SPA Routing</Card.Title>
              <Card.Text>
                Client-side navigation using React Router.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
