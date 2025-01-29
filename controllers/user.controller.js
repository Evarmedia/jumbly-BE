const { User, Role, UserClient, Client, Project, ProjectInventory, Item, Tenant } = require("../models/models.js");
const { Op } = require("sequelize");

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
          // attributes: ["company_name", "contact_person"], // excluded so all columns are returned
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


const getUserProfileByAdmin = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Retrieve tenant_id from the authenticated admin
    const { tenant_id, role_name } = req.user;

    // Ensure only admins can access this endpoint
    if (role_name !== "admin") {
      return res.status(403).json({ message: "Access denied. Only admins can view user profiles." });
    }

    // Fetch the user by ID and ensure the same tenant_id
    const user = await User.findOne({
      where: { user_id, tenant_id }, // Ensure the user belongs to the same tenant
      include: [
        {
          model: Role,
          attributes: ["role_name", "description"], // Role details
        },
        {
          model: Client,
          attributes: ["client_id", "company_name", "contact_person", "official_email"], // Client details
          through: { attributes: [] }, // Exclude the join table
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: `User with ID ${user_id} not found or not part of your tenant.` });
    }

    res.status(200).json({
      message: "User profile retrieved successfully.",
      user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
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
  const {
    first_name,
    last_name,
    address,
    gender,
    phone,
    photo,
    education,
    birthdate,
    website,
    company_name,
    industry,
    official_email,
    contact_person,
  } = req.body; // Get new details from request body

  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      first_name,
      last_name,
      address,
      gender,
      phone,
      photo,
      education,
      birthdate,
    });

    const role = await user.getRole();

    if (role.role_name === "client") {
      // Update client details if user is a client
      const client = await Client.findOne({ where: { user_id: user.user_id } });

      if (client) {
        await client.update({
          website,
          company_name,
          industry,
          official_email,
          contact_person,
        });
      } else {
        // If no client record exists, create a new one
        await Client.create({
          email: user.email,
          website,
          company_name,
          industry,
          official_email,
          contact_person,
        });
      }
    }

    const updatedUser = await User.findByPk(user_id, {
      include: [
        {
          model: Role,
          attributes: ["role_name"],
        },
        {
          model: Client,
          attributes: [
            "website",
            "company_name",
            "industry",
            "official_email",
            "contact_person",
          ],
        },
      ],
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
    // Retrieve the tenant_id from the authenticated user
    const { tenant_id } = req.user;

    if (!tenant_id) {
      return res.status(403).json({ message: "Access denied. Tenant ID is required." });
    }

    // Fetch all roles for the tenant
    const roles = await Role.findAll({
      where: { tenant_id }, // Filter roles by tenant_id
      attributes: ["role_id", "role_name", "description"], // Select only necessary attributes
    });

    // If no roles found, return a message
    if (roles.length === 0) {
      return res.status(404).json({ message: "No roles found for this tenant." });
    }

    // Return the list of roles
    return res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Function to retrieve all staff members with roles 'operative' and 'supervisor'
const getAllStaff = async (req, res) => {
  try {
    const { tenant_id } = req.user; // Retrieve tenant_id from the authenticated user

    if (!tenant_id) {
      return res.status(403).json({ message: "Access denied. Tenant ID is required." });
    }

    // Fetch all staff (operators and supervisors) for the tenant
    const staff = await User.findAll({
      where: { tenant_id }, // Ensure staff belong to the same tenant
      include: [
        {
          model: Role,
          where: {
            role_name: {
              [Op.in]: ["operator", "supervisor"], // Include only specified roles
            },
          },
          attributes: ["role_name", "description"], // Limit attributes returned for roles
        },
      ],
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "email",
        "phone",
        "address",
        "created_at",
      ], // Select only necessary user attributes
    });

    if (staff.length === 0) {
      return res.status(404).json({ message: "No staff found for this tenant." });
    }

    res.status(200).json(staff);
  } catch (error) {
    console.error("Error retrieving staff members:", error.message);
    res
      .status(500)
      .send({ message: "Error retrieving staff members: " + error.message });
  }
};


// Function to retrieve all clients
const getAllClients = async (req, res) => {
  try {
    const { tenant_id } = req.user; // Retrieve tenant_id from the authenticated user

    if (!tenant_id) {
      return res.status(403).json({ message: "Access denied. Tenant ID is required." });
    }

    // Fetch all clients for the tenant
    const clients = await User.findAll({
      where: { tenant_id }, // Filter users by tenant_id
      include: [
        {
          model: Role,
          where: { role_name: "client" }, // Filter by client role
          attributes: ["role_name", "description"], // Limit attributes for roles
        },
        {
          model: Client,
          attributes: ["client_id", "company_name", "contact_person", "email", "official_email", "website", "industry"],
          through: { attributes: [] }, // Exclude UserClient attributes
        },
      ],
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "email",
        "phone",
        "address",
        "created_at",
      ], // Limit user attributes
    });

    if (clients.length === 0) {
      return res.status(404).json({ message: "No clients found for this tenant." });
    }

    res.status(200).json(clients);
  } catch (error) {
    console.error("Error retrieving clients:", error.message);
    res
      .status(500)
      .send({ message: "Error retrieving clients: " + error.message });
  }
};

// get all admin, for debuggin purposes
const getAllAdmins = async (req, res) => {
  try {
    // Fetch all users with the "admin" role
    const admins = await User.findAll({
      include: [
        {
          model: Role,
          where: { role_name: "admin" }, // Filter by "admin" role
          attributes: ["role_name", "description"], // Limit attributes for roles
        },
      ],
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "email",
        "phone",
        "tenant_id",
        "created_at",
      ], // Limit user attributes
    });

    if (admins.length === 0) {
      return res.status(404).json({ message: "No admins found in the system." });
    }

    res.status(200).json(admins);
  } catch (error) {
    console.error("Error retrieving admins:", error.message);
    res.status(500).send({ message: "Error retrieving admins: " + error.message });
  }
};


