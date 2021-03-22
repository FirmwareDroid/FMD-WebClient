
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
import CreditsPage from "./pages/CreditsPage"
// Themes
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './assets/theming/theme';
import { GlobalStyles } from './assets/theming/global';
import { useDarkMode } from './hooks/theming/useDarkMode';
import ThemeToggle from './components/toggle/ThemeToggle/ThemeToggle';
import Link from "react-router-dom/es/Link";


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
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <h1>It's a {theme === 'light' ? 'light theme' : 'dark theme'}!</h1>
        <Router>
          <Switch>

            <Route path="/about">
              <AboutPage />
            </Route>

            <Route path="/login">
              <LoginPage />
            </Route>

            <Route path="/admin">
              <AdminPage />
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

            <Route path="/credits">
              <CreditsPage />
            </Route>

            <Route path="/">
              <LandingPage />
            </Route>

          </Switch>
        </Router>
        <footer>
          <small>
            <a href="/credits" className="active">Credits</a>
          </small>
        </footer>
      </>
    </ThemeProvider>
  );
}

export default App;
