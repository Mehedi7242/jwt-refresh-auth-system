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
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // unique constraint
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
        unique: true, // unique constraint
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
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
      resetOTP: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetOTPExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
        {
          unique: true,
          fields: ["username"],
        },
        // role should not be unique
        // If you want a normal index for faster filtering by role:
        {
          fields: ["role"],
        },
      ],
    }
  );

  return User;
};

export default createUserModel;
