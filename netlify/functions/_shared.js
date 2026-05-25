function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type,x-admin-password,x-file-name',
      'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function defaultProducts() {
  const now = new Date().toISOString();
  return [
    { id:'demo-app', slug:'h-market-demo-app', title:'H Market Demo App', category:'Ilovalar', description:'Namuna ilova. Admin paneldan yangi mahsulot qo‘shing yoki buni o‘chirib tashlang.', imageUrl:'/assets/logo.svg', fileUrl:'https://example.com', fileName:'demo.apk', fileType:'link', rating:'4.8', createdAt: now },
    { id:'demo-site', slug:'foydali-sayt', title:'Foydali sayt', category:'Saytlar', description:'Sayt namunasi. Har bir mahsulot o‘z alohida sahifasiga ega.', imageUrl:'/assets/logo.svg', fileUrl:'https://example.com', fileName:'example.com', fileType:'link', rating:'4.6', createdAt: now }
  ];
}

function checkAdmin(event) {
  const expected = process.env.ADMIN_PASSWORD || 'admin123';
  const got = event.headers['x-admin-password'] || event.headers['X-Admin-Password'];
  return got === expected;
}

function slugify(text) {
  return String(text || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/['‘’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}

async function getStoreByName(name) {
  const { getStore } = await import('@netlify/blobs');
  return getStore(name);
}

async function readProducts({ fallback = true } = {}) {
  try {
    const store = await getStoreByName('h-market-products');
    const raw = await store.get('products.json', { type: 'text' });
    if (!raw) return defaultProducts();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultProducts();
  } catch (error) {
    if (fallback) return defaultProducts();
    throw new Error(`Products store xatosi: ${error.message}`);
  }
}

async function writeProducts(products) {
  const store = await getStoreByName('h-market-products');
  await store.set('products.json', JSON.stringify(products, null, 2), { metadata: { contentType: 'application/json' } });
}

module.exports = { json, defaultProducts, checkAdmin, slugify, readProducts, writeProducts, getStoreByName };
