
import "./App.css";
import {
  FormControl,
  InputGroup,
  Container,
  Button,
  Card,
  Row,
} from "react-bootstrap";
import { useState, useEffect } from "react";

// Use a temp token here if you have issues with env vars or CORS
// const [accessToken, setAccessToken] = useState("YOUR_TEMP_TOKEN_HERE");

const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);

  // Get access token from Spotify (only works server-side)
  useEffect(() => {
    const authParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        clientId +
        "&client_secret=" +
        clientSecret,
    };

    fetch("https://accounts.spotify.com/api/token", authParams)
      .then((res) => res.json())
      .then((data) => setAccessToken(data.access_token));
  }, []);

  async function search() {
    if (!searchInput.trim()) return;

    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    };

    // Step 1: Search for the artist by name
    const artistRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        searchInput
      )}&type=artist&limit=1`,
      { headers }
    );
    const artistData = await artistRes.json();

    if (!artistData.artists.items.length) {
      alert("Artist not found.");
      return;
    }

    const artistID = artistData.artists.items[0].id;

    // Step 2: Fetch that artist's albums
    const albumRes = await fetch(
      `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=US&limit=12`,
      { headers }
    );
    const albumData = await albumRes.json();
    setAlbums(albumData.items);
  }

  return (
    <>
      <Container className="my-3">
        <InputGroup>
          <FormControl
            placeholder="Search for Artist"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            style={{
              width: "300px",
              height: "35px",
              borderRadius: "5px",
              marginRight: "10px",
              paddingLeft: "10px",
            }}
          />
          <Button onClick={search}>Search</Button>
        </InputGroup>
      </Container>

      <Container>
        <Row
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {albums.map((album) => (
            <Card
              key={album.id}
              style={{
                backgroundColor: "white",
                margin: "10px",
                borderRadius: "5px",
                width: "200px",
              }}
            >
              {album.images[0]?.url && (
                <Card.Img
                  variant="top"
                  src={album.images[0].url}
                  style={{ borderRadius: "4%" }}
                />
              )}
              <Card.Body>
                <Card.Title
                  style={{
                    fontWeight: "bold",
                    fontSize: "18px",
                    color: "black",
                  }}
                >
                  {album.name}
                </Card.Title>
                <Card.Text style={{ color: "black" }}>
                  Release Date: <br /> {album.release_date}
                </Card.Text>
                <Button
                  href={album.external_urls.spotify}
                  target="_blank"
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "14px",
                    borderRadius: "5px",
                  }}
                >
                  View on Spotify
                </Button>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>
    </>
  );
}

export default App;
