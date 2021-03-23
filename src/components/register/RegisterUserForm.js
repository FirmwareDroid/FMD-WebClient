import Form from "react-bootstrap/esm/Form";
import React from "react";
import Button from "react-bootstrap/esm/Button";


const LoginForm = ({}) => {


  return (
    <Form>
      <Form.Group controlId="formRegisterUsername">
        <Form.Label>Username (public visible)</Form.Label>
        <Form.Control type="text" placeholder="Enter username" />
      </Form.Group>

      <Form.Group controlId="formRegisterEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" placeholder="Enter email" />
      </Form.Group>

      <Form.Group controlId="formRegisterPassword1">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" />
      </Form.Group>

      <Form.Group controlId="formRegisterPassword2">
        <Form.Label>Re-Password</Form.Label>
        <Form.Control type="password" placeholder="Retype your password" />
      </Form.Group>

      <Form.Group controlId="formRegisterTermsCheckbox">
        <Form.Check type="checkbox" label="I have read and agree to terms of service" />
      </Form.Group>

      <Button variant="outline-success" type="submit">
        Register
      </Button>
    </Form>
  );
};


export default LoginForm;