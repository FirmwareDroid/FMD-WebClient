import LoginForm from "../components/login/LoginForm";
import Container from "react-bootstrap/esm/Container";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import React from "react";
import { useCookies } from "react-cookie";

function LoginPage() {
  const [cookie, setCookie] = useCookies(["access_token_cookie"]);

  let view = undefined;
  if(!cookie.email){
    view = <Container>
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <h3>Sign in</h3>
          <LoginForm/>
        </Col>
      </Row>
    </Container>
  }else{
    view = <p>Already logged in</p>
  }

  return (
    view
  );
}

export default LoginPage;
