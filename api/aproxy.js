// api/proxy.js
const fetch = globalThis.fetch;

const ALLOWED_HOSTS = ["axtra.eduniapps.com"]; // your domain only

module.exports = async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      res.statusCode = 400;
      return res.end("Missing url param");
    }

    const parsed = new URL(url);
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      res.statusCode = 403;
      return res.end("Host not allowed");
    }

    // Force desktop user-agent so site thinks it's a desktop browser
    const desktopUA =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/118.0.5993.90 Safari/537.36";

    const upstreamResp = await fetch(url, {
      method: req.method,
      headers: {
        "User-Agent": desktopUA,
        "Accept": req.headers["accept"] || "*/*",
      },
    });

    // Pass headers
    res.statusCode = upstreamResp.status;
    upstreamResp.headers.forEach((v, k) => {
      if (!["transfer-encoding","connection","keep-alive"].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });

    // Allow access from anywhere
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Stream response body
    const reader = upstreamResp.body.getReader();
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
