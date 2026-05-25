const { json, checkAdmin, slugify, readProducts, writeProducts } = require('./_shared');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  try {
    if (event.httpMethod === 'GET') {
      const products = await readProducts({ fallback: true });
      return json(200, { ok: true, products });
    }

    if (!checkAdmin(event)) return json(401, { ok: false, message: 'Admin parol noto‘g‘ri.' });

    const body = event.body ? JSON.parse(event.body) : {};
    const products = await readProducts({ fallback: true });

    if (event.httpMethod === 'POST') {
      const baseSlug = slugify(body.title);
      let slug = baseSlug;
      let n = 2;
      while (products.some(p => p.slug === slug)) slug = `${baseSlug}-${n++}`;
      const product = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        slug,
        title: body.title || 'Nomsiz mahsulot',
        category: body.category || 'Ilovalar',
        description: body.description || '',
        imageUrl: body.imageUrl || '/assets/logo.svg',
        fileUrl: body.fileUrl || '',
        fileName: body.fileName || '',
        fileType: body.fileType || '',
        rating: body.rating || '4.8',
        createdAt: new Date().toISOString()
      };
      products.unshift(product);
      await writeProducts(products);
      return json(200, { ok: true, product, products });
    }

    if (event.httpMethod === 'DELETE') {
      const next = products.filter(p => p.id !== body.id);
      await writeProducts(next);
      return json(200, { ok: true, products: next });
    }

    return json(405, { ok: false, message: 'Method not allowed.' });
  } catch (error) {
    return json(500, { ok: false, message: error.message || 'Server xatosi.' });
  }
};
