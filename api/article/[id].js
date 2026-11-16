import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;
  const API_URL = process.env.VITE_API_URL || 'https://fggg.space/api';

  const articleId = Array.isArray(id) ? id[0] : id;

  let ogTitle = 'Umunsi Media - Article';
  let ogDescription = 'Read this article on Umunsi Media';
  let ogImage = '';
  let ogUrl = `https://writer.umunsi.com/a/${articleId}`;
  let authorName = 'Umunsi Media';

  try {
    const response = await fetch(`${API_URL}/articles/${articleId}`, {
      headers: { 'User-Agent': 'Vercel-OG-Bot/1.0' },
    });

    if (response.ok) {
      const data = await response.json();
      const article = data.data || data;

      if (article) {
        authorName = article.author
          ? `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim() ||
            article.author.username || 'Umunsi Media'
          : 'Umunsi Media';

        ogTitle = article.title
          ? `${article.title} | Umunsi Media`
          : `${authorName} wrote an article on Umunsi Media`;

        const content = article.content || '';
        if (content) {
          const stripped = content.replace(/<[^>]*>/g, '').substring(0, 200);
          ogDescription = stripped + (content.length > 200 ? '...' : '');
        } else if (article.excerpt) {
          ogDescription = article.excerpt.substring(0, 200);
        } else {
          ogDescription = `Read this article by ${authorName} on Umunsi Media`;
        }

        if (article.image) {
          const img = typeof article.image === 'string' ? article.image : article.image.url;
          if (img) {
            ogImage = img.startsWith('http') ? img : `https://fggg.space/uploads/articles/${img}`;
          }
        } else if (article.coverImage) {
          const cover = typeof article.coverImage === 'string' ? article.coverImage : article.coverImage.url;
          if (cover) {
            ogImage = cover.startsWith('http') ? cover : `https://fggg.space/uploads/covers/${cover}`;
          }
        } else if (article.author && article.author.avatar) {
          ogImage = article.author.avatar;
        }
      }
    }
  } catch (e) {
    // Silently fail - return default OG tags
  }

  let spaHtml = '';
  try {
    const distPath = path.join(process.cwd(), 'dist', 'index.html');
    spaHtml = fs.readFileSync(distPath, 'utf-8');
  } catch (e) {
    spaHtml = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head><body><div id="root"></div></body></html>';
  }

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
