const express = require('express');
const router=express.Router({mergeParams:true});
const paymentController = require('../controllers/paymentController.js');
  
router.post("/confirm", paymentController.confirmPayment);
router.post("/webhook", paymentController.razorpayWebhook);

router
    .route("/:listingId/createOrder")
    .post(paymentController.createOrder);



module.exports = router;