import { useState } from 'react';
import { useQuery } from "@apollo/client";
import { CURRENT_USER } from "../../graphql/queries";


export const useAuthentication = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  useQuery(CURRENT_USER, {
    onCompleted: (data) => {
      setAuthenticated(true)
    },
    onError: () => {
      setAuthenticated(false)
    }
  });

  return [isAuthenticated, setAuthenticated]
};