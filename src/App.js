import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import TopNavbar from "./components/navigation/Navbar/TopNavbar";
import LogoutPage from "./pages/LogoutPage";
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './assets/theming/theme';
import { GlobalStyles } from './assets/theming/global';
import { useDarkMode } from './hooks/theming/useDarkMode';
import { useAuthentication } from './hooks/login/useAuthentication'
import {Container, Spinner} from "react-bootstrap";
import { useQuery } from "@apollo/client";
import {HEALTH_QUERY} from "./graphql/queries"

function App() {
  const [theme, toggleTheme, componentMounted] = useDarkMode();
  const themeMode = theme === 'light' ? lightTheme : darkTheme;
  const { loading, error, data, } = useQuery(HEALTH_QUERY);

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
                  <Route path="/">
                    {/*<LandingPage />*/}
                  </Route>

                  <Route path="/login" element={<LoginPage />}>
                  </Route>

                  <Route path="/about" element={<AboutPage />}>
                  </Route>

                  <Route path="/logout" element={<LogoutPage />}>
                  </Route>

                  <Route exact path="/admin">
                    {/*<AdminPage />*/}
                  </Route>

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