const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the User table
    const users = await User.findAll({
      include: [
        {
          model: Role,
          attributes: ["role_name", "description"], // Include role details
        },
      ],
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "email",
        "phone",
        "tenant_id",
        "created_at",
      ], // Limit user attributes
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found in the system." });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error.message);
    res.status(500).send({ message: "Error retrieving users: " + error.message });
  }
};

const adminUpdateUser = async (req, res) => {
  try {
    const { user_id } = req.params; // ID of the user to be updated
    const { tenant_id, role_name } = req.user; // Admin's tenant_id and role

    // Ensure only admins can access this endpoint
    if (role_name !== "admin") {
      return res.status(403).json({ message: "Access denied. Only admins can edit user details." });
    }

    // Check if the user exists and belongs to the same tenant
    const user = await User.findOne({ where: { user_id, tenant_id } });
    if (!user) {
      return res.status(404).json({ message: `User with ID ${user_id} not found in your tenancy.` });
    }

    // Update the user's details (only fields provided in the request body)
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      gender,
      photo,
      education,
      birthdate,
    } = req.body;

    const updatedUser = await user.update(
      {
        first_name,
        last_name,
        email,
        phone,
        address,
        gender,
        photo,
        education,
        birthdate,
      },
      { fields: ["first_name", "last_name", "email", "phone", "address", "gender", "photo", "education", "birthdate"] } // Only allow these fields to be updated
    );

    res.status(200).json({
      message: "User details updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user details:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Super Delete User Profile
async function superDeleteUser(req, res) {
  const { user_id } = req.params;

  try {
    // Fetch the user and their role
    const user = await User.findOne({
      where: { user_id },
      include: {
        model: Role,
        attributes: ["role_name"],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user is an admin
    const isAdmin = user.Role.role_name === "admin";

    // Handle clients associated with the user (if any)
    const userClients = await UserClient.findAll({ where: { user_id } });
    if (userClients.length > 0) {
      const clientIds = userClients.map((userClient) => userClient.client_id);

      // Remove user-client associations
      await UserClient.destroy({ where: { user_id } });

      // Delete associated clients
      await Client.destroy({
        where: {
          client_id: clientIds,
        },
      });
    }

    // If the user is an admin, handle cascading deletion for tenancy
    if (isAdmin) {
      const adminCount = await User.count({
        where: {
          tenant_id: user.tenant_id,
          role_id: user.role_id, // Count only users with the "admin" role in the same tenant
        },
      });

      // If this is the last admin for the tenant, delete the tenant and associated records
      if (adminCount === 1) {
        const tenantId = user.tenant_id;

        // Delete all users in the tenant
        await User.destroy({
          where: { tenant_id: tenantId },
        });

        // Delete all projects in the tenant
        await Project.destroy({
          where: { tenant_id: tenantId },
        });

        // Delete all items in the tenant
        await Item.destroy({
          where: { tenant_id: tenantId },
        });

        // Delete all project inventory records in the tenant
        await ProjectInventory.destroy({
          where: { tenant_id: tenantId },
        });

        // delete all associated roles
        await Role.destroy({
          where: { tenant_id: tenantId },
        });

        // Finally, delete the tenant
        await Tenant.destroy({
          where: { tenant_id: tenantId },
        });
      }
    }

    // Finally, delete the user
    await user.destroy();

    res.status(200).json({
      message:
        "User, associated data, and tenancy (if applicable) deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({
      message: "An error occurred while deleting the user.",
      error: error.message,
    });
  }
}



// Delete User Profile
async function deleteUser(req, res) {
  const { user_id } = req.params; // ID of the user to be deleted
  const { user_id: authenticatedUserId, tenant_id, role_name } = req.user; // Authenticated user's details

  try {
    // Prevent a user from deleting themselves
    if (parseInt(user_id) === authenticatedUserId) {
      return res.status(400).json({
        message: "You cannot delete your own account.",
      });
    }

    // Check if the user exists and belongs to the same tenant
    const user = await User.findOne({
      where: { user_id, tenant_id }, // Ensure the user belongs to the same tenant
      include: {
        model: Role,
        attributes: ["role_name"],
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found in your tenancy." });
    }

    // Ensure only admins can delete users
    if (role_name !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized. Only admins can delete users." });
    }

    // Check if the user is a client (i.e., linked to a client in the UserClients table)
    const userClients = await UserClient.findAll({
      where: { user_id },
    });

    if (userClients.length > 0) {
      const clientIds = userClients.map((userClient) => userClient.client_id);

      // Remove user-client associations
      await UserClient.destroy({
        where: { user_id },
      });

      // Delete associated clients (if they exist and belong to the same tenant)
      await Client.destroy({
        where: {
          client_id: clientIds,
          tenant_id, // Prevent deleting clients outside the tenant
        },
      });
    }

    // Delete the user
    await user.destroy();

    // Send a response
    res
      .status(200)
      .json({ message: "User and associated data deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({
      message: "An error occurred while deleting the user.",
      error: error.message,
    });
  }
}

module.exports = {
  profile,
  getUserProfileByAdmin,
  updateUserDetails,
  adminUpdateUser,
  getAvailableRoles,
  getAllStaff,
  getAllClients,
  getAllAdmins,
  getAllUsers,
  superDeleteUser,
  deleteUser,
};
