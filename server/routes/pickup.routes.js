const express = require('express');
const { assignVolunteer, updatePickupStatus, uploadProof, getMyPickups, getAllPickups } = require('../controllers/pickup.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

router.post('/assign', authorize('admin', 'donor', 'ngo'), assignVolunteer);
router.get('/my', authorize('volunteer'), getMyPickups);
router.get('/', authorize('admin'), getAllPickups);
router.patch('/:id/status', authorize('volunteer', 'admin'), updatePickupStatus);
router.post('/:id/proof', authorize('volunteer'), upload.array('photos', 5), uploadProof);

module.exports = router;
