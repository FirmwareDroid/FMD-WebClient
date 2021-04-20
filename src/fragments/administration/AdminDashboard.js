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
      <p>Some basics statistics</p>
      <p>Number of Users</p>
      <p>Number of Android Apps</p>
      <p>Number of Packagenames</p>
      <p>Number of Firmware Samples</p>
      <p>GB of Firmware</p>
    </Card>
  );
};

export default AdminDashboard;