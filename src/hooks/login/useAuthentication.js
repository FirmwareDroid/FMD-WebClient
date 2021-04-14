import { useEffect, useState } from 'react';

export const useAuthentication = (isLoggedIn=false) => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isLoggedIn)
  }, [isLoggedIn]);

  return [isAuthenticated, setAuthenticated]
};