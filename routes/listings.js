const express=require("express");
const router=express.Router();
const flash=require("connect-flash");
const wrapAsync=require("../utils/wrapAsync.js");
 const Listing=require("../models/listing.js");
 const methodoverride=require("method-override");
 const {isLoggedIn}=require("../middleware.js");
 const {isOwner,validatelisting}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({storage});

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,
    upload.single("listing[image]"),
wrapAsync(listingController.createlisting)
);

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showlisting))
.put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validatelisting, 
    wrapAsync(listingController.updatelisting)
)
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroylisting));

//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.rendereditform));

module.exports=router;