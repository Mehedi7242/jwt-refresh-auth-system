import { Review, Restaurant } from "../db/dbconnection.js";
 
// Handles creating a new review (authenticated users only)
export const submitReviewController = async (req, res) => {
  try {
    const { name, googleMapsUrl, rating, comment } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    // 1️⃣ Validation
    if (!name || !googleMapsUrl || !rating) {
      return res.status(400).json({
        message: "Restaurant name, link and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // 2️⃣ Find or Create Restaurant
    let restaurant = await Restaurant.findOne({
      where: { googleMapsUrl },
    });

    if (!restaurant) {
      restaurant = await Restaurant.create({
        name,
        googleMapsUrl,
      });
    }

    // 3️⃣ Prevent duplicate review
    const existingReview = await Review.findOne({
      where: {
        UserId: userId,
        RestaurantId: restaurant.id,
      },
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You already reviewed this restaurant",
      });
    }

    // 4️⃣ Create Review
    const review = await Review.create({
      rating,
      comment,
      UserId: userId,
      RestaurantId: restaurant.id,
    });

    // 5️⃣ Optimized rating update
    const newTotalReviews = restaurant.totalReviews + 1;

    const newAverage =
      (restaurant.averageRating * restaurant.totalReviews + rating) /
      newTotalReviews;

    await restaurant.update({
      averageRating: newAverage.toFixed(2),
      totalReviews: newTotalReviews,
    });

    return res.status(201).json({
      message: "Review submitted successfully",
      review,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        averageRating: newAverage.toFixed(2),
        totalReviews: newTotalReviews,
      },
    });
  } catch (error) {
    console.error("Submit Review Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch all reviews authored by the currently authenticated user
export const getUserReviewsController = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    const reviews = await Review.findAll({
      where: { UserId: userId },
      include: [
        {
          model: Restaurant,
          attributes: ["id", "name", "googleMapsUrl", "averageRating"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error("Get User Reviews Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve every review in the system (public)
export const getAllReviewsController = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: Restaurant,
          attributes: ["id", "name", "googleMapsUrl", "averageRating"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error("Get All Reviews Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch reviews for a specific restaurant
export const getRestaurantReviewsController = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Fetch all reviews for this restaurant
    const reviews = await Review.findAll({
      where: { RestaurantId: restaurantId },
      include: [
        {
          model: Restaurant,
          attributes: ["id", "name", "googleMapsUrl", "averageRating", "totalReviews"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        averageRating: restaurant.averageRating,
        totalReviews: restaurant.totalReviews,
      },
      reviews,
    });
  } catch (error) {
    console.error("Get Restaurant Reviews Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};