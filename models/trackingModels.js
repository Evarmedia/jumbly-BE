const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Report extends Model {}
Report.init(
  {
    report_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'project_id',
      },
    },
    submitted_by: {
      type: DataTypes.INTEGER,
      allowNull: true, // NULL for automated reports
      references: {
        model: 'Users',
        key: 'user_id',
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    report_content: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    modelName: 'Report',
    tableName: 'Reports',
    timestamps: false,
  }
);

class Issue extends Model {}
Issue.init(
  {
    issue_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tasks',
        key: 'task_id',
      },
    },
    reported_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id',
      },
    },
    issue_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('reported', 'resolved'),
      allowNull: false,
      defaultValue: 'reported',
    },
    photo_attachment: {
      type: DataTypes.STRING, // URL or file path
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
    modelName: 'Issue',
    tableName: 'Issues',
    timestamps: false,
  }
);

class Notification extends Model {}
Notification.init(
  {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('read', 'unread'),
      allowNull: false,
      defaultValue: 'unread',
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'Notifications',
    timestamps: false,
  }
);

module.exports = { Report, Issue, Notification };
