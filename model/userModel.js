import { DataTypes } from "sequelize";

const createUserModel = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      // Optional username if you want email login only
      username: {
        type: DataTypes.STRING,
        allowNull: true, // optional if login via email
        unique: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false, // password required for login
      },

      role: {
        type: DataTypes.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user",
      },

      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // Password reset OTP & expiry
      resetOTP: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetOTPExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // OTP request limit tracking
      resetOTPLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lastOTPRequest: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // Optional: email verification
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      // Optional: account creation & update timestamps (Sequelize can handle automatically)
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      indexes: [
        { unique: true, fields: ["email"] },
        { unique: true, fields: ["username"] },
        { fields: ["role"] }, // for faster queries by role
      ],
    }
  );

  return User;
};

export default createUserModel;