const fetch = globalThis.fetch;

const ALLOWED_HOSTS = ["axtra.eduniapps.com"];

module.exports = async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).end("Missing url param");

    const parsed = new URL(url);
    if (!ALLOWED_HOSTS.includes(parsed.hostname))
      return res.status(403).end("Host not allowed");

    const desktopUA =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/118.0.5993.90 Safari/537.36";

    const upstream = await fetch(url, {
      method: req.method,
      headers: { "User-Agent": desktopUA },
    });

    res.statusCode = upstream.status;
    upstream.headers.forEach((v, k) => {
      if (!["transfer-encoding", "connection", "keep-alive"].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });
    res.setHeader("Access-Control-Allow-Origin", "*");

    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end("Proxy error");
  }
};
