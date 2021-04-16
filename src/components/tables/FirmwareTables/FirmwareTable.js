import {useFetch} from "../../../hooks/fetch/useFetch";
import React from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import {Container, Spinner} from "react-bootstrap";
import {dateFormatter, nullCheckFormatter} from "../../../utils/formatters/TableDataFormatter";


const FirmwareTable = () => {
  const clientSettingUrl = "https://firmwaredroid.cloudlab.zhaw.ch/api/v1/firmware/get_latest/";
  const requestOptions = {
    method: 'GET',
  };
  const [isLoading, tableData] = useFetch(clientSettingUrl, requestOptions);
  const theme = localStorage.getItem("theme");
  const tableClasses = theme === 'light' ? 'table-light' : 'table-dark';

  const columns = [{
    dataField: 'sha256',
    text: 'Firmware SHA256',
    formatter: nullCheckFormatter
  }, {
    dataField: 'indexed_date',
    text: 'Indexed',
    formatter: dateFormatter
  }, {
    dataField: 'hasFileIndex',
    text: 'Uploader',
    formatter: nullCheckFormatter
  }];

  let containerContent = <></>;
  if(isLoading){
    containerContent = <Spinner animation="border" />
  }else{
    if(Array.isArray(tableData) && tableData.length && tableData.length > 0){
      containerContent = <BootstrapTable keyField='sha256'
                                         bordered
                                         striped
                                         hover
                                         noDataIndication="Table is Empty"
                                         classes={tableClasses}
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