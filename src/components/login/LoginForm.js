import Form from "react-bootstrap/esm/Form";
import React from "react";
import Button from "react-bootstrap/esm/Button";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";
import { useLazyQuery } from "@apollo/client";
import { TOKEN_AUTH } from "../../graphql/queries";
import {useAuthentication} from "../../hooks/login/useAuthentication";

const LoginForm = () => {
  let renderResponse;
  const navigate = useNavigate();
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);
  const [password, setPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const {isAuthenticated, setAuthenticated} = useAuthentication();

  let [login, {loading, data, error}] = useLazyQuery(TOKEN_AUTH, {
    onCompleted: (data) => {
      setAuthenticated(true)
      navigate("/", {replace: true});
      window.location.reload();
    },
    onError: (error) => {
      setShowPasswordAlert(true);
    }
  });

  const onSubmitLoginForm = ((event) => {
    event.preventDefault();
    login({variables : {username : username, password: password}});
  });

  const onChangePassword = ((event) => {
    setPassword(event.target.value)
  });

  const onChangeEmail = ((event) => {
    setUsername(event.target.value);
  });

  if(loading) {
    renderResponse = <Container className={"text-center"}>
      <Spinner variant="success" animation="grow" role="status">
      </Spinner>
      <span>Login...</span>
    </Container>
  }else{
    renderResponse = (
        <>
          {showPasswordAlert && <Alert variant="danger" onClose={() => setShowPasswordAlert(false)} dismissible>
            Seems like a wrong password or username!
          </Alert>}
          <Form onSubmit={onSubmitLoginForm}>
            <Form.Group controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Username" onChange={onChangeEmail}/>
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" onChange={onChangePassword}/>
            </Form.Group>

            <Button variant="outline-success" type="submit" className="m-3">
              Sign in
            </Button>
          </Form>
        </>
    );
  }
  return renderResponse
};


export default LoginForm;