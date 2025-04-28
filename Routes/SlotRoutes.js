const express = require('express');
const { bookSlotController, datewiseSlotDetailsController } = require('../Controllers/SlotControllers');
const router = express.Router();
const authMiddleware = require('../Middlewares/authMiddleware');
// slot book Router
router.post('/book', bookSlotController);
router.post('/datewise-details', authMiddleware, datewiseSlotDetailsController);

module.exports = router;