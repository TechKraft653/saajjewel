const { Sequelize } = require('sequelize');
require('dotenv').config();

// PostgreSQL connection
// Use Render's DATABASE_URL if available, otherwise use individual environment variables
const databaseUrl = process.env.DATABASE_URL;
let sequelize;

if (databaseUrl) {
  // Render deployment - use DATABASE_URL
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Local development - use individual environment variables
  sequelize = new Sequelize(
    process.env.POSTGRES_DB || 'saajjewels',
    process.env.POSTGRES_USER || 'postgres',
    process.env.POSTGRES_PASSWORD || 'postgres',
    {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

// Test the connection
const connectDB = async () => {
  try {
    // Only attempt connection if we have database configuration
    if (databaseUrl || process.env.POSTGRES_DB) {
      await sequelize.authenticate();
      console.log('PostgreSQL database connected successfully.');
      
      // Sync all models
      await sequelize.sync({ alter: true });
      console.log('All models were synchronized successfully.');
      
      return true;
    } else {
      console.log('No PostgreSQL configuration found. Skipping database connection.');
      return false;
    }
  } catch (error) {
    console.error('Unable to connect to PostgreSQL database:', error);
    return false;
  }
};

module.exports = { sequelize, connectDB };