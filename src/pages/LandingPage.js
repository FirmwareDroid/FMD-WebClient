import Container from "react-bootstrap/esm/Container";
import FirmwareTable from "../components/tables/FirmwareTables/FirmwareTable";
import { string } from 'prop-types';
import SearchEngine from "../components/search/SearchEngine";
import Jumbotron from "react-bootstrap/esm/Jumbotron";
import {darkTheme, lightTheme} from "../assets/theming/theme";
import Card from "react-bootstrap/esm/Card";


const styles = {
  grid: {
    marginTop: 40
  }
};



const LandingPage = ({ theme }) => {
  let jumbotronStyle = {};
  if (theme === 'light'){
    jumbotronStyle = {
      jumbotron: {
        'backgroundColor': "#C0C0C0"
      }
    }
  }else{
    jumbotronStyle = {
      jumbotron: {
        'backgroundColor': '#19125C'
      }
    }
  }

  return (
    <>
      <Container fluid="md">
        <Jumbotron style={jumbotronStyle.jumbotron}>
          <h1>Welcome to FirmwareDroid!</h1>
          <p>
            Have you every wondered what's running on your smartphone? We do! Time to find it out.
          </p>
          <Container>
            <SearchEngine/>
          </Container>
        </Jumbotron>


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