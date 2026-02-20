import Sequelize from "sequelize";
import createUserModel from "../model/userModel.js";
let User = null

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
    // when chnaging db then 
    // await sequelize.sync({ alter: true });
    await sequelize.sync();
    console.log('Connection has been established successfully.');
    } catch (error) {
    console.error('Unable to connect to the database:', error);
    }
};

export {User}