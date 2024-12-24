// - `GET api/user/profile` - Retrieve authenticated user's profile [x]
// - `PUT api/users/{user_id}` - Update user account details [x]
// - `GET api/users/roles` - List available user roles  []

const { User, Role, UserClient, Client } = require("../models/models.js");
const { Op } = require('sequelize');


// Controller to get user profile
const profile = async (req, res) => {
    try {
      // Extract user ID from request (this comes from the auth middleware)
      const { user_id: userId } = req.user; // Make sure `user_id` matches the field name in your User model
  
      // Fetch user details along with associated role and client info
      const userProfile = await User.findOne({
        where: { user_id: userId }, // Match with the `user_id` field in the Users table
        include: [
          {
            model: Role,
            attributes: ["role_name", "description"], // Use correct field names based on your schema
          },
          {
            model: Client,
            through: { attributes: [] }, // Assuming many-to-many relationship via UserClients table
            attributes: ["company_name", "contact_person"], // Correct field names for the Clients table
          },
        ],
      });
  
      // Check if user was found
      if (!userProfile) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.status(200).json(userProfile); // Return user profile with associated role and client data
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };

/** 
 * Update user account details{username, email, phone, company_name, contact_person, status, role_id}
 
 * admin will be able to update roles via role_id
 * other users will be able to update their details
 * **/
const updateUserDetails = async (req, res) => {
//   const { user_id } = req.params; // Get user ID from the URL parameters
  const { user_id: user_id } = req.user;
  const { role_id, username, email, phone, company_name, contact_person, status } = req.body; // Get new details from request body

  try {
    
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      role_id,
      username,
      email,
      phone,
      status,
    });
   
    const role = await user.getRole(); 

    if (role.role_name === "client") {
      // Update client details if user is a client
      const client = await Client.findOne({ where: { email: user.email } });

      if (client) {
        await client.update({
          company_name,
          contact_person,
        });
      } else {
        // If no client record exists, create a new one
        await Client.create({
          email: user.email,
          phone: user.phone,
          company_name,
          contact_person,
        });
      }
    }

    const updatedUser = await User.findByPk(user_id, {
      include: [
        {
          model: Role,
          attributes: ['role_name'],
        },
        {
          model: Client,
          attributes: ['company_name', 'contact_person'],
        }
      ]
    });

    return res.status(200).json(updatedUser);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// list of available roles
const getAvailableRoles = async (req, res) => {
    try {
      // Fetch all roles from the Roles table
      const roles = await Role.findAll();
  
      // If no roles found, return a message
      if (roles.length === 0) {
        return res.status(404).json({ message: "No roles found" });
      }
  
      // Return the list of roles, including role_id and other details
      return res.status(200).json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

// Function to retrieve all staff members with roles 'operative' and 'supervisor'
const getAllStaff = async (req, res) => {
  try {
      const staff = await User.findAll({
          include: [{
              model: Role,
              where: {
                  role_name: {
                      [Op.in]: ['operative', 'supervisor']
                  }
              }
          }]
      });
      res.json(staff);
  } catch (error) {
      res.status(500).send({ message: "Error retrieving staff members: " + error.message });
  }
};

// Delete User Profile, for now only user and client tables are affected by this action
async function deleteUser(req, res) {
  const { user_id } = req.params;

  try {
      
      const user = await User.findOne({
          where: { user_id },
          include: {
              model: Role,
              attributes: ['role_name']
          }
      });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Check if the user is a client (i.e., they are linked to a client in the UserClients table)
      const userClients = await UserClient.findAll({
          where: { user_id }
      });

      // If user is a client, remove them from the UserClients table and delete the associated client data
      if (userClients.length > 0) {
          const clientIds = userClients.map(userClient => userClient.client_id);

          // Remove user-client associations
          await UserClient.destroy({
              where: { user_id }
          });
          // Delete associated clients if they exist (based on the client IDs)
          await Client.destroy({
              where: {
                  client_id: clientIds
              }
          });
      }

      // Now delete the user
      await user.destroy();

      // Send a response
      res.status(200).json({ message: 'User and associated data deleted successfully' });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while deleting the user' });
  }
}


module.exports = { updateUserDetails, profile, getAvailableRoles, getAllStaff, deleteUser };
