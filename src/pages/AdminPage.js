import Container from "react-bootstrap/esm/Container";
import React from "react";
import {Card, Tab, Tabs} from "react-bootstrap";
import ServerControl from "../fragments/administration/ServerControls";
import UserManagement from "../fragments/administration/UserManagement";
import AdminDashboard from "../fragments/administration/AdminDashboard";
import ServerSettings from "../fragments/administration/ServerSettings";
import ServerLogs from "../fragments/administration/ServerLogs";


const AdminPage = () => {
  const theme = localStorage.getItem("theme");
  const cardTextTheme = theme === 'light' ? 'dark' : 'white';
  const tabsClassTheme = theme === 'light' ? 'border border-dark light-tabs' : 'border border-success bg-green dark-tabs';
  const tabClassTheme = theme === 'light' ? "light-tab" : "dark-tab";

  return (
    <Container fluid>
      <h2>Administration</h2>
      <Tabs className={tabsClassTheme}
            fluid
            defaultActiveKey="serverActions"
            variant="pills"
            fill>
        <Tab
          className={tabClassTheme}
          eventKey="dashboard"
          title="Dashboard">
          <Card text={cardTextTheme}
                border={theme}
                bg={theme}>
            <AdminDashboard />
          </Card>
        </Tab>
        <Tab eventKey="serverActions"
             title="Server Controls"
             className={tabClassTheme}>
          <ServerControl />
        </Tab>
        <Tab eventKey="users"
             title="User Controls"
             className={tabClassTheme}
             >
          <UserManagement />
        </Tab>
        <Tab eventKey="settings"
             className={tabClassTheme}
             title="Server Settings">
          <Card text={cardTextTheme}
                border={theme.toLowerCase()}
                bg={theme.toLowerCase()}>
            <ServerSettings />
          </Card>
        </Tab>
        <Tab eventKey="logs"
             className={tabClassTheme}
             title="Server Logs">
          <ServerLogs />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminPage;