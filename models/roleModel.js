const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Your Sequelize instance

class Role extends Model {}

Role.init(
  {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    description: {
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
    modelName: 'Role',
    tableName: 'Roles',  // Name of the table in your database
    timestamps: false,  // Disable Sequelize automatic timestamp management (since you have created_at and updated_at)
  }
);

module.exports = Role;
