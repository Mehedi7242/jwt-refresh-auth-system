import Sequelize from "sequelize";
import createUserModel from "../model/userModel.js";
import createRestaurantModel from "../model/restaurantModel.js";
import createReviewModel from '../model/reviewModel.js';
import { defineAssociations } from "../model/associations.js";

let User = null
let Restaurant = null
let Review = null

export const dbConnection = async () => {
    const sequelize = new Sequelize(
        process.env.DATABASE,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
        host: 'localhost',
        dialect: 'postgres',
    })

    try {
    await sequelize.authenticate();
    User = await createUserModel(sequelize);
    Restaurant = await createRestaurantModel(sequelize);
    Review =  await createReviewModel(sequelize);

    // define relation
        defineAssociations(User, Restaurant, Review);
    // when chnaging db then 
    // await sequelize.sync({ alter: true });
    await sequelize.sync();

    console.log('Connection has been established successfully.');
    } catch (error) {
    console.error('Unable to connect to the database:', error);
    }
};

export {User,Restaurant,Review}