import Container from "react-bootstrap/esm/Container";
import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import AdminUserTable from "../components/tables/UserTables/AdminUserTable";
import React from "react";
import Button from "react-bootstrap/esm/Button";


const AdminPage = ({ theme }) => {
  return (
    <Container>
      <h2>Administration</h2>
      <Tabs defaultActiveKey="users" id="uncontrolled-tab-example" variant="pills" fill>
        <Tab eventKey="users" title="Users">
          <Container>
            <p>Test Users</p>
            <AdminUserTable theme={theme}/>
          </Container>
        </Tab>
        <Tab eventKey="settings" title="Settings">
          <Container>
            <p>Activate Sign Up</p>
            <p>Allow Sign Up</p>
            <Button variant="outline-success" type="submit">
              Save
            </Button>
          </Container>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminPage;