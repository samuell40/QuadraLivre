require('dotenv').config();

config = {
    jwtSecret: process.env.JWT_SECRET,
}
module.exports = config;