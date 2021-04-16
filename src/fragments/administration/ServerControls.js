import Container from "react-bootstrap/esm/Container";
import React from "react";
import Button from "react-bootstrap/esm/Button";
import {Card, Col, Row} from "react-bootstrap";
import FirmwareImportButton from "../../components/buttons/FirmwareImportButton";


const ServerControl = () => {
  const theme = localStorage.getItem("theme");
  const cardTextTheme = theme === 'light' ? 'dark' : 'white';
  const cartBorderTheme = theme === 'light' ? 'white' : 'success';
  const cardClassTheme = theme === 'light' ? "light-card" : "dark-card";

  return (
    <Row>
      <Col xs={12} md={8} lg={8}>
        <Container fluid>
          <Card
            border={cartBorderTheme}
            className={cardClassTheme}
            text={cardTextTheme}>
            <Card.Header>Firmware Controls</Card.Header>
            <Card className={cardClassTheme}
                  text={cardTextTheme}
                  border={cartBorderTheme}
            >
              <Card.Body>
                <Row>
                  <Col sm={3}>
                    <FirmwareImportButton />
                  </Col>
                  <Col ><p>You can manually start the process of importing Android firmware. Currently there are
                    XX files waiting to be imported.</p>
                  </Col>
                </Row>
                <Row>
                  <Col sm={3}>
                    <Button variant={"outline-danger"}>Stop Firmware Import</Button>
                  </Col>
                  <Col >
                    <p>Yet to be implemented</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Card>
        </Container>
      </Col>
    </Row>
  );
};

export default ServerControl;