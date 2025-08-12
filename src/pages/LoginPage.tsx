import LoginForm from "../components/login/LoginForm";
import Container from "react-bootstrap/esm/Container";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import React from "react";


function LoginPage() {

  return (
    <Container className="p-3">
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <h3>Sign in</h3>
          <LoginForm />
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;
