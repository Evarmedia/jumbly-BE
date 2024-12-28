const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Sequelize instance

class Client extends Model {}

Client.init(
  {
    client_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    website: {
      type: DataTypes.STRING,
    },
    company_name: {
      type: DataTypes.STRING,
    },
    industry: {
      type: DataTypes.STRING,
    },
    official_email: {
      type: DataTypes.STRING,
    },
    contact_person: {
      type: DataTypes.STRING,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize, // Sequelize instance
    modelName: 'Client',
    tableName: 'Clients',
    timestamps: false, // Explicitly managing created_at and updated_at
  }
);

module.exports = Client;
