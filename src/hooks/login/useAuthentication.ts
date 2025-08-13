import {useEffect, useState} from 'react';
import { useQuery } from "@apollo/client";
import {GET_CURRENT_USER} from "../../graphql/current-user.graphql";


export const useAuthentication = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { error, data } = useQuery(GET_CURRENT_USER);

  useEffect(() => {
    if (data?.me?.id) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [data, error]);

  return { isAuthenticated, setAuthenticated: setIsAuthenticated };
};
