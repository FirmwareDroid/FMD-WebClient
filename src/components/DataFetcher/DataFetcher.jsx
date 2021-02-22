import React from 'react';
import {Spinner} from "react-bootstrap";
import {useRequest} from "../../hooks/useRequest";


function DataFetcher({dataUrl, stateCallback}){
  const { data, error } = useRequest(dataUrl);
  if (error) return <h1>Something went wrong!</h1>;
  if (!data) return <Spinner animation="border" variant="primary" size="mg"/>;
  console.log("Data", data);
  console.log("stateCallback", stateCallback);
  stateCallback(data);
  return null;
}

export default DataFetcher;