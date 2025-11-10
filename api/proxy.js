import fetch from "node-fetch";

export default async function handler(req, res) {
  const url = "https://axtra.eduniapps.com/premierleague";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept": "*/*",
      },
    });

    const body = await response.text();

    // Serve fetched HTML
    res.setHeader("Content-Type", "text/html");
    res.send(body);
  } catch (err) {
    res.status(500).send("Error fetching the site: " + err.message);
  }
}
