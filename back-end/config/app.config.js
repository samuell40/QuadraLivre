require('dotenv').config();

const config = {
  jwtSecret: process.env.JWT_SECRET,
  frontendURL: process.env.FRONTEND_URL || 'http://localhost:8080'
};

module.exports = config;
