import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthentication } from "../../hooks/login/useAuthentication";

const withAuthentication = ( WrappedComponent ) => {
  return (props) => {
    const navigate = useNavigate();
    const { isAuthenticated, setAuthenticated } = useAuthentication();
    if (!isAuthenticated) {
      navigate('/login');
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withAuthentication;