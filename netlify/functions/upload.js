const { json, checkAdmin, slugify, getStoreByName } = require('./_shared');

function decodeFileName(value) {
  try { return decodeURIComponent(value || 'file.bin'); }
  catch { return value || 'file.bin'; }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  if (event.httpMethod !== 'POST') return json(405, { ok: false, message: 'Method not allowed.' });
  if (!checkAdmin(event)) return json(401, { ok: false, message: 'Admin parol noto‘g‘ri.' });

  try {
    if (!event.body) return json(400, { ok: false, message: 'Fayl kelmadi.' });

    const fileName = decodeFileName(event.headers['x-file-name'] || event.headers['X-File-Name']);
    const contentType = event.headers['content-type'] || 'application/octet-stream';
    const buffer = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : Buffer.from(event.body, 'binary');

    if (!buffer.length) return json(400, { ok: false, message: 'Fayl bo‘sh keldi.' });
    if (buffer.length > 4 * 1024 * 1024) {
      return json(413, { ok: false, message: `Fayl ${(buffer.length / 1024 / 1024).toFixed(1)} MB. Limit 4 MB.` });
    }

    const base = slugify(fileName.replace(/\.[^/.]+$/, ''));
    const ext = (fileName.match(/\.([a-z0-9]+)$/i) || [,'bin'])[1].toLowerCase();
    const key = `${Date.now()}-${base}.${ext}`;

    const store = await getStoreByName('h-market-files');
    await store.set(key, buffer, { metadata: { contentType, fileName } });

    return json(200, {
      ok: true,
      key,
      fileUrl: `/.netlify/functions/file?key=${encodeURIComponent(key)}`,
      fileName,
      contentType,
      size: buffer.length
    });
  } catch (error) {
    return json(500, { ok: false, message: `Upload xatosi: ${error.message}` });
  }
};
