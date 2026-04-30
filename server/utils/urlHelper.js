// server/utils/urlHelper.js
const CDN_DOMAIN = process.env.CDN_DOMAIN || 'https://tu-dominio-cdn.com';

function getCdnUrl(fileName) {
  if (!fileName) return null;
  if (fileName.startsWith('http')) return fileName;
  return `${CDN_DOMAIN}/${fileName}`;
}

module.exports = { getCdnUrl };