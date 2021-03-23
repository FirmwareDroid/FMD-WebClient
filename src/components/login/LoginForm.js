import Form from "react-bootstrap/esm/Form";
import React from "react";
import Button from "react-bootstrap/esm/Button";



const LoginForm = ({}) => {


  return (
    <Form>
      <Form.Group controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" placeholder="Enter email" />
      </Form.Group>

      <Form.Group controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" />
      </Form.Group>

      <Form.Group controlId="formBasicCheckbox">
        <Form.Check type="checkbox" label="Save session" />
      </Form.Group>
      <Button variant="outline-success" type="submit">
        Sign in
      </Button>
    </Form>
  );
};


export default LoginForm;