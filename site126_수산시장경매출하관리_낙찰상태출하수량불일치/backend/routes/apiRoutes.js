import express from 'express';
import {
  getStaffs, getWholesalers, getItems, getAuctions, getShipmentLogs, getActivityLogs,
  searchAuctions, updateAuctionQuantity, updateAuctionStatus,
  cancelAuction, confirmShipment,
  confirmWinUnauthorized, updateItemPartial,
  deleteShipmentLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/wholesalers', getWholesalers);
router.get('/items', getItems);
router.get('/auctions', getAuctions);
router.get('/shipment-logs', getShipmentLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/auctions/search', searchAuctions);

router.patch('/auctions/:id/quantity', updateAuctionQuantity);
router.patch('/auctions/:id/status', updateAuctionStatus);
router.post('/auctions/:id/cancel', cancelAuction);
router.post('/auctions/:id/confirm-shipment', confirmShipment);
router.post('/auctions/:id/confirm-win-unauthorized', confirmWinUnauthorized);
router.patch('/items/:id/partial', updateItemPartial);
router.delete('/shipment-logs/:id', deleteShipmentLog);
router.post('/reset', resetData);

export default router;
