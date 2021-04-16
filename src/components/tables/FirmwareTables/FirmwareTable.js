import {useFetch} from "../../../hooks/fetch/useFetch";
import React from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import {Container, Spinner} from "react-bootstrap";


const FirmwareTable = () => {
  const clientSettingUrl = "https://firmwaredroid.cloudlab.zhaw.ch/api/v1/firmware/get_latest/";
  const requestOptions = {
    method: 'GET',
  };
  const [isLoading, tableData] = useFetch(clientSettingUrl, requestOptions);
  const nullChecker = cell => (!cell ? "-" : cell);
  const theme = localStorage.getItem("theme");

  const columns = [{
    dataField: 'sha256',
    text: 'Firmware SHA256',
    formatter: nullChecker
  }, {
    dataField: 'name',
    text: 'Product Name',
    formatter: nullChecker
  }, {
    dataField: 'price',
    text: 'Product Price',
    formatter: nullChecker
  }];

  const onNoTableData = (event) => {
    console.log("No table data")
  };

  let containerContent = <></>;
  if(isLoading){
    containerContent = <Spinner animation="border" />
  }else{
    if(Array.isArray(tableData) && tableData.length && tableData.length > 0){
      containerContent = <BootstrapTable keyField='sha256'
                                         variant={theme}
                                         noDataIndication={onNoTableData}
                                         data={tableData}
                                         columns={columns} />
    }else{
      containerContent = <h5>No firmware data so far... Sign in and upload some firmware to get started</h5>
    }
  }

  return (
    <Container>
      {containerContent}
    </Container>

  );
};

export default FirmwareTable;