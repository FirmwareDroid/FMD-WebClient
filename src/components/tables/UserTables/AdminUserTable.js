import Table from "react-bootstrap/esm/Table";
import { string } from 'prop-types';


const AdminUserTable = ({ theme }) => {
  return (
    <Table striped bordered hover variant={theme}>
      <thead>
      <tr>
        <th>#</th>
        <th>E-Mail</th>
        <th>Username</th>
        <th>Role</th>
        <th>Options</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>1</td>
        <td>Mark</td>
        <td>@mdo</td>
        <td>User</td>
        <td>EDIT | DELETE</td>
      </tr>
      <tr>
        <td>2</td>
        <td>Jacob</td>
        <td>@fat</td>
        <td>Admin</td>
        <td>EDIT | DELETE</td>
      </tr>
      </tbody>
    </Table>
  );
};

AdminUserTable.propTypes = {
  theme: string.isRequired,
};

export default AdminUserTable;