/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "assets/css/animate.min.css";
import "assets/sass/light-bootstrap-dashboard-react.scss?v=1.3.0";
import "assets/css/demo.css";
import "assets/css/pe-icon-7-stroke.css";
import AdminLayout from "layouts/Admin"
import LandingLayout from "layouts/Landing"
import LoginLayout from "layouts/Login"
import { SWRConfig } from 'swr'
const fetcher = (...args) => fetch(...args).then((res) => res.json());


ReactDOM.render(
  <React.StrictMode>
    <SWRConfig value={{
      fetcher: fetcher }}>
      <Router>
        <Switch>
          <Route path="/admin" render={props => <AdminLayout {...props} />} />
          <Route path="/landing" render={props => <LandingLayout {...props} />} />
          <Route path="/login" render={props => <LoginLayout {...props} />} />
          <Redirect from="/" to="/landing" />
        </Switch>
      </Router>
    </SWRConfig>
  </React.StrictMode>,
  document.getElementById("root")
);
