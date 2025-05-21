const express = require("express");
const router = express.Router();
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage})

const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js")

router.route("/")
    .get(wrapAsync(listingController.index)) // Index Route - To display all listings
    .post(isLoggedIn, upload.single("listing[image]"), wrapAsync(listingController.createListing), validateListing); // Create Route - Creates the new listing and adds it to db

// New Route - Gives form to add new listing
router.get("/new", isLoggedIn, wrapAsync(listingController.renderNewForm));

router.route("/:id")
    .get(wrapAsync(listingController.showListing)) // Show Route - Shows the particular listing's details
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing)) // Update Route - Updates the edited listing to database
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)); // Delete route - Deletes a listing

// Edit Route - To Edit a listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;