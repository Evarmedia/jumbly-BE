const User = require('./userModel');
const Role = require('./roleModel');
const Client = require('./clientModel');
const UserClient = require('./userClientsModel');  // Import the UserClients model

// Define associations
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

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

module.exports = { User, Role, Client, UserClient };
