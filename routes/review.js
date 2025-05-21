const express = require("express");
const router = express.Router({mergeParams: true});

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")
const reviewController = require("../controllers/review.js")

// REVIEWS: Post Route - To post reviews
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// REVIEWS: Delete Route - To delete a review
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;