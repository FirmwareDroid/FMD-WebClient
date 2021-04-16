import React from "react";
import {Card} from "react-bootstrap";
import AdminUserTable from "../../components/tables/UserTables/AdminUserTable";


const UserManagement = () => {
  const theme = localStorage.getItem("theme");
  const cardTextTheme = theme === 'light' ? 'dark' : 'white';

  return (
    <Card text={cardTextTheme}
          border={theme.toLowerCase()}
          bg={theme.toLowerCase()}>
      <p>Test Users</p>
      <AdminUserTable theme={theme}/>
    </Card>
  );
};

export default UserManagement;