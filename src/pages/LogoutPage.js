import Container from "react-bootstrap/esm/Container";
import React from "react";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import {useMutation} from "@apollo/client";
import {DELETE_TOKEN_COOKIE} from "../graphql/mutations";
import {Alert, Spinner} from "react-bootstrap";
import {useAuthentication} from "../hooks/login/useAuthentication";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/esm/Form";

function LogoutPage() {
  let renderResponse;
  const navigate = useNavigate();
  const {isAuthenticated, setAuthenticated} = useAuthentication();
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  let [logout, {loading, data, error}] = useMutation(DELETE_TOKEN_COOKIE, {
    onCompleted: (data) => {
      if(data.deleteTokenCookie.deleted === true){
        setShowErrorAlert(false)
        setAuthenticated(false)
        navigate("/", { replace: true });
        window.location.reload();
      }else{
        setShowErrorAlert(true)
      }
    },
    onError: (error) => {
      setShowErrorAlert(true)
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    logout();
  }

  if(loading) {
    renderResponse = <Container className={"text-center"}>
      <Spinner variant="success" animation="grow" role="status">
      </Spinner>
      <span>Login...</span>
    </Container>
  }else if (error){
    renderResponse = (
        <>
          {setShowErrorAlert &&
              <Alert variant="danger" onClose={() => setShowErrorAlert(false)} dismissible>
            Whoops...something went wrong! Please, try again.
          </Alert>}
        </>
    );
  }else{
    renderResponse = (
        <>
          <Container className="text-center p-3">
            <h3>Sign out</h3>
            <p>Do you really want to sign out?</p>
            <Form onSubmit={handleSubmit}>
              <Button variant="outline-success" type="submit" className="m-3">
                Yes, sign me out.
              </Button>
            </Form>
          </Container>
        </>
    );
  }

  return renderResponse
}

export default LogoutPage;
