import Form from "react-bootstrap/esm/Form";
import React from "react";
import Button from "react-bootstrap/esm/Button";
import InputGroup from "react-bootstrap/esm/InputGroup";
import usePasswordValidation from "../../hooks/validation/usePasswordValidation";
import useUsernameValidation from "../../hooks/validation/useUsernameValidation";
import useEmailValidation from "../../hooks/validation/useEmailValidation";



const SignUpForm = (props) => {
  const [firstPassword, setFirstPassword] = React.useState("");
  const [secondPassword, setSecondPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");


  const [isValidUsername, isInvalidUsername] = useUsernameValidation({
    username: username
  });

  const [isValidEmail, isInvalidEmail] = useEmailValidation({
    email: email
  });

  const [
    isValidPassword,
    isInvalidPassword,
    isValidPasswordMatch,
    isInvalidPasswordMatch
  ] = usePasswordValidation({
    firstPassword: firstPassword,
    secondPassword: secondPassword,
  });


  const onChangeFirstPassword = (event) => {
    setFirstPassword(event.target.value);
  };

  const onChangeSecondPassword = (event) => {
    setSecondPassword(event.target.value);
  };

  const onChangeUsername = (event) => {
    setUsername(event.target.value);
  };

  const onChangeEmail = (event) => {
    setEmail(event.target.value);
  };

  const onSubmitForm = (event) => {
    event.preventDefault();
    // TODO Store Route in config file.
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, email: email, password: firstPassword })
    };
    fetch('https://firmwaredroid.cloudlab.zhaw.ch/api/v1/auth/signup/', requestOptions)
      .then(response => response.json())
      .then((data) => {
        props.setSignupStatus(data);
      })
      .catch(error => {
          console.error('There was an error!', error);
        });
  };


  return (
    <>
      <Form onSubmit={onSubmitForm}>
        <Form.Group controlId="formRegisterUsername">
          <Form.Label>Username (public visible)</Form.Label>
          <InputGroup hasValidation>
            <Form.Control
              isValid={isValidUsername}
              isInvalid={isInvalidUsername}
              required
              onChange={onChangeUsername}
              type="text"
              placeholder="Enter username" />
            <Form.Text id="passwordHelpBlock" >
              Your username must be 4-40 characters long and can only contain letters and numbers.
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              Please choose a valid username.
            </Form.Control.Feedback>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="formRegisterEmail">
          <Form.Label>Email address</Form.Label>
          <InputGroup hasValidation>
            <Form.Control
              isValid={isValidEmail}
              isInvalid={isInvalidEmail}
              required
              onChange={onChangeEmail}
              type="email"
              placeholder="Enter email" />
            <Form.Control.Feedback type="invalid">
              Please choose a valid e-mail.
            </Form.Control.Feedback>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="formRegisterPassword1">
          <Form.Label>Password</Form.Label>
          <Form.Control required
                        isValid={isValidPassword}
                        isInvalid={isInvalidPassword}
                        onChange={onChangeFirstPassword}
                        type="password"
                        placeholder="Password" />
          <Form.Text id="passwordHelpBlock" >
            Your password must be 8-128 characters long, contain letters and numbers, and
            must not contain spaces, special characters, or emoji.
          </Form.Text>
          <Form.Control.Feedback type="valid">Looks good!</Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
            Please choose a valid password.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="formRegisterPassword2">
          <Form.Label>Re-Password</Form.Label>
          <Form.Control required
                        isValid={isValidPasswordMatch}
                        isInvalid={isInvalidPasswordMatch}
                        onChange={onChangeSecondPassword}
                        type="password"
                        placeholder="Retype your password" />
          <Form.Control.Feedback type="valid">Looks good!</Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
            Password don't match. Please retype your password.
          </Form.Control.Feedback>
        </Form.Group>


        <Form.Group controlId="formRegisterTermsCheckbox">
          <Form.Check required
                      type="checkbox"
                      label="I have read and agree to terms of service and conditions." />
          <Form.Control.Feedback type="invalid">
            Please choose a valid password.
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="outline-success"
                type="submit">
          Register
        </Button>
      </Form>
    </>
  )
};


export default SignUpForm;