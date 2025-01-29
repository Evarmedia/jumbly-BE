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
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tenants',
        key: 'tenant_id',
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
    defaultScope: {
      attributes: { exclude: ['password'] }, // Exclude password globally by default
    },
    scopes: {
      withPassword: {
        attributes: {}, // Include all attributes, including password
      },
    },
  }
);

class Tenant extends Model {}
Tenant.init(
  {
    tenant_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tenant_name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
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
    modelName: 'Tenant',
    tableName: 'Tenants',
    timestamps: false, // Use `created_at` and `updated_at` explicitly
  }
);

class TenantRole extends Model {}
TenantRole.init(
  {
    tenant_role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Tenants",
        key: "tenant_id",
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Roles",
        key: "role_id",
      },
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
    modelName: "TenantRole",
    tableName: "TenantRoles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = { User, Tenant, TenantRole };
