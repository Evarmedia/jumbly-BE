const User = require('./userModel');
const Role = require('./roleModel');
const Client = require('./clientModel');
const UserClient = require('./userClientsModel');  // Import the UserClients model
const Project = require('./projectModel');
const Task = require('./taskModel');  // Import the Task model

// Define associations
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

Client.hasMany(Project, { foreignKey: 'client_id', onDelete: 'CASCADE' });
Project.belongsTo(Client, { foreignKey: 'client_id' });

User.belongsToMany(Client, {
  through: UserClient,  // Reference the UserClient model
  foreignKey: 'user_id',
  otherKey: 'client_id',
  onDelete: 'CASCADE',  // Cascade delete
});

Client.belongsToMany(User, {
  through: UserClient,  // Reference the UserClient model
  foreignKey: 'client_id',
  otherKey: 'user_id',
  onDelete: 'CASCADE',  // Cascade delete
});

// Define relationships between Project and Task
Project.hasMany(Task, { foreignKey: 'project_id', onDelete: 'CASCADE' }); // Delete tasks if project is deleted
Task.belongsTo(Project, { foreignKey: 'project_id' });

// Define relationships between Task and User (assignments)
User.hasMany(Task, { foreignKey: 'assigned_by' }); // User who assigns the task
Task.belongsTo(User, { foreignKey: 'assigned_by', as: 'AssignedBy' });

User.hasMany(Task, { foreignKey: 'assigned_to' }); // User to whom the task is assigned
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'AssignedTo' });

module.exports = { User, Role, Client, UserClient, Project, Task };
