const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Task = sequelize.define('Task', {
    task_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    task_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    task_description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    priority_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    due_date: {
        type: DataTypes.DATE,
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
}, {
    tableName: 'Tasks',
    timestamps: true, // enabled automatic timestamps
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Task;
