import React from "react";
import Button from "react-bootstrap/esm/Button";
import {Alert, Card, Col, Container, Row} from "react-bootstrap";
import {useCookies} from 'react-cookie';
import { useState } from "react";

const FirmwareControls = () => {
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const theme = localStorage.getItem("theme");
  const cardTextTheme = theme === 'light' ? 'dark' : 'white';
  const cartBorderTheme = theme === 'light' ? 'white' : 'success';
  const cardClassTheme = theme === 'light' ? "light-card" : "dark-card";
  const [csrfCookie,] = useCookies(['csrf_access_token']);

  const onClickFirmwareImport = (event) => {
    const requestUrl = "https://firmwaredroid.cloudlab.zhaw.ch/api/v1/firmware/start_importer/";
    const requestOptions = {
      method: 'POST',
      headers: {
        "X-CSRF-TOKEN": csrfCookie.csrf_access_token
      },
      credentials: "same-origin"
    };
    fetch(requestUrl, requestOptions)
      .then((response) => {
        if (response.ok) {
          setShowSuccessAlert(true);
          return response.json();
        } else {
          setShowErrorAlert(true)
        }
      })
      .catch(error => {
        console.error(error);
      });
  };


  return (
    <Container fluid style={{"marginTop": 20}}>
      <h4>Firmware Management</h4>
      <Card className={cardClassTheme}
            text={cardTextTheme}
            border={cartBorderTheme}
      >
        <Card.Body>
          <Row>
            <Col sm={3}>
              <Button variant={"outline-success"} onClick={onClickFirmwareImport}>Run Firmware Import</Button>
            </Col>
            <Col >
              <p>Status: XX</p>
              <p>You can manually start the process of importing Android firmware. Currently there are
              XX files waiting to be imported.</p>
              { showErrorAlert &&
                <Alert transition variant={'danger'} onClose={() => setShowErrorAlert(false)} dismissible>
                  Error! Sorry, something went wrong...
                </Alert>
              }
              { showSuccessAlert &&
                <Alert transition variant={"success"} onClose={() => setShowSuccessAlert(false)} dismissible>
                  Job was successfully set!
                </Alert>
              }
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FirmwareControls;