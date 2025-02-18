const express=require("express");
const router=express.Router({mergeParams:true});
const footerController=require("../controllers/footerController.js");

router
    .route("/contact")
    .get(footerController.contact);

router
    .route("/privacy")
    .get(footerController.privacy);
router
    .route("/support")
    .get(footerController.support);


router
    .route("/terms")
    .get(footerController.terms);
module.exports=router;