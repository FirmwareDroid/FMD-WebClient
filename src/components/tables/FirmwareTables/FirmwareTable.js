import Table from "react-bootstrap/esm/Table";
import { string } from 'prop-types';


const FirmwareTable = () => {

  const theme = localStorage.getItem("theme");
  return (
    <Table striped bordered hover variant={theme}>
      <thead>
      <tr>
        <th>#</th>
        <th>Firmware SHA256</th>
        <th>Uploader</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>1</td>
        <td>Mark</td>
        <td>@mdo</td>
      </tr>
      <tr>
        <td>2</td>
        <td>Jacob</td>
        <td>@fat</td>
      </tr>

      </tbody>
    </Table>
  );
};

FirmwareTable.propTypes = {
  theme: string.isRequired,
};

export default FirmwareTable;