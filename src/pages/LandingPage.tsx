import Container from "react-bootstrap/esm/Container";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import AboutPage from "./AboutPage";
import React from "react";
import withAuthentication from "../components/routes/PrivateRoute";
import EmulatorPage from "./EmulatorPage";
import LoginPage from "./LoginPage";
import LogoutPage from "./LogoutPage";
import RedirectToMain from "../components/redirects/RedirectToMain";

const LandingPage = () => {
    const AuthenticatedLoginPage = withAuthentication(RedirectToMain, LoginPage);
    const AuthenticatedEmulatorPage = withAuthentication(EmulatorPage, LoginPage);
    const AuthenticatedLogoutPagePage = withAuthentication(LogoutPage, LoginPage);

    return (
        <Container fluid>
            <Container>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<AuthenticatedLoginPage/>} />
                        <Route path="/about" element={<AboutPage/>} />
                        <Route path="/logout" element={<AuthenticatedLogoutPagePage/>} />
                        <Route path="/emulator" element={<AuthenticatedEmulatorPage/>} />
                    </Routes>
                </BrowserRouter>
            </Container>
        </Container>
    );
};

export default LandingPage;