const express = require('express');
const {
	getMyClaims,
	getAllClaims,
	getClaimsForListing,
	getReceivedClaims,
	verifyClaimByToken,
	sendDeliveryOtp,
	verifyDeliveryOtp,
} = require('../controllers/claim.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

router.get('/verify/:token', verifyClaimByToken);

router.use(protect);

router.get('/', authorize('ngo'), getMyClaims);
router.get('/all', authorize('admin'), getAllClaims);
router.get('/received', authorize('donor', 'admin'), getReceivedClaims);
router.get('/listing/:listingId', authorize('donor', 'admin'), getClaimsForListing);
router.post('/:claimId/send-delivery-otp', authorize('donor', 'admin'), sendDeliveryOtp);
router.post('/:claimId/verify-delivery-otp', authorize('donor', 'admin'), verifyDeliveryOtp);

module.exports = router;
