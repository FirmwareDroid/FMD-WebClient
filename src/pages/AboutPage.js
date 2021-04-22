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
            <h2>About the project</h2>
            <p>The FirmwareDroid project was initial developed by Thomas Sutter in partial fulfillment of the requirements
              for the degree of master of science in engineering at the Zurich University of Applied Sciences.
            </p>
          </div>
          <div>
            <h3>Credits</h3>
            <h4>Icons</h4>
            <ul>
              <li><small>Icons from <a href="https://icons.getbootstrap.com/">icons.getbootstrap.com</a></small></li>
            </ul>
            <p>...and many more.</p>
            <h3>Licence</h3>
            <p>FirmwareDroid is licenced under the GNUv3
              (<a href="https://github.com/FirmwareDroid/FirmwareDroid/blob/main/LICENSE.md">see licence</a>).</p>
            <p>
              The FirmwareDroid software contains code written by third parties. Such software will have its own individual
              licences. You as a user of this software must review, accept and comply with the license terms of each
              software.
            </p>
            <h3>Conditions and Terms of Service</h3>
          </div>
        </Card.Body>
        <Card.Footer>
          <small className="text-muted">
            <a href={"https://github.com/FirmwareDroid/FirmwareDroid"}>
              You can find more infos on our Github repository...
            </a>
          </small>
        </Card.Footer>
      </Card>


    </Container>
  );
}

export default AboutPage;