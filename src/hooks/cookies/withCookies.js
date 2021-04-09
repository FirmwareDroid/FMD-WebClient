import React, { Component } from "react";
import { withCookies } from "react-cookie";

const withReactCookies = ({props}) => {
  const user = props.cookies.get("user") || "";

  return (
    <div className="App">
      {user && <p>{user}</p>}
    </div>
  );
};

export default withReactCookies;