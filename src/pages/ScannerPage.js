import Container from "react-bootstrap/esm/Container";
import React from "react";
import AppScanTable from "../components/tables/AndroidAppTables/AppScanTable";
import { useParams } from "react-router-dom";
import {Button} from "react-bootstrap";

const ScannerPage = () => {
  const { scannerId } = useParams();
  // TODO validate URL parameter

  const theme = localStorage.getItem("theme");
  const cardTextTheme = theme === 'light' ? 'dark' : 'white';
  const tabsClassTheme = theme === 'light' ? 'border border-dark light-tabs' : 'border border-success bg-green dark-tabs';
  const tabClassTheme = theme === 'light' ? "light-tab" : "dark-tab";

  return (
    <Container fluid>
      <h2>Scanner - {scannerId}</h2>
      <Button>Scan all</Button>
      <Button>Scan Selected</Button>
      <AppScanTable dataFieldName={"androguard_report_reference"} dataFieldLabel={"AndroGuard-ID"} appPageNumber={1}/>
    </Container>
  );
};

export default ScannerPage;