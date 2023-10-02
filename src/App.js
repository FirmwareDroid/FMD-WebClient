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
import {HEALTH_QUERY} from "./GqlQueries"



function App() {
  const [theme, toggleTheme, componentMounted] = useDarkMode();
  const themeMode = theme === 'light' ? lightTheme : darkTheme;
  const [isAuthenticated, setAuthenticated] = useAuthentication();
  const { loading, error, data, } = useQuery(HEALTH_QUERY);

  let renderResponse;
  if (!componentMounted || loading) {
    renderResponse = <Container className={"text-center"}>
      <Spinner variant="success" animation="grow" role="status" >
        <span className="sr-only">Loading...</span>
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

                  <Route path="/login" element={isAuthenticated === true && <LoginPage setAuthenticated={setAuthenticated}/>}>
                  </Route>

                  <Route path="/about" element={<AboutPage />}>
                  </Route>

                  {/*<Route element=/!*<LogoutPage isAuthenticated={isAuthenticated} setAuthenticated={setAuthenticated}/>*!/*/}
                  {/*       path="/logout">*/}
                  {/*</Route>*/}

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

  // <ThemeProvider theme={themeMode}>
  //   <h1>Loaded success</h1>
  //   <>
  //     <GlobalStyles />
  //     <header style={{"marginBottom": 30}}>
  //       <TopNavbar theme={theme}
  //                  toggleTheme={toggleTheme}
  //                  clientSettings={clientSettings}
  //                  isAuthenticated={isAuthenticated}/>
  //     </header>
  //     <Container fluid>

  //     </Container>
  //     <footer>
  //       <small>
  //         <a href="/about" className="active">Credits</a>
  //       </small>
  //     </footer>
  //   </>
  // </ThemeProvider>

  // if(errorHealth === undefined || errorClientSettings === undefined){
  //   renderResponse = (
  //       <h1>Sorry, something went wrong! Seems like our API is down.</h1>
  //   )
  // }else{
  //
  // }
  return renderResponse
}

export default App;
