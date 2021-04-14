import Container from "react-bootstrap/esm/Container";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import React from "react";
import { useHistory } from "react-router-dom";
import { useCookies } from 'react-cookie';

function LogoutPage({setAuthenticated}) {
  const history = useHistory();
  const [csrfCookie, setCookie] = useCookies(['csrf_access_token']);

  const requestOptions = {
    method: 'DELETE',
    headers: {
      "X-CSRF-TOKEN": csrfCookie.csrf_access_token
    },
    credentials: "same-origin"
  };

  fetch('https://firmwaredroid.cloudlab.zhaw.ch/api/v1/auth/logout/', requestOptions)
    .catch(error => {
      console.error(error);
    })
    .then((response) => {
      if(response.ok){
        const theme = localStorage.getItem("theme");
        localStorage.clear();
        localStorage.setItem("isAuthenticated", "false");
        localStorage.setItem("theme", theme);
        setAuthenticated(false);
        history.push("/");
      }
      return response.json()
    });

  return (
    <Container>
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <h3>Logout error!</h3>
          <p>There was a problem during logout! Please try again.</p>
        </Col>
      </Row>
    </Container>
  );
}

export default LogoutPage;
