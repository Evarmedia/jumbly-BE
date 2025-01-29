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
    tableName: 'Roles',
    timestamps: true,  // enable Sequelize automatic timestamp management
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Role;
