import Dropzone from 'react-dropzone'
import Container from "react-bootstrap/esm/Container";


function UploadPage() {
  return (
    <Container>
      <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
        {({getRootProps, getInputProps}) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
          </section>
        )}
      </Dropzone>
    </Container>
  );
}

export default UploadPage;