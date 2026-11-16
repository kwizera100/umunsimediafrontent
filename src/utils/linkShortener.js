const BASE_URL = 'https://writer.umunsi.com';

const urlCache = new Map();

export const shortenUrl = async (longUrl) => {
  // Return the direct URL — it's already short (writer.umunsi.com/p/...)
  // and has proper OG tags. Avoids TinyURL interstitial pages on mobile.
  return longUrl;
};

export const getShortPostUrl = (postId) => {
  return `${BASE_URL}/p/${postId}`;
};

export const getShortenedPostUrl = async (postId) => {
  return shortenUrl(getShortPostUrl(postId));
};

export const getShortArticleUrl = (articleId) => {
  return `${BASE_URL}/a/${articleId}`;
};

export const getShortenedArticleUrl = async (articleId) => {
  return shortenUrl(getShortArticleUrl(articleId));
};

export const getShortClubUrl = (clubId) => {
  return `${BASE_URL}/c/${clubId}`;
};

export const getShortenedClubUrl = async (clubId) => {
  return shortenUrl(getShortClubUrl(clubId));
};

export const getShortProfileUrl = (username) => {
  return `${BASE_URL}/u/${username}`;
};

export const getShortenedProfileUrl = async (username) => {
  return shortenUrl(getShortProfileUrl(username));
};

export const getPostUrl = (postId) => {
  return `${BASE_URL}/post/${postId}`;
};

export const getArticleUrl = (articleId) => {
  return `${BASE_URL}/articles/${articleId}`;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (err) {
      document.body.removeChild(textarea);
      return false;
    }
  }
};

export const copyShortLink = async (longUrl) => {
  const short = await shortenUrl(longUrl);
  await copyToClipboard(short);
  return short;
};

export default {
  shortenUrl,
  getShortPostUrl,
  getShortenedPostUrl,
  getShortArticleUrl,
  getShortenedArticleUrl,
  getShortClubUrl,
  getShortenedClubUrl,
  getShortProfileUrl,
  getShortenedProfileUrl,
  getPostUrl,
  getArticleUrl,
  copyToClipboard,
  copyShortLink,
};
