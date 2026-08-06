import express from 'express';
import {
  getStaffs, getFlowers, getBuyers, getAuctions, getWinningBids, getDeliveryOrders, getActivityLogs,
  searchAuctions, updateAuctionDeliveryQty, updateAuctionStatus,
  cancelAuction, dispatchDelivery,
  confirmAuctionUnauthorized, updateFlowerPartial,
  deleteDeliveryOrder, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/flowers', getFlowers);
router.get('/buyers', getBuyers);
router.get('/auctions', getAuctions);
router.get('/winning-bids', getWinningBids);
router.get('/delivery-orders', getDeliveryOrders);
router.get('/activity-logs', getActivityLogs);
router.get('/auctions/search', searchAuctions);

router.patch('/auctions/:id/delivery-qty', updateAuctionDeliveryQty);
router.patch('/auctions/:id/status', updateAuctionStatus);
router.post('/auctions/:id/cancel', cancelAuction);
router.post('/auctions/:id/dispatch', dispatchDelivery);
router.post('/auctions/:id/confirm-unauthorized', confirmAuctionUnauthorized);
router.patch('/flowers/:id/partial', updateFlowerPartial);
router.delete('/delivery-orders/:id', deleteDeliveryOrder);
router.post('/reset', resetData);

export default router;
