import React from 'react';
import Nav from "react-bootstrap/esm/Nav";
import Navbar from "react-bootstrap/esm/Navbar";
import { useAuthentication } from "../../../hooks/login/useAuthentication";


const TopNavbar = ({ theme }) => {
  const {isAuthenticated, setAuthenticated} = useAuthentication();
  return (
      <Navbar className="me-auto navigation" bg={theme} variant={theme} sticky="top">
        <Navbar.Brand href="/">FirmwareDroid</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Nav as="ul" bg={theme} variant={theme} sticky="top">
            <Nav.Item as="li">
                <Nav.Link className={window.location.pathname === '/about' ? 'active' : ''} href="/about">About</Nav.Link>
            </Nav.Item>
            <Nav.Item as="li">{!isAuthenticated &&
                <Nav.Link className={window.location.pathname === '/login' ? 'active' : ''} href="/login">Sign in
                </Nav.Link>}
            </Nav.Item>
            <Nav.Item as="li">{isAuthenticated &&
                <Nav.Link className={window.location.pathname === '/logout' ? 'active' : ''} href="/logout">Sign out
                </Nav.Link>}
            </Nav.Item>
            <Nav.Item as="li">{isAuthenticated &&
                <Nav.Link className={window.location.pathname === '/emulator' ? 'active' : ''} href="/emulator">Emulator
                </Nav.Link>}
            </Nav.Item>
        </Nav>
      </Navbar>
  );
};

export default TopNavbar;