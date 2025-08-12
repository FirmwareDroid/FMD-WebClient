import React from "react";
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './assets/theming/theme';
import { GlobalStyles } from './assets/theming/global';
import { useDarkMode } from './hooks/theming/useDarkMode';
import {Container, Spinner} from "react-bootstrap";
import { useQuery } from "@apollo/client";
import {HEALTH_QUERY} from "./graphql/queries"
import LandingPage from "./pages/LandingPage";
import TopNavbar from "./components/navigation/navbar/TopNavbar";

function App() {
  const [theme, toggleTheme, componentMounted] = useDarkMode();
  const themeMode = theme === 'light' ? lightTheme : darkTheme;
  const { loading, error } = useQuery(HEALTH_QUERY);

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

export default App;
