import { useEffect, useState } from 'react';

export const useAuthentication = (isLoggedIn=false) => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if(localStorage.getItem("isAuthenticated") === "true"){
      setAuthenticated(true)
    }else{
      setAuthenticated(isLoggedIn)
    }
  }, [isLoggedIn]);

  return [isAuthenticated, setAuthenticated]
};