import React from "react";
import {Button, Card, Form} from "react-bootstrap";


const ScannerCard = ({cardTitle, cardInfoText, cardRedirectLink, cardFooterLink}) => {
  const theme = localStorage.getItem("theme");
  const cardTextTheme = theme === 'light' ? 'dark' : 'white';
  const cartBorderTheme = theme === 'light' ? 'white' : 'success';
  const cardClassTheme = theme === 'light' ? "light-card" : "dark-card";

  return (
    <Card className={cardClassTheme}
          text={cardTextTheme}
          border={cartBorderTheme}>
      <Card.Body>
        <Card.Title><a href={cardRedirectLink}>{cardTitle}</a></Card.Title>
        <Card.Text>
          {cardInfoText}
        </Card.Text>
        <Form>
          <Button variant={"outline-success"} type="submit" formAction={cardRedirectLink}>Go to {cardTitle}</Button>
        </Form>
      </Card.Body>
      <Card.Footer>
        <small className="text-muted">
          <a href={cardFooterLink}>
            More infos...
          </a>
        </small>
      </Card.Footer>
    </Card>
  );
};

export default ScannerCard;