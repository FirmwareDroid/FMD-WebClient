// src/pages/LogoutPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthentication } from '../hooks/login/useAuthentication';
import { useMutation } from "@apollo/client";
import { DELETE_TOKEN_COOKIE } from "../graphql/mutations";
import { Container, Spinner, Alert } from "react-bootstrap";

const LogoutPage = () => {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuthentication();
  const [logout, { loading, error }] = useMutation(DELETE_TOKEN_COOKIE, {
    onCompleted: (data) => {
      if (data.deleteTokenCookie.deleted === true) {
        setAuthenticated(false);
        navigate("/", { replace: true });
        window.location.reload();
      }
    },
  });

  useEffect(() => {
    logout();
  }, [logout]);

  if (loading) {
    return (
      <Container className={"text-center"}>
        <Spinner variant="success" animation="grow" role="status" />
        <span>Logging out...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" dismissible>
        Whoops...something went wrong! Please, try again.
      </Alert>
    );
  }

  return null;
};

export default LogoutPage;