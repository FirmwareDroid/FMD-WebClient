import React from 'react';
import { useAuthentication } from '../../hooks/login/useAuthentication';

const withAuthentication = (WrappedComponent, RedirectComponent) => {
  return (props) => {
    const { isAuthenticated } = useAuthentication();

    if (!isAuthenticated) {
      return <RedirectComponent {...props} />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuthentication;