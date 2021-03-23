import Container from "react-bootstrap/esm/Container";
import SearchEngine from "../components/search/SearchEngine";


function SearchPage() {
  return (
    <Container>
      <h2>SearchPage</h2>
      <p>Hello SearchPage</p>
      <SearchEngine/>
    </Container>
  );
}

export default SearchPage;