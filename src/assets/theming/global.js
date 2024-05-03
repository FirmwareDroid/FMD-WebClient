import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *,
  *::after,
  *::before {
    box-sizing: border-box;
  }
  
  body {
    min-height: 100vh;
    height: 100%;
    width: 100%;
    background: ${({theme}) => theme.body};
    color: ${({theme}) => theme.text};
    font-family: BlinkMacSystemFont, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    transition: all 0.25s linear;
    overflow: auto;
    margin-bottom: 2%;
    padding: 0;
  }

  footer {
    padding: 2%;
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
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
    height: 100%;
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
    height: 100%;
    padding-bottom: 30px;
    background-color: #1C2331;
    border: 1px solid green;
    box-shadow: 0 4px 8px 0 rgba(0, 255, 0, 0.2), 0 6px 20px 0 rgba(0, 255, 0, 0.19);
  }
  
  .light-card {
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }
  
  .dark-card {
    //box-shadow: 0 4px 8px 0 rgba(0, 255, 0, 0.2), 0 3px 10px 0 rgba(0, 255, 0, 0.19);
    background-color: #1C2331;
    margin-top: 5%;
  }
  

  .pagination > li > a
  {
    background-color: white;
    color: #5A4181;
  }
  
  .pagination > li > a:focus,
  .pagination > li > a:hover,
  .pagination > li > span:focus,
  .pagination > li > span:hover
  {
    color: #5a5a5a;
    background-color: #eee;
    border-color: #ddd;
  }
  
  .pagination > .active > a
  {
    color: white;
    background-color: #5A4181 !Important;
    border: solid 1px #5A4181 !Important;
  }
  
  .pagination > .active > a:hover
  {
    background-color: #5A4181 !Important;
    border: solid 1px #5A4181;
  }
  
  .dropdown > ul{
    background-color: #5a5a5a !Important;
  }

  .navigation{
    padding-left: 2%;
  }
  
  .full-height{
    height: 100%;
  }
  
  .center-content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .border-box {
    border: 1px solid #ccc;
    padding: 0;
  }
  
`;