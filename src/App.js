// Routing
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import ScanReportPage from "./pages/ScanReportPage";
import LoginPage from "./pages/LoginPage";
import TopNavbar from "./components/navigation/Navbar/TopNavbar";
import RegisterPage from "./pages/RegisterPage";
import UploadPage from "./pages/UploadPage";
import LogoutPage from "./pages/LogoutPage";
// Themes
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './assets/theming/theme';
import { GlobalStyles } from './assets/theming/global';
import { useDarkMode } from './hooks/theming/useDarkMode';
import { useAuthentication } from './hooks/login/useAuthentication'
import { useFetch } from './hooks/fetch/useFetch'

import React from "react";
import {Container, Spinner} from "react-bootstrap";
import ScannerPage from "./pages/ScannerPage";



const styles = {
  grid: {
    paddingTop: 40,
    height: '100vh'
  }
};


function App() {
  const [theme, toggleTheme, componentMounted] = useDarkMode();
  const [isAuthenticated, setAuthenticated] = useAuthentication();
  const themeMode = theme === 'light' ? lightTheme : darkTheme;
  const clientSettingUrl = "https://firmwaredroid.cloudlab.zhaw.ch/api/v1/settings/client_setting/";
  const requestOptions = {method: 'GET'};
  const [isLoading, clientSettings] = useFetch(clientSettingUrl, requestOptions);


  if (!componentMounted || isLoading) {
    return <Container className={"text-center"}>
      <Spinner variant="success" animation="grow" role="status" >
        <span className="sr-only">Loading...</span>
      </Spinner>
      <span>Wait for server to connect...</span>
    </Container>
  }

  return (
    <ThemeProvider theme={themeMode}>
      <>
        <GlobalStyles />
        <header style={{"marginBottom": 30}}>
          <TopNavbar theme={theme}
                     toggleTheme={toggleTheme}
                     clientSettings={clientSettings}
                     isAuthenticated={isAuthenticated}/>
        </header>
        <Container fluid>
          <Router>
            <Switch>
              <Route path="/about">
                <AboutPage />
              </Route>

              <Route path="/login">
                <LoginPage setAuthenticated={setAuthenticated}/>
              </Route>

              <Route path="/logout">
                <LogoutPage isAuthenticated={isAuthenticated} setAuthenticated={setAuthenticated}/>
              </Route>

              <Route exact path="/admin">
                <AdminPage />
              </Route>

              <Route path="/admin/scanner/:scannerId">
                <ScannerPage />
              </Route>

              <Route path="/profile">
                <ProfilePage />
              </Route>

              <Route path="/search">
                <SearchPage />
              </Route>

              <Route path="/report">
                <ScanReportPage />
              </Route>

              <Route path="/upload">
                <UploadPage />
              </Route>

              <Route path="/register">
                <RegisterPage />
              </Route>

              <Route path="/">
                <LandingPage />
              </Route>
            </Switch>
          </Router>
        </Container>
        <footer>
          <small>
            <a href="/about" className="active">Credits</a>
          </small>
        </footer>
      </>
    </ThemeProvider>
  );
}

export default App;
