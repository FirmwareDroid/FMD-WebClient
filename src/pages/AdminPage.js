import Container from "react-bootstrap/esm/Container";
import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import AdminUserTable from "../components/tables/UserTables/AdminUserTable";


const AdminPage = ({ theme }) => {
  return (
    <Container>
      <h2>Administration</h2>
      <Tabs defaultActiveKey="users" id="uncontrolled-tab-example" variant="pills">
        <Tab eventKey="users" title="Users">
          <p>Test Users</p>
          <AdminUserTable theme={theme}/>
        </Tab>
        <Tab eventKey="settings" title="Settings">

        </Tab>
      </Tabs>
    </Container>
  );
}

export default AdminPage;