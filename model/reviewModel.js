import { DataTypes } from "sequelize";

const createReviewModel = (sequelize) => {
  const Review = sequelize.define(
    "Review",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },

      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("active", "hidden"),
        defaultValue: "active",
      },

      // 🔥 Add these explicitly (not necessary but helps sync)
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      RestaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      indexes: [
        // {
        //   unique: true,
        //   fields: ["UserId", "RestaurantId"],
        // },
      ],
    }
  );

  return Review;
};

export default createReviewModel;