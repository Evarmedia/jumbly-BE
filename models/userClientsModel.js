const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');  

class UserClient extends Model {}

UserClient.init(
  {
    user_client_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',  // Reference to the Users table
        key: 'user_id',
      },
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clients',  // Reference to the Clients table
        key: 'client_id',
      },
    },
  },
  {
    sequelize,
    modelName: 'UserClient',
    tableName: 'UserClients',  // Name of the join table
    timestamps: false,  // If your join table doesn't have timestamps
  }
);

module.exports = UserClient;
