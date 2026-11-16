import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;
  const API_URL = process.env.VITE_API_URL || 'https://fggg.space/api';

  const postId = Array.isArray(id) ? id[0] : id;

  // Default OG values
  let ogTitle = 'Umunsi Media - Social Media Platform';
  let ogDescription = 'A modern social media platform with chat, clubs, articles, and community features';
  let ogImage = '';
  let ogUrl = `https://writer.umunsi.com/p/${postId}`;
  let authorName = 'Umunsi Media';

  // Fetch post data for OG tags
  try {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      headers: { 'User-Agent': 'Vercel-OG-Bot/1.0' },
    });

    if (response.ok) {
      const data = await response.json();
      const post = data.data || data;

      if (post) {
        authorName = post.author
          ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() ||
            post.author.username || 'Umunsi Media'
          : 'Umunsi Media';

        const content = post.content || '';
        ogDescription = content
          ? content.substring(0, 200) + (content.length > 200 ? '...' : '')
          : `View this post by ${authorName} on Umunsi Media`;

        ogTitle = `${authorName} posted on Umunsi Media`;

        if (post.images && post.images.length > 0) {
          const firstImage = post.images[0];
          ogImage = typeof firstImage === 'string' ? firstImage : firstImage.url;
        } else if (post.image) {
          ogImage = post.image;
        } else if (post.author && post.author.avatar) {
          ogImage = post.author.avatar;
        }
      }
    }
  } catch (e) {
    // Silently fail - return default OG tags
  }

  // Read the built index.html to get SPA bootstrap scripts
  let spaHtml = '';
  try {
    const distPath = path.join(process.cwd(), 'dist', 'index.html');
    spaHtml = fs.readFileSync(distPath, 'utf-8');
  } catch (e) {
    spaHtml = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head><body><div id="root"></div></body></html>';
  }

  // Build OG meta tags
  const ogTags = `
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${escapeHtml(ogUrl)}" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(ogDescription)}" />
  <meta property="og:site_name" content="Umunsi Media" />
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ''}
  ${ogImage ? `<meta property="og:image:width" content="1200" />` : ''}
  ${ogImage ? `<meta property="og:image:height" content="630" />` : ''}
  <meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:url" content="${escapeHtml(ogUrl)}" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
  ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : ''}
  <meta name="description" content="${escapeHtml(ogDescription)}" />
  <title>${escapeHtml(ogTitle)}</title>`;

  // Remove existing title tag if present, then inject OG tags before </head>
  let finalHtml = spaHtml.replace(/<title>.*?<\/title>/is, '');
  finalHtml = finalHtml.replace('</head>', `${ogTags}\n</head>`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(finalHtml);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
