import Container from "react-bootstrap/esm/Container";
import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import AdminUserTable from "../components/tables/UserTables/AdminUserTable";
import React from "react";
import Button from "react-bootstrap/esm/Button";
import {Card, Col, ListGroup, Row} from "react-bootstrap";


const AdminPage = () => {
  const theme = localStorage.getItem("theme");
  const themeOpposite = theme.toLowerCase() === 'light' ? 'dark' : 'light';
  const cardTextTheme = theme.toLowerCase() === 'light' ? 'dark' : 'white';
  console.log(theme);
  return (
    <Container fluid>
      <h2>Administration</h2>
      <Tabs fluid defaultActiveKey="serverActions" variant="pills" fill>
        <Tab eventKey="dashboard" title="Dashboard">
          <Card text={cardTextTheme}
                border={theme.toLowerCase()}
                bg={theme.toLowerCase()}>
            <p>Stats overview</p>
          </Card>
        </Tab>
        <Tab eventKey="serverActions" title="Server Controls" style={{"padding": 30}}>
          <Row>
            <Col xs={4} md={4} lg={3}>
              <Card style={{ width: '18rem' }}
                    text={cardTextTheme}
                    border={theme}
                    bg={theme}>
                <ListGroup>
                  <ListGroup.Item active action variant={"primary"}>Cras justo odio</ListGroup.Item>
                  <ListGroup.Item action variant={theme}>Dapibus ac facilisis in</ListGroup.Item>
                  <ListGroup.Item action variant={theme}>Vestibulum at eros</ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
            <Col xs={12} md={8} lg={8}>
              <Container fluid>
                <Card border="primary" bg={theme} text={cardTextTheme}>
                  <Card.Header>Firmware Controls</Card.Header>
                  <Card style={{"margin": 10}}
                        text={cardTextTheme}
                        border={"success"}
                        bg={theme}>
                    <p>Start Mass Import</p>
                    <Button>Test</Button>
                  </Card>
                </Card>
              </Container>
            </Col>
          </Row>
          <Row>
            <Col md={{ span: 8, offset: 3 }}>
              <Container fluid>
                <Card border="primary" bg={theme} text={cardTextTheme}>
                  <Card.Header>Android app controls</Card.Header>
                  <Card style={{"margin": 10}}
                        text={cardTextTheme}
                        border={"success"}
                        bg={theme}>
                    <p>Start Mass Import</p>
                    <Button>Test</Button>
                  </Card>
                </Card>
              </Container>
            </Col>
          </Row>
        </Tab>
        <Tab eventKey="users" title="User Controls">
          <Card text={cardTextTheme}
                border={theme.toLowerCase()}
                bg={theme.toLowerCase()}>
            <p>Test Users</p>
            <AdminUserTable theme={theme}/>
          </Card>
        </Tab>
        <Tab eventKey="settings" title="Server Settings">
          <Card text={cardTextTheme}
                border={theme.toLowerCase()}
                bg={theme.toLowerCase()}>
            <p>Activate Sign Up</p>
            <p>Allow Sign Up</p>
            <Button variant="outline-success" type="submit">
              Save
            </Button>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminPage;