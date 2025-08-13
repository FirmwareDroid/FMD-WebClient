import React from "react";
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './assets/theming/theme';
import { GlobalStyles } from './assets/theming/global';
import { useDarkMode } from './hooks/theming/useDarkMode';
import {Container, Spinner} from "react-bootstrap";
import { useQuery } from "@apollo/client";
import LandingPage from "./pages/LandingPage";
import TopNavbar from "./components/navigation/navbar/TopNavbar";
import {GET_API_HEALTH} from "./graphql/api-health.graphql";

function App() {
  const [theme, toggleTheme, componentMounted] = useDarkMode();
  const themeMode = theme === 'light' ? lightTheme : darkTheme;
  const { loading, error, data } = useQuery(GET_API_HEALTH);

  if (!componentMounted || loading) {
    return (
      <Container className={"text-center"}>
        <Spinner variant="success" animation="grow" role="status" />
        <span>Loading...</span>
      </Container>
    );
  }

  if (error) {
    return `Error! ${error.message}`;
  }

  if (data?.isApiUp) {
      return (
          <Container fluid className="p-0">
              <ThemeProvider theme={themeMode}>
                  <GlobalStyles />
                  <TopNavbar theme={theme} />
                  <LandingPage />
              </ThemeProvider>
          </Container>
      );
  }

  return "API is down!";
}

export default App;
