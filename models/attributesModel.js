const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// TaskStatuses Model
class TaskStatus extends Model {}
TaskStatus.init(
  {
    status_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: 'TaskStatus',
    tableName: 'TaskStatuses',
    timestamps: false,
  }
);

// TaskPriorities Model
class TaskPriority extends Model {}
TaskPriority.init(
  {
    priority_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    priority_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: 'TaskPriority',
    tableName: 'TaskPriorities',
    timestamps: false,
  }
);

// TaskCategories Model
class TaskCategory extends Model {}
TaskCategory.init(
  {
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: 'TaskCategory',
    tableName: 'TaskCategories',
    timestamps: false,
  }
);

// ProjectStatus Model
class ProjectStatus extends Model {}
ProjectStatus.init(
  {
    status_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
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
    sequelize,
    modelName: 'ProjectStatus',
    tableName: 'ProjectStatuses',
    timestamps: false, // Explicitly manage created_at and updated_at
  }
);


module.exports = { TaskStatus, TaskPriority, TaskCategory, ProjectStatus };
