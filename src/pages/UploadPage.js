
import Container from "react-bootstrap/esm/Container";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import FirmwareUploadDropzone from "../components/dropzone/UploadDropzones/FirmwareUploadDropzone";






function UploadPage() {
  return (
    <Container>
      <Row>
        <Col md={{ span: 12, offset: 0 }}>
          <h2>Upload Android Firmware</h2>
          <p>Upload an Android firmware archive and let FirmwareDroid scan it's contents.</p>
          <FirmwareUploadDropzone />
          <p>By uploading a file you agree to the terms and conditions of this service.</p>
        </Col>
      </Row>
    </Container>
  );
}

export default UploadPage;