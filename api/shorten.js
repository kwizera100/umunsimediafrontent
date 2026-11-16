export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    const text = await response.text();

    if (text && text.startsWith('http')) {
      return res.status(200).json({ shortUrl: text, originalUrl: url });
    }

    return res.status(500).json({ error: 'Shortening failed', detail: text });
  } catch (error) {
    return res.status(500).json({ error: 'Shortening failed', detail: error.message });
  }
}
