const express = require('express');
const { getOverview } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);

module.exports = router;
