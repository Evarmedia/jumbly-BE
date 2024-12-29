const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Project = sequelize.define('Project', {
    project_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    project_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    supervisor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
}, {
    tableName: 'Projects',
    timestamps: true, // Set to true if using Sequelize automatic timestamps
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Project;
