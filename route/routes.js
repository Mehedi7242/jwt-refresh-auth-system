import { Router } from "express";
import {
  loginController,
  registerController,
  refreshTokenController,
  logoutController,
  profileController,
  requestPasswordReset,
  resetPasswordController,
} from "../controller/userController.js";
import {
  submitReviewController,
  getUserReviewsController,
  getAllReviewsController,
  getRestaurantReviewsController,
} from "../controller/reviewController.js";
import { authenticationToken } from "../auth/auth.js";

const router = Router();

router.post("/register",registerController)
router.post("/login",loginController)
router.post("/refreshToken",refreshTokenController)
router.post("/logout",logoutController)
router.post("/profile",authenticationToken,profileController)
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPasswordController);

router.post("/reviews", authenticationToken, submitReviewController);

// public list of all reviews
router.get("/reviews", getAllReviewsController);

router.get(
  "/my-reviews",
  authenticationToken,
  getUserReviewsController
);

// Get reviews for a specific restaurant
router.get("/restaurants/:restaurantId/reviews", getRestaurantReviewsController);

export default router;