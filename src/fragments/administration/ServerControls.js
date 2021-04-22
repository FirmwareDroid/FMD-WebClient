import Container from "react-bootstrap/esm/Container";
import React from "react";
import {Col, Row} from "react-bootstrap";
import ScannerControls from "./scanner-controls/ScannerControls";
import FirmwareControls from "./scanner-controls/FirmwareControls";

const ServerControl = () => {
  return (
    <Row>
      <Col>
        <Container fluid>
          <FirmwareControls />
          <ScannerControls />
        </Container>
      </Col>
    </Row>
  );
};

export default ServerControl;