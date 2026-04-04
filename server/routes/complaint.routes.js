const express = require('express');
const { createComplaint, getMyComplaints } = require('../controllers/complaint.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect);

router.get('/my', authorize('donor', 'ngo', 'admin'), getMyComplaints);
router.post('/', authorize('donor', 'ngo'), createComplaint);

module.exports = router;
