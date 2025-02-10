const multer  = require('multer');
const {upload}=require("../cloudconfig.js");

const express=require("express");
const router=express.Router({mergeParams:true});
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js")
const flash=require("connect-flash");
const {isLoggedIn,isOwner,validateListing, isReviewAuthor}=require("../middleware.js");




// const multer  = require('multer');
// const {upload}=require("../cloudconfig.js");
// const upload = multer({ storage });

const listingController=require("../controllers/listing.js");


router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing));
    

//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));


//Edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

// //Index Route
// router.get("/",wrapAsync(listingController.index));




// //Show Route
// router.get("/:id",wrapAsync(listingController.showListing));

// //Create Route
// router.post("/",isLoggedIn,validateListing,wrapAsync(listingController.createListing));



//Update Route
// router.put("/:id",validateListing,isLoggedIn,isOwner, wrapAsync(listingController.updateListing));

//Delete Route
// router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));


module.exports=router;