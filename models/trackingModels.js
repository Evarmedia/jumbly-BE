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
      allowNull: true,
      references: {
        model: 'Users',
        key: 'user_id',
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
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
    timestamps: false, // Explicitly manage created_at and updated_at
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
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Tenants",
        key: "tenant_id",
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

class Feedback extends Model {}
Feedback.init(
  {
    feedback_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tenants',
        key: 'tenant_id',
      },
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clients',
        key: 'client_id',
      },
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'project_id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5, // Rating must be between 1 and 5
      },
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true, // Optional comments
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
    modelName: 'Feedback',
    tableName: 'Feedback',
    timestamps: false, // Explicitly manage created_at and updated_at
  }
);

module.exports = { Report, Issue, Notification, Feedback };
