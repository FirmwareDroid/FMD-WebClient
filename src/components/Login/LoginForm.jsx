import React, { Component } from "react";
import SignIn from "../../views/SignIn";


class LoginForm extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <SignIn/>
    );
  }
}

export default LoginForm;