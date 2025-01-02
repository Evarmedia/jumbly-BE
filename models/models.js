const User = require("./userModel");
const Role = require("./roleModel");
const Client = require("./clientModel");
const UserClient = require("./userClientsModel");
const Project = require("./projectModel");
const Task = require("./taskModel");
const Schedule = require("./scheduleModel");
const {
  TaskStatus,
  TaskPriority,
  TaskCategory,
  ProjectStatus,
} = require("./attributesModel"); 
const { Report, Issue, Notification } = require("./trackingModels");
const {
  Item,
  ProjectInventory,
  Transaction,
} = require("../models/inventoryModel");

// Define associations
Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

Client.hasMany(Project, { foreignKey: "client_id", onDelete: "CASCADE" });
Project.belongsTo(Client, { foreignKey: "client_id" });

User.belongsToMany(Client, {
  through: UserClient, // Reference the UserClient model
  foreignKey: "user_id",
  otherKey: "client_id",
  onDelete: "CASCADE", // Cascade delete
});

Client.belongsToMany(User, {
  through: UserClient, // Reference the UserClient model
  foreignKey: "client_id",
  otherKey: "user_id",
  onDelete: "CASCADE", // Cascade delete
});

// Define relationships between Project and Task
Project.hasMany(Task, { foreignKey: "project_id", onDelete: "CASCADE" }); // Delete tasks if project is deleted
Task.belongsTo(Project, { foreignKey: "project_id" });

// Define relationships between Task and User (assignments)
User.hasMany(Task, { foreignKey: "assigned_by" }); // User who assigns the task
Task.belongsTo(User, { foreignKey: "assigned_by", as: "AssignedBy" });

User.hasMany(Task, { foreignKey: "assigned_to" }); // User to whom the task is assigned
Task.belongsTo(User, { foreignKey: "assigned_to", as: "AssignedTo" });

// Define relationships between Tasks and Task-related models
Task.belongsTo(TaskStatus, { foreignKey: "status_id", as: "status" }); // Each task has a status
Task.belongsTo(TaskPriority, { foreignKey: "priority_id", as: "priority" }); // Each task has a priority
Task.belongsTo(TaskCategory, { foreignKey: "category_id", as: "category" }); // Each task can belong to a category

// Define relationships for Schedules
Project.hasMany(Schedule, { foreignKey: "project_id", onDelete: "CASCADE" }); // A project can have many schedules
Schedule.belongsTo(Project, { foreignKey: "project_id" });

User.hasMany(Schedule, {
  foreignKey: "supervisor_id",
  as: "SupervisedSchedules",
}); // A supervisor can have many schedules
Schedule.belongsTo(User, { foreignKey: "supervisor_id", as: "Supervisor" });

// Define relationships for Reports
Project.hasMany(Report, { foreignKey: "project_id", onDelete: "CASCADE" });
Report.belongsTo(Project, { foreignKey: "project_id" });

User.hasMany(Report, { foreignKey: "submitted_by" });
Report.belongsTo(User, { foreignKey: "submitted_by" });

// Define relationships for Issues
Task.hasMany(Issue, { foreignKey: "task_id", onDelete: "CASCADE" });
Issue.belongsTo(Task, { foreignKey: "task_id" });

User.hasMany(Issue, { foreignKey: "reported_by" });
Issue.belongsTo(User, { foreignKey: "reported_by" });

// Define relationships for Notifications
User.hasMany(Notification, { foreignKey: "user_id", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "user_id" });

// Relationship for Project status
Project.belongsTo(ProjectStatus, { foreignKey: "status_id", as: "status" });
ProjectStatus.hasMany(Project, { foreignKey: "status_id", as: "Projects" });

// Define relationships
Project.hasMany(ProjectInventory, {
  foreignKey: "project_id",
  onDelete: "CASCADE",
});
ProjectInventory.belongsTo(Project, { foreignKey: "project_id" });

Item.hasMany(ProjectInventory, { foreignKey: "item_id", onDelete: "CASCADE" });
ProjectInventory.belongsTo(Item, { foreignKey: "item_id" });

Item.hasMany(Transaction, { foreignKey: "item_id", onDelete: "CASCADE" });
Transaction.belongsTo(Item, { foreignKey: "item_id" });

Project.hasMany(Transaction, { foreignKey: "project_id", onDelete: "CASCADE" });
Transaction.belongsTo(Project, { foreignKey: "project_id" });

module.exports = {
  User,
  Role,
  Client,
  UserClient,
  Project,
  Task,
  Schedule,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  Report,
  Issue,
  Notification,
  ProjectStatus,
  Item,
  ProjectInventory,
  Transaction,
};
