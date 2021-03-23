import { string } from 'prop-types';
import FormControl from "react-bootstrap/esm/FormControl";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";


const SearchEngine = ({}) => {
  return (
    <Form>
      <Row>
        <Col xs={10}>
          <FormControl type="text" placeholder="Search" className="mr-lg-auto" />
        </Col>
        <Col>
          <Button variant="outline-success">Search</Button>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchEngine;