const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Your Sequelize instance

class User extends Model {}

User.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'role_id'
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('verified', 'unverified'),
      allowNull: false,
      defaultValue: 'unverified'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_token_expiration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  
  {
    sequelize,  // Sequelize instance
    modelName: 'User',
    tableName: 'Users',
    timestamps: false  // Set to false because I used `created_at` and `updated_at` manually
  }
);

module.exports = User;
