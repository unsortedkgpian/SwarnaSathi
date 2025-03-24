const express = require('express');
const router = express.Router();
const {
    subscribe,
    getSubscribers,
    getSubscriber,
    updateSubscriberStatus,
    deleteSubscriber,
    unsubscribe,
    sendOffer,
    sendContact
} = require('../controllers/newsLetterControllers.js');
const { protect, authorize } = require('../middlewares/auth.js');

router
    .route('/subscribers')
    .get(protect, authorize('admin'), getSubscribers)
    .post(subscribe);

router
    .route('/subscribers/:id')
    .get(protect, authorize('admin'), getSubscriber)
    .put(protect, authorize('admin'), updateSubscriberStatus)
    .delete(protect, authorize('admin'), deleteSubscriber);

router.get('/unsubscribe/:token', unsubscribe);
router.post('/send-offer', protect, authorize('admin'), sendOffer);
router.post('/contactus', sendContact);

module.exports = router;