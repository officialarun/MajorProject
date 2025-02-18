
const express=require("express");
const router=express.Router({mergeParams:true});
// const { getUserPayments } = require("../controllers/paymentController.js");
const bookingController=require("../controllers/booking.js");
const { isLoggedIn } = require("../middleware.js");


// Route to fetch payments made by a specific user
router
    .route("/:id")
    .get(isLoggedIn,bookingController.getUserPayments);

module.exports = router;
