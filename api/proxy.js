export default async function handler(req, res) {
  // Base site URL
  const baseUrl = "https://axtra.eduniapps.com/premierleague";

  // Full URL to fetch (optional: support ?url=... for dynamic URLs)
  const url = req.query.url ? req.query.url : baseUrl;

  try {
    // Fetch the site using desktop User-Agent
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept": "*/*",
      },
    });

    let body = await response.text();

    // Rewrite internal links so they go through the proxy
    body = body.replace(
      /href="(?!https?:\/\/)([^"]*)"/g,
      'href="/?url=https://axtra.eduniapps.com/premierleague/$1"'
    );

    body = body.replace(
      /src="(?!https?:\/\/)([^"]*)"/g,
      'src="https://axtra.eduniapps.com/premierleague/$1"'
    );

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(body);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).send("Error fetching site: " + err.message);
  }
}
