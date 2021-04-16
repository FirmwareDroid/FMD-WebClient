import React from "react";
import Button from "react-bootstrap/esm/Button";


const FirmwareImportButton = () => {


  const onClickButton = (event) => {

  };

  return (
    <Button type="submit" variant={"outline-success"} onClick={onClickButton}>Run Firmware Import</Button>
  );
};

export default FirmwareImportButton;