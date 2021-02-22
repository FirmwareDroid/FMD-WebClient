import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import loginRoutes from "../routes.js";
import LoginForm from "components/Login/LoginForm.jsx"

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidUpdate(e) {

  }

  getRoutes = routes => {
    return routes.map((prop, key) => {
      if (prop.layout === "/login") {
        return (
          <Route
            path={prop.layout + prop.path}
            render={props => (
              <prop.component
                {...props}
                handleClick={this.handleNotificationClick}
              />
            )}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };

  render() {
    return (
      <div className="wrapper">
        <p>LOGIN PAGE HERE</p>
        <Switch>{this.getRoutes(loginRoutes)}</Switch>
        <LoginForm />
      </div>
    );
  }
}

export default Login;