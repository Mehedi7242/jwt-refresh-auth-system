export const defineAssociations = (User, Restaurant, Review) => {
  User.hasMany(Review, {
    foreignKey: { name: "UserId", allowNull: false },
    onDelete: "CASCADE",
  });

  Review.belongsTo(User, {
    foreignKey: { name: "UserId", allowNull: false },
  });

  Restaurant.hasMany(Review, {
    foreignKey: { name: "RestaurantId", allowNull: false },
    onDelete: "CASCADE",
  });

  Review.belongsTo(Restaurant, {
    foreignKey: { name: "RestaurantId", allowNull: false },
  });
};