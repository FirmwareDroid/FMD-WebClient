import Container from "react-bootstrap/esm/Container";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import React from "react";
import SignUpForm from "../components/register/RegisterUserForm";


function RegisterPage() {
  const [signupStatus, setSignupStatus] = React.useState(false);
  let signUpMessage = "";
  switch(signupStatus.status){
    case undefined:
      signUpMessage = <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <h3>Sign up</h3>
          <SignUpForm setSignupStatus={setSignupStatus}/>
        </Col>
      </Row>;
      break;
    case "wait-for-verification":
        signUpMessage = <Container>
          <h2>Thank you for your registration!</h2>
          <h4>Please confirm your e-mail address</h4>
          <p>
            You should have received a confirmation link via e-mail. Please check you e-mail inbox and click on the
            confirmation link to finish your account registration.
          </p>
        </Container>;
      break;
    default:
      signUpMessage = <Container>
        <h2>Ooops...sorry, something went wrong!</h2>
        <a href="/register" >Please try again.</a>
      </Container>;
  }

  return (
    <Container>
      {signUpMessage}
    </Container>
  );
}

export default RegisterPage;

