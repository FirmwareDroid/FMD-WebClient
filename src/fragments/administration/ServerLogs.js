import React from "react";
import {Card} from "react-bootstrap";


const ServerLogs = () => {
  const theme = localStorage.getItem("theme");
  const cardTextTheme = theme === 'light' ? 'dark' : 'white';

  return (
    <Card text={cardTextTheme}
          border={theme}
          bg={theme}>
      <p>Not implemented yet</p>
    </Card>
  );
};

export default ServerLogs;