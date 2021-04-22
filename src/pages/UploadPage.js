import Container from "react-bootstrap/esm/Container";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import FirmwareUploadDropzone from "../components/dropzone/UploadDropzones/FirmwareUploadDropzone";
import {Card, ProgressBar} from "react-bootstrap";
import React from "react";



function UploadPage() {
  const theme = localStorage.getItem("theme");
  const cardTextTheme = theme === 'light' ? 'dark' : 'white';
  const cartBorderTheme = theme === 'light' ? 'white' : 'success';
  const cardClassTheme = theme === 'light' ? "light-card" : "dark-card";


  return (
    <Container>
      <Row>
        <Col md={{ span: 12, offset: 0 }}>
          <Card className={cardClassTheme}
                text={cardTextTheme}
                border={cartBorderTheme}>
            <Card.Body>
              <h2>Upload Android Firmware</h2>
              <p>Upload an Android firmware archive (.zip file) and let FirmwareDroid scan it's contents.</p>
              <ProgressBar variant="success" animated now={45} label={"45%"}/>
              <FirmwareUploadDropzone />
              <p>
                After you have uploaded a firmware archive FirmwareDroid will automatically extract all Android apps.
                The apps will then be scanned with state-of-the-art vulnerability and malware scanners and the scanning
                results will be available for further analysis.
              </p>
            </Card.Body>
            <Card.Footer>
              <small className="text-muted">
                <a href={"/about"}>
                  By uploading a file you agree to the terms and conditions of this service.
                </a>
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default UploadPage;