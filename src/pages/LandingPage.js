import Container from "react-bootstrap/esm/Container";
import FirmwareTable from "../components/tables/FirmwareTables/FirmwareTable";
import { string } from 'prop-types';
import SearchEngine from "../components/search/SearchEngine";


const styles = {
  grid: {
    marginTop: 40
  },

};



const LandingPage = ({ theme }) => {
  return (
    <>
      <Container fluid="md">
        <h2>Welcome to FirmwareDroid</h2>
        <p>Add here some basic introduction Text</p>

        <Container>
          <SearchEngine/>
        </Container>
      </Container>
      <Container style={styles.grid}>
        <h3>Latest Firmware Scans</h3>
        <FirmwareTable theme={theme}/>
      </Container>
    </>
  );
};

LandingPage.propTypes = {
  theme: string.isRequired,
};

export default LandingPage;