const {
  User,
  Role,
  UserClient,
  Client,
  Project,
  ProjectInventory,
  Item,
  Tenant,
  TenantRole,
} = require("../models/models.js");
const { Op } = require("sequelize");

// Controller to get user profile
const profile = async (req, res) => {
  try {
    // Extract user ID from request (this comes from the auth middleware)
    const { user_id: userId } = req.user; // Ensure `user_id` matches the field name in your User model

    // Fetch user details along with associated role and client info
    const userProfile = await User.findOne({
      where: { user_id: userId }, // Match with the `user_id` field in the Users table
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "status",
        "address",
        "gender",
        "phone",
        "photo",
        "education",
        "birthdate",
        "organisation_name",
      ],
      include: [
        {
          model: Role,
          attributes: ["role_name", "description"], // Use correct field names based on your schema
        },
        {
          model: Client,
          attributes: [
            "client_id",
            "tenant_id",
            "email",
            "website",
            "company_name",
            "industry",
            "official_email",
            "contact_person",
            "created_at",
            "updated_at",
          ],
          through: { attributes: [] }, // Exclude UserClient join table details
        },
      ],
    });

    // Check if user was found
    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert userProfile to JSON so we can modify the response
    const responseUser = userProfile.toJSON();

    // If the user has client data, add the extra fields (`first_name`, `last_name`, `phone`, `photo`) to Clients object
    if (responseUser.Clients && responseUser.Clients.length > 0) {
      responseUser.Clients = responseUser.Clients.map((client) => ({
        ...client,
        first_name: responseUser.first_name,
        last_name: responseUser.last_name,
        phone: responseUser.phone,
        photo: responseUser.photo,
      }));
    }

    return res.status(200).json(responseUser);
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getUserProfileByAdmin = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Retrieve tenant_id from the authenticated admin
    const { tenant_id, role_name } = req.user;

    // Ensure only admins can access this endpoint
    if (role_name !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only admins can view user profiles.",
      });
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
          attributes: [
            "client_id",
            "company_name",
            "contact_person",
            "official_email",
          ], // Client details
          through: { attributes: [] }, // Exclude the join table
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: `User with ID ${user_id} not found or not part of your tenant.`,
      });
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
 * Update user account details{username, email, phone, company_name, contact_person, status}
 * **/
const updateUserDetails = async (req, res) => {
  const { user_id, tenant_id } = req.user; // Authenticated user details
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
  } = req.body; // User's new details

  try {
    // Find the logged-in user with role information
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

    // Update the user's personal details
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

    // Fetch the updated user details
    const updatedUser = await User.findOne({
      where: { user_id },
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "address",
        "gender",
        "phone",
        "photo",
        "education",
        "birthdate",
      ],
      include: [
        {
          model: Client,
          attributes: [
            "client_id",
            "tenant_id",
            "email",
            "website",
            "company_name",
            "industry",
            "official_email",
            "contact_person",
            "created_at",
            "updated_at",
          ],
          through: { attributes: [] }, // Exclude UserClient join table details
        },
      ],
    });

    // Modify response to include user fields inside the Clients array
    const responseUser = updatedUser.toJSON();
    if (responseUser.Clients && responseUser.Clients.length > 0) {
      responseUser.Clients = responseUser.Clients.map((client) => ({
        ...client,
        first_name: responseUser.first_name,
        last_name: responseUser.last_name,
        phone: responseUser.phone,
        photo: responseUser.photo,
      }));
    }

    return res.status(200).json({
      message: "User details updated successfully.",
      user: responseUser,
    });
  } catch (error) {
    console.error("Error updating user details:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// list of available roles
const getAvailableRoles = async (req, res) => {
  try {
    const { tenant_id } = req.user; // Get authenticated user's tenant_id

    // Fetch roles available to the tenant from TenantRoles
    const roles = await Role.findAll({
      include: [
        {
          model: TenantRole,
          where: { tenant_id },
          attributes: [], // We only need role details, no extra fields from TenantRoles
        },
      ],
    });

    if (!roles.length) {
      return res.status(404).json({ message: "No roles found for this tenant." });
    }

    res.status(200).json({
      message: "Roles retrieved successfully.",
      roles,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Function to retrieve all staff members with roles 'operative' and 'supervisor'
const getAllStaff = async (req, res) => {
  try {
    const { tenant_id } = req.user; // Retrieve tenant_id from the authenticated user

    if (!tenant_id) {
      return res
        .status(403)
        .json({ message: "Access denied. Tenant ID is required." });
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
      return res
        .status(404)
        .json({ message: "No staff found for this tenant." });
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
      return res
        .status(403)
        .json({ message: "Access denied. Tenant ID is required." });
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
          attributes: [
            "client_id",
            "company_name",
            "contact_person",
            "email",
            "official_email",
            "website",
            "industry",
          ],
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
      return res
        .status(404)
        .json({ message: "No clients found for this tenant." });
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
      return res
        .status(404)
        .json({ message: "No admins found in the system." });
    }

    res.status(200).json(admins);
  } catch (error) {
    console.error("Error retrieving admins:", error.message);
    res
      .status(500)
      .send({ message: "Error retrieving admins: " + error.message });
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
    res
      .status(500)
      .send({ message: "Error retrieving users: " + error.message });
  }
};

const adminUpdateUser = async (req, res) => {
  try {
    const { user_id } = req.params; // ID of the user to be updated
    const { tenant_id, role_name } = req.user; // Admin's tenant_id and role

    // Ensure only admins can access this endpoint
    if (role_name !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can edit user details like this." });
    }

    // Check if the user exists and belongs to the same tenant
    const user = await User.findOne({
      where: { user_id, tenant_id },
      include: {
        model: Role,
        attributes: ["role_name"],
      },
    });

    if (!user) {
      return res.status(404).json({
        message: `User with ID ${user_id} not found in your tenancy.`,
      });
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
      organisation_name,
      website,
      company_name,
      industry,
      official_email,
      contact_person,
    } = req.body;

    await user.update({
      first_name,
      last_name,
      email,
      phone,
      address,
      gender,
      photo,
      education,
      birthdate,
      organisation_name,
    });

    // If the user is a client, update client-specific details
    if (user.Role.role_name === "client") {
      let client = await Client.findOne({ where: { email: user.email, tenant_id } });

      if (client) {
        await client.update({
          website,
          company_name,
          industry,
          official_email,
          contact_person,
        });
      } else {
        await Client.create({
          email: user.email,
          website,
          company_name,
          industry,
          official_email,
          contact_person,
          tenant_id,
        });
      }
    }

    // Fetch the updated user details **excluding UserClient**
    const updatedUser = await User.findOne({
      where: { user_id },
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "email",
        "phone",
        "address",
        "gender",
        "photo",
        "education",
        "birthdate",
        "organisation_name",
      ],
      include: [
        {
          model: Client,
          attributes: [
            "client_id",
            "tenant_id",
            "email",
            "website",
            "company_name",
            "industry",
            "official_email",
            "contact_person",
            "created_at",
            "updated_at",
          ],
          through: { attributes: [] }, // Exclude UserClient join table details
        },
      ],
    });

    // Modify response to include user fields inside the Clients array
    const responseUser = updatedUser.toJSON();
    if (responseUser.Clients && responseUser.Clients.length > 0) {
      responseUser.Clients = responseUser.Clients.map((client) => ({
        ...client,
        first_name: responseUser.first_name,
        last_name: responseUser.last_name,
        phone: responseUser.phone,
        photo: responseUser.photo,
      }));
    }

    return res.status(200).json({
      message: "User details updated successfully.",
      user: responseUser,
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
