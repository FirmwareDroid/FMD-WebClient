import React, {useEffect, useState} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import TopNavbar from "./components/navigation/Navbar/TopNavbar";
import LogoutPage from "./pages/LogoutPage";
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './assets/theming/theme';
import { GlobalStyles } from './assets/theming/global';
import { useDarkMode } from './hooks/theming/useDarkMode';
import {Container, Spinner} from "react-bootstrap";
import { useQuery } from "@apollo/client";
import {HEALTH_QUERY} from "./graphql/queries"
import EmulatorPage from "./pages/EmulatorPage";
import withAuthentication from "./components/routes/PrivateRoute";
import {useAuthentication} from "./hooks/login/useAuthentication";


function App() {
  const { isAuthenticated, setAuthenticated } = useAuthentication();
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(isAuthenticated);
  const [theme, toggleTheme, componentMounted] = useDarkMode();
  const themeMode = theme === 'light' ? lightTheme : darkTheme;
  const { loading, error, data, } = useQuery(HEALTH_QUERY);
  const AuthenticatedEmulatorPage = withAuthentication(EmulatorPage);

  useEffect(() => {
    setIsUserAuthenticated(isAuthenticated);
  }, [isAuthenticated]);

  let renderResponse;
  if (!componentMounted || loading) {
    renderResponse = <Container className={"text-center"}>
      <Spinner variant="success" animation="grow" role="status" >
      </Spinner>
      <span>Loading...</span>
    </Container>
  }else if(error){
    return `Error! ${error.message}`;
  }
  else{
     renderResponse = (
        <Container fluid className="p-0">
          <ThemeProvider theme={themeMode}>
            <GlobalStyles />
              <header>
                <TopNavbar theme={theme}/>
              </header>
            <Container>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />}>
                  </Route>

                  <Route path="/about" element={<AboutPage />}>
                  </Route>

                  <Route path="/logout" element={<LogoutPage />}>
                  </Route>

                  <Route path="/emulator" element={<AuthenticatedEmulatorPage />} />
                </Routes>

              </BrowserRouter>
            </Container>
          </ThemeProvider>
        </Container>
    );
  }
  return renderResponse
}

export default App;
