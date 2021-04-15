import Form from "react-bootstrap/esm/Form";
import React from "react";
import Button from "react-bootstrap/esm/Button";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import {Alert} from "react-bootstrap";
import {useFetch} from "../../hooks/fetch/useFetch";


const LoginForm = ({setAuthenticated}) => {
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);
  const [password, setPassword] = React.useState("");
  const [saveSession, setSaveSession] = React.useState("");
  const [email, setEmail] = React.useState("");
  const history = useHistory();


  const onSubmitLoginForm = ((event) => {
    event.preventDefault();
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password, saveSession: saveSession})
    };

    fetch('https://firmwaredroid.cloudlab.zhaw.ch/api/v1/auth/login/', requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(response.json().toString());
        }
      })
      .then((data) => {
        history.push("/profile");
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", email);
        localStorage.setItem("isAuthenticated", "true");
        setAuthenticated(true)
      })
      .catch(error => {
        console.error(error);
        setShowPasswordAlert(true);
      });
  });

  const onChangePassword = ((event) => {
    setPassword(event.target.value)
  });

  const onChangeEmail = ((event) => {
    setEmail(event.target.value);
  });

  const onChangeSaveSession = ((event) => {
    setSaveSession(event.target.checked);
  });


  return (
    <>
      {showPasswordAlert && <Alert variant="danger" onClose={() => setShowPasswordAlert(false)} dismissible>
        Seems like a wrong password or e-mail!
      </Alert>}
      <Form onSubmit={onSubmitLoginForm}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" placeholder="Enter email" onChange={onChangeEmail}/>
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" onChange={onChangePassword}/>
        </Form.Group>

        {/*<Form.Group controlId="formBasicCheckbox">*/}
          {/*<Form.Check type="checkbox" label="Save session" onChange={onChangeSaveSession}/>*/}
        {/*</Form.Group>*/}
        <Button variant="outline-success" type="submit">
          Sign in
        </Button>
      </Form>
    </>
  );
};


export default LoginForm;