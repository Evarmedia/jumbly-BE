const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Your Sequelize instance

class Client extends Model {}

Client.init(
  {
    client_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    contact_person: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
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
    sequelize,
    modelName: 'Client',
    tableName: 'Clients',  // Name of the table in your database
    timestamps: false,  // Disable Sequelize automatic timestamp management (since you have created_at and updated_at)
  }
);

module.exports = Client;
