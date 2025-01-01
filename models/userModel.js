const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Sequelize instance

class User extends Model {}

User.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles', // Table name for Roles
        key: 'role_id', // Primary key in Roles table
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    photo: {
      type: DataTypes.STRING,
    },
    education: {
      type: DataTypes.STRING,
    },
    birthdate: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM('verified', 'unverified'),
      allowNull: false,
      defaultValue: 'unverified',
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_token_expiration: {
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: 'User',
    tableName: 'Users',
    timestamps: true, // Explicitly managing created_at and updated_at
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = User;
