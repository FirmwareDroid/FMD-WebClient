import React from "react";
import {Card} from "react-bootstrap";



const ServerSettings = () => {
  const theme = localStorage.getItem("theme");
  const cardTextTheme = theme === 'light' ? 'dark' : 'white';

  return (
    <Card text={cardTextTheme}
          border={theme.toLowerCase()}
          bg={theme.toLowerCase()}>

    </Card>
  );
};

export default ServerSettings;