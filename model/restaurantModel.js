import { DataTypes } from "sequelize";

const createRestaurantModel = (sequelize) => {
  const Restaurant = sequelize.define(
    "Restaurants",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      googleMapsUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true, // prevents duplicate restaurants
      },

      averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },

      totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      status: {
        type: DataTypes.ENUM("active", "blocked"),
        defaultValue: "active",
      },
    },
    {
      indexes: [
        { unique: true, fields: ["googleMapsUrl"] },
      ],
    }
  );

  return Restaurant;
};

export default createRestaurantModel;