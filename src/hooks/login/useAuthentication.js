import {useEffect, useState} from 'react';
import { useQuery } from "@apollo/client";
import { CURRENT_USER } from "../../graphql/queries";


export const useAuthentication = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const { data, error } = useQuery(CURRENT_USER);

  useEffect(() => {
    if (data?.me?.id) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  }, [data, error]);

  return { isAuthenticated, setAuthenticated };
};
