import Container from "react-bootstrap/esm/Container";
import React from "react";
import AppScanTable from "../components/tables/AndroidAppTables/AppScanTable";
import {useParams} from "react-router-dom";
import {Alert, Button, Col, Row, Spinner} from "react-bootstrap";
import {useFetch} from "../hooks/fetch/useFetch";
import {useCookies} from 'react-cookie';
import {useState} from "react";

const ScannerPage = () => {
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [selectedRows, setselectedRows] = useState([]);

  let { scannerId } = useParams(); // TODO validate URL parameter scannerID
  scannerId = parseInt(scannerId);
  const [csrfCookie,] = useCookies(['csrf_access_token']);
  const requestOptions = {
    method: 'GET',
    headers: {
      "X-CSRF-TOKEN": csrfCookie.csrf_access_token
    },
    credentials: "same-origin"
  };
  const requestUrl = "https://firmwaredroid.cloudlab.zhaw.ch/api/v1/settings/client_setting/";
  const [isLoading, clientSettings] = useFetch(requestUrl, requestOptions);

  let showError = false;
  let isScannerActive = undefined;
  let scannerName = undefined;
  let dataFieldName = undefined;
  let dataFieldLabel = undefined;
  let scanUrl = "https://firmwaredroid.cloudlab.zhaw.ch/api/v1/";
  // TODO Get rid of this ugly switch statement - make things more dynamic and scalable
  if(!isLoading){
    switch (scannerId){
      case 0:
        scannerName = "AndroGuard";
        isScannerActive = clientSettings.active_scanners_dict[scannerName];
        dataFieldName = "androguard_report_reference";
        dataFieldLabel = "AndroGuard-ID";
        scanUrl += scannerName + "/";
        break;
      case 1:
        scannerName = "Androwarn";
        isScannerActive = clientSettings.active_scanners_dict[scannerName];
        dataFieldName = "androwarn_report_reference";
        dataFieldLabel = "Androwarn-ID";
        scanUrl += scannerName + "/";
        break;
      case 2:
        scannerName = "APKiD";
        isScannerActive = clientSettings.active_scanners_dict[scannerName];
        dataFieldName = "apkid_report_reference";
        dataFieldLabel = "APKiD-ID";
        scanUrl += scannerName + "/";
        break;
      case 3:
        scannerName = "Qark";
        isScannerActive = clientSettings.active_scanners_dict[scannerName];
        dataFieldName = "qark_report_reference";
        dataFieldLabel = "Qark-ID";
        scanUrl += scannerName + "/";
        break;
      case 4:
        scannerName = "VirusTotal";
        isScannerActive = clientSettings.active_scanners_dict[scannerName];
        dataFieldName = "androguard_report_reference";
        dataFieldLabel = "VirusTotal-ID";
        scanUrl += scannerName + "/";
        break;
      case 5:
        scannerName = "QuarkEngine";
        isScannerActive = clientSettings.active_scanners_dict[scannerName];
        dataFieldName = "quark_engine_report_reference";
        dataFieldLabel = "QuarkEngine-ID";
        scanUrl += "quark_engine" + "/";
        break;
      case 6:
        scannerName = "Exodus";
        isScannerActive = clientSettings.active_scanners_dict[scannerName];
        dataFieldName = "exodus_report_reference";
        dataFieldLabel = "Exodus-ID";
        scanUrl += scannerName + "/";
        break;
      case 7:
        scannerName = "SUPER";
        isScannerActive = clientSettings.active_scanners_dict[scannerName];
        dataFieldName = "super_report_reference";
        dataFieldLabel = "SUPER-ID";
        scanUrl += "super_android_analyzer" + "/";
        break;
      case 8:
        scannerName = "APKLeaks";
        isScannerActive = clientSettings.active_scanners_dict[scannerName];
        dataFieldName = "apkleaks_report_reference";
        dataFieldLabel = "APKLeaks-ID";
        scanUrl += scannerName + "/";
        break;
      default:
        showError = true
    }
  }

  const onClickScanAll = (event) => {
    scanUrl = scanUrl.toLocaleLowerCase() + "1";
    requestOptions.method = "POST";
    requestOptions.body = {
      "object_id_list": []
    };

    fetch(scanUrl, requestOptions)
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

  const onClickScanSelection = (event) => {
    let fetchUrl = scanUrl.toLocaleLowerCase() + "0";
    const options = {
      method: 'POST',
      headers: {
        "X-CSRF-TOKEN": csrfCookie.csrf_access_token,
        'Content-Type': 'application/json'
      },
      credentials: "same-origin",
      body: JSON.stringify({object_id_list: selectedRows})
    };
    fetch(fetchUrl, options)
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
    <Container fluid>
      {showError &&
      <Container>
        <p>Something went wrong...</p>
      </Container>}

      { showErrorAlert &&
      <Alert variant={'danger'} onClose={() => setShowErrorAlert(false)} dismissible>
        Error! Sorry, something went wrong...
      </Alert>
      }

      { showSuccessAlert &&
      <Alert variant={"success"} onClose={() => setShowSuccessAlert(false)} dismissible>
        Job was successfully set!
      </Alert>
      }

      {isLoading &&
      <Container>
        <Spinner variant="success" animation="grow" role="status" >
          <span className="sr-only">Loading...</span>
        </Spinner>
      </Container>}

      {!showError && !isLoading &&
      <Container fluid>
        <h2>{scannerName}</h2>
        <Container fluid style={{padding: 10}}>
          <Button variant={"outline-success"}
                  style={{margin: 5}}
                  disabled={!isScannerActive}
                  onClick={onClickScanAll}>
            Scan all
          </Button>
          <Button variant={"outline-success"}
                  style={{margin: 5}}
                  disabled={!isScannerActive}
                  onClick={onClickScanSelection}>
            Scan selection
          </Button>
        </Container>
        <AppScanTable dataFieldName={dataFieldName} dataFieldLabel={dataFieldLabel} appPageNumber={1}
                      rowSelection={[selectedRows, setselectedRows]}/>
      </Container>}
    </Container>
  );
};

export default ScannerPage;