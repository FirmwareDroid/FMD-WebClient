import React from "react";
import {Card} from "react-bootstrap";


const AdminDashboard = () => {
  const theme = localStorage.getItem("theme");
  const cardTextTheme = theme === 'light' ? 'dark' : 'white';

  return (
    <Card text={cardTextTheme}
          border={theme}
          bg={theme}>
      <p>Dashboard</p>
    </Card>
  );
};

export default AdminDashboard;