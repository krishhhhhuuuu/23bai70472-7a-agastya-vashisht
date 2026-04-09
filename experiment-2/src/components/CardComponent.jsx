import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function CardComponent() {
  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Our Features</h2>

      <Row className="g-4">
        {[1, 2, 3].map((item) => (
          <Col md={4} key={item}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title>Feature {item}</Card.Title>
                <Card.Text>
                  This is a modern UI card with responsive layout.
                </Card.Text>
                <Button variant="primary">Learn More</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
