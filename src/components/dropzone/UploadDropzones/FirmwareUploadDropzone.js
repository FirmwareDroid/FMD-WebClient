import React from 'react'
import styled from "styled-components"
import Dropzone from 'react-dropzone'
import Container from "react-bootstrap/esm/Container";
import {ProgressBar} from "react-bootstrap";
import { useState } from "react";

const StyledContainer = styled(Container)`
    border-style: dashed;
    padding: 10vh;
    margin-top: 5vh;
    margin-bottom: 5vh;
    text-align: center;
    
    :hover {
      color: #1d9308;
      cursor: pointer;
    }
`;

function FirmwareUploadDropzone() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDropFile = (file) => {
    console.log(file);
    let request = new XMLHttpRequest();
    request.open('POST', 'https://firmwaredroid.cloudlab.zhaw.ch/api/v1/firmware/upload/');
    request.setRequestHeader("Content-Type", "multipart/form-data");

    // upload progress event
    request.upload.addEventListener('progress', function(e) {
      // upload progress as percentage
      let percent_completed = (e.loaded / e.total)*100;
      setUploadProgress(percent_completed);
      console.log(percent_completed);
    });

    // request finished event
    request.addEventListener('load', function(e) {
      // HTTP status message (200, 404 etc)
      if(request.status === 200){
        setIsUploading(true);
      }else{
        setIsUploading(false);
      }
      console.log(request.status);
      console.log(request.response);
    });

    const formData = new FormData();
    console.log(file[0]);
    formData.append("file", file);
    formData.append("type", file[0].type);
    formData.append("size", file[0].size);
    request.send(formData);
  };


  return (
    <Container fluid>
      { isUploading &&
        <ProgressBar variant="success" animated now={uploadProgress} label={`${uploadProgress}%`}/>
      }
      { !isUploading &&
        <Dropzone  onDrop={onDropFile}>

        {({getRootProps, getInputProps}) => (
          <StyledContainer onDragStart={console.log("Drag Start")}
                           onDragEnd={console.log("Drag End")}
                           fluid
                           {...getRootProps()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor"
                 className="bi bi-file-arrow-up" viewBox="0 0 16 16">
              <path
                d="M8 11a.5.5 0 0 0 .5-.5V6.707l1.146 1.147a.5.5 0 0 0 .708-.708l-2-2a.5.5 0 0 0-.708 0l-2 2a.5.5 0 1 0 .708.708L7.5 6.707V10.5a.5.5 0 0 0 .5.5z"/>
              <path
                d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
            </svg>
            <input {...getInputProps()} />
            <p style={{"padding":20}}>Drag 'n' drop a zip file here, or click to select</p>
          </StyledContainer>
        )}
      </Dropzone>
      }
    </Container>
  )
}

export default FirmwareUploadDropzone;