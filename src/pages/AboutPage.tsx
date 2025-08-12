import Container from "react-bootstrap/esm/Container";
import {Card} from "react-bootstrap";
import React from "react";

function AboutPage() {
  const theme = localStorage.getItem("theme");
  const cardTextTheme = theme === 'light' ? 'dark' : 'white';
  const cartBorderTheme = theme === 'light' ? 'white' : 'success';
  const cardClassTheme = theme === 'light' ? "light-card" : "dark-card";


  return (
    <Container>
      <Card className={cardClassTheme}
            text={cardTextTheme}
            border={cartBorderTheme}>
        <Card.Body>
          <div>
            <p>FirmwareDroid is a framework made for analysing Android firmware on scale. The initial framework was
              developed at the Zurich University of Applied Sciences (ZHAW) by Thomas Sutter. You can find more
              infos about the project on our <a href={"https://github.com/FirmwareDroid/FirmwareDroid"}>Github repository.</a>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AboutPage;