const express = require('express');
const product = require('../controllers/productController');
const comparison = require('../controllers/comparisonController');
const misc = require('../controllers/miscController');

const router = express.Router();

router.get('/health', misc.health);

router.get('/categories', product.categories);
router.get('/brands', product.brands);
router.get('/filters', product.filters);
router.get('/search/suggestions', product.suggestions);
router.get('/search/history', misc.searchHistory);
router.post('/search/history', misc.recordSearch);
router.get('/images/:file', product.image);

router.get('/products', product.list);
router.get('/products/:id', product.detail);
router.get('/products/:id/images', product.images);
router.get('/products/:id/specifications', product.specifications);
router.get('/products/:id/reviews', product.reviews);
router.get('/products/:id/price-history', product.priceHistory);

router.get('/comparisons', comparison.list);
router.post('/comparisons', comparison.create);
router.get('/comparisons/:id', comparison.detail);
router.patch('/comparisons/:id', comparison.update);
router.delete('/comparisons/:id', comparison.remove);
router.post('/comparisons/:id/products', comparison.addProduct);
router.delete('/comparisons/:id/products/:productId', comparison.removeProduct);
router.get('/comparisons/:id/statistics', comparison.statistics);

router.get('/recently-viewed', misc.recentlyViewed);
router.post('/recently-viewed', misc.recordView);

router.get('/activity', misc.activity);
router.post('/activity', misc.recordActivity);

router.post('/test/reset', misc.reset);

module.exports = router;
