import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

export default function Home() {
  return (
    <div className="container mt-4">
      <h2 className="mb-3">🏠 Home Page</h2>

      <Card className="shadow">
        <Card.Body>
          <Card.Title>Bootstrap Card</Card.Title>
          <Card.Text>
            This card is made using react-bootstrap. Looks clean and professional.
          </Card.Text>

          <Button variant="primary">Explore More</Button>
        </Card.Body>
      </Card>
    </div>
  );
}
