const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js")
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");
const Review=require("../models/review.js");
const {validateReview, isLoggedIn,isReviewAuthor,clearCache}=require("../middleware.js")

const reviewController=require("../controllers/review.js");
// const { clearCache } = require("ejs");


//Reviews
//Post  Review route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview),clearCache);

//Delete Review Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview))

module.exports=router;