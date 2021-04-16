import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *,
  *::after,
  *::before {
    box-sizing: border-box;
  }
  
  body {
    height: 100%;
    background: ${({theme}) => theme.body};
    color: ${({theme}) => theme.text};
    font-family: BlinkMacSystemFont, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    transition: all 0.25s linear;
  }
  
  footer {
    position: absolute;
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
  }
  
  small {
    display: block;
  }
  
  button {
    display: block;
  }
  
  a {
    color: ${({theme}) => theme.text};
  }
  
  .light-tabs {
    background-color: white;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19);
  }
  
  .dark-tabs {
    background-color: black;
    border-color: rgb(0,255,0);
    box-shadow: 0 2px 4px 0 rgba(0, 255, 0, 0.2), 0 3px 10px 0 rgba(0, 255, 0, 0.19);
  }
  
  .dark-tabs.nav > a.active{
    color: white;
    background: green;
  }
  
  .dark-tabs.nav > a:hover{
    color: white;
    background: green;
  }
  
  .light-tab {
    padding: 30px;
    background-color: white;
    border: 1px solid black;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19);
  }
  
  .dark-tab {
    padding: 30px;
    background-color: #1C2331;
    border: 1px solid green;
    box-shadow: 0 4px 8px 0 rgba(0, 255, 0, 0.2), 0 6px 20px 0 rgba(0, 255, 0, 0.19);
  }
  
  .light-card {
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }
  
  .dark-card {
    box-shadow: 0 4px 8px 0 rgba(0, 255, 0, 0.2), 0 3px 10px 0 rgba(0, 255, 0, 0.19);
    background-color: #1C2331;
  }
  
  
`;