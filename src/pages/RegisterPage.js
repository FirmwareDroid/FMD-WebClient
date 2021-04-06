import Container from "react-bootstrap/esm/Container";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import React from "react";
import SignUpForm from "../components/register/RegisterUserForm";


function RegisterPage() {
  return (
    <Container>
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <h3>Sign up</h3>
          <SignUpForm />
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterPage;

