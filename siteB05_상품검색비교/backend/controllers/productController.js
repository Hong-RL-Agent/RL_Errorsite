const svc = require('../services/productService');
const { HttpError, toInt, userIdOf } = require('../services/common');

const idOf = (req) => {
  const id = toInt(req.params.id, null);
  if (id === null) throw new HttpError(404, 'PRODUCT_NOT_FOUND', '상품을 찾을 수 없습니다.');
  return id;
};

module.exports = {
  list: (req, res) => res.json(svc.listProducts(req.query, userIdOf(req.query))),
  detail: (req, res) => res.json({ data: svc.getProduct(idOf(req)) }),
  images: (req, res) => res.json({ data: svc.getImages(idOf(req)) }),
  specifications: (req, res) => res.json({ data: svc.getSpecifications(idOf(req)) }),
  reviews: (req, res) => res.json(svc.getReviews(idOf(req), req.query)),
  priceHistory: (req, res) => res.json(svc.getPriceHistory(idOf(req))),
  categories: (req, res) => res.json({ data: svc.getCategories() }),
  brands: (req, res) => res.json({ data: svc.getBrands(req.query.category) }),
  filters: (req, res) => res.json({ data: svc.getFilters(req.query.category || null) }),
  suggestions: (req, res) => res.json({ data: svc.getSuggestions(req.query.q) }),
  image: (req, res) => {
    const id = toInt(String(req.params.file).replace(/\.svg$/, ''), null);
    const svg = id === null ? null : svc.getImageSvg(id);
    if (!svg) throw new HttpError(404, 'IMAGE_NOT_FOUND', '이미지를 찾을 수 없습니다.');
    res.set('Content-Type', 'image/svg+xml').set('Cache-Control', 'public, max-age=86400').send(svg);
  },
};
