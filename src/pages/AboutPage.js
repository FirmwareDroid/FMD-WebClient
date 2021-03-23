import Container from "react-bootstrap/esm/Container";


function AboutPage() {
  return (
    <Container>
      <div>
        <h2>About the project</h2>
        <p>The FirmwareDroid project was initial developed by Thomas Sutter in partial fulfillment of the requirements
          for the degree of Master of Science in Engineering at the Zurich University of Applied Sciences. </p>
      </div>
      <div>
        <h2>Credits</h2>
        <h4>Icons</h4>
        <ul>
          <li><small><b>Sun</b> icon made by <a href="https://www.flaticon.com/authors/smalllikeart">smalllikeart</a> from <a href="https://www.flaticon.com">www.flaticon.com</a></small></li>
          <li><small><b>Moon</b> icon made by <a href="https://www.freepik.com/home">Freepik</a> from <a href="https://www.flaticon.com">www.flaticon.com</a></small></li>
        </ul>
        <p>...and many more.</p>
        <h2>Licence and Terms of Service</h2>
        <p>FirmwareDroid is licenced under the GNUv3 (<a href="">see licence</a>).</p>
        <p>
          The FirmwareDroid software contains code written by third parties. Such software will have its own individual
          licences. You as a user of this software must review, accept and comply with the license terms of each
          software.
        </p>
      </div>
    </Container>
  );
}

export default AboutPage;