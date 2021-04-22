import React from "react";
import Button from "react-bootstrap/esm/Button";
import {Card, Col, Container, Row} from "react-bootstrap";


const FirmwareControls = () => {
  const theme = localStorage.getItem("theme");
  const cardTextTheme = theme === 'light' ? 'dark' : 'white';
  const cartBorderTheme = theme === 'light' ? 'white' : 'success';
  const cardClassTheme = theme === 'light' ? "light-card" : "dark-card";

  const onClickButton = (event) => {

  };


  return (
    <Container fluid style={{"margin-top": 20}}>
      <h4>Firmware Management</h4>
      <Card className={cardClassTheme}
            text={cardTextTheme}
            border={cartBorderTheme}
      >
        <Card.Body>
          <Row>
            <Col sm={3}>
              <Button type="submit" variant={"outline-success"} onClick={onClickButton}>Run Firmware Import</Button>
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
    </Container>
  );
};

export default FirmwareControls;