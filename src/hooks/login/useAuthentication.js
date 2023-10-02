import { useEffect, useState } from 'react';
import Cookies from 'js-cookie'
import {useQuery} from "@apollo/client";
import {CURRENT_USER} from "../../GqlQueries";

export const useAuthentication = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  useQuery(CURRENT_USER, {
    onCompleted: (data) => {
      setAuthenticated(true)
    },
  })

  // useEffect(() => {
  //   if(data){
  //     setAuthenticated(true)
  //   }else{
  //     setAuthenticated(false)
  //   }
  // }, []);

  return [isAuthenticated, setAuthenticated]
};