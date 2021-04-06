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
// Themes
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './assets/theming/theme';
import { GlobalStyles } from './assets/theming/global';
import { useDarkMode } from './hooks/theming/useDarkMode';

import TopNavbar from "./components/navigation/Navbar/TopNavbar";
import Container from "react-bootstrap/esm/Container";
import RegisterPage from "./pages/RegisterPage";
import UploadPage from "./pages/UploadPage";


const styles = {
  grid: {
    paddingTop: 40,
    height: '100vh'
  }
};


function App() {
  const [theme, toggleTheme, componentMounted] = useDarkMode();
  const themeMode = theme === 'light' ? lightTheme : darkTheme;

  if (!componentMounted) {
    return <div />
  }

  return (
    <ThemeProvider theme={themeMode}>
      <>
        <GlobalStyles />
        <TopNavbar theme={theme} toggleTheme={toggleTheme} />
        <Container fluid style={styles.grid}>
          <Router>
            <Switch>
              <Route path="/about">
                <AboutPage />
              </Route>

              <Route path="/login">
                <LoginPage />
              </Route>

              <Route path="/admin">
                <AdminPage theme={theme}/>
              </Route>

              <Route path="/profile">
                <ProfilePage />
              </Route>

              <Route path="/search">
                <SearchPage />
              </Route>

              <Route path="/scanreport">
                <ScanReportPage />
              </Route>

              <Route path="/upload">
                <UploadPage />
              </Route>

              <Route path="/register">
                <RegisterPage />
              </Route>

              <Route path="/">
                <LandingPage theme={theme}/>
              </Route>

            </Switch>
          </Router>
          <footer>
            <small>
              <a href="/about" className="active">Credits</a>
            </small>
          </footer>
        </Container>
      </>
    </ThemeProvider>
  );
}

export default App;
