const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../jumblyDb.db'), // Adjust the path relative to `config`
  logging: false, // Disable SQL logging (optional)
});

module.exports = sequelize;
