const { getStoreByName } = require('./_shared');

exports.handler = async (event) => {
  try {
    const key = event.queryStringParameters && event.queryStringParameters.key;
    if (!key) return { statusCode: 400, body: 'Fayl key berilmagan.' };

    const store = await getStoreByName('h-market-files');
    const metadata = await store.getMetadata(key);
    const data = await store.get(key, { type: 'arrayBuffer' });
    if (!data) return { statusCode: 404, body: 'Fayl topilmadi.' };

    const buffer = Buffer.from(data);
    const contentType = metadata?.contentType || 'application/octet-stream';
    const fileName = metadata?.fileName || key;
    const encodedName = encodeURIComponent(fileName).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29');

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'content-type': contentType,
        'content-disposition': `attachment; filename*=UTF-8''${encodedName}`,
        'cache-control': 'public, max-age=31536000, immutable'
      },
      body: buffer.toString('base64')
    };
  } catch (error) {
    return { statusCode: 500, body: `Fayl olish xatosi: ${error.message}` };
  }
};
