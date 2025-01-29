const {
  Role,
  User,
  TenantRole,
  TaskStatus,
  TaskCategory,
  ProjectStatus,
} = require("../models/models");

const createRole = async (req, res) => {
  try {
    const { role_name, description } = req.body;
    const { tenant_id, user_id } = req.user; // Extract authenticated user's details

    // Ensure only admins can create roles
    const user = await User.findOne({
      where: { user_id, tenant_id },
      include: {
        model: Role,
        attributes: ["role_name"],
      },
    });

    if (!user || user.Role.role_name !== "admin") {
      return res.status(403).json({
        message: "Unauthorized. Only admins can create roles.",
      });
    }

    // Convert role_name to lowercase for case-insensitive comparison
    const normalizedRoleName = role_name.toLowerCase();

    // Check if the role already exists globally (case-insensitive)
    let existingRole = await Role.findOne({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("role_name")),
        normalizedRoleName
      ),
    });

    // If the role doesn't exist, create it
    if (!existingRole) {
      existingRole = await Role.create({ role_name: normalizedRoleName, description });
    }

    // Check if the role is already assigned to this tenant
    const tenantHasRole = await TenantRole.findOne({
      where: { tenant_id, role_id: existingRole.role_id },
    });

    if (tenantHasRole) {
      return res.status(400).json({ message: "Role already exists for this tenant." });
    }

    // Assign the role to the tenant in TenantRoles
    await TenantRole.create({ tenant_id, role_id: existingRole.role_id });

    res.status(201).json({
      message: "Role created and assigned to tenant successfully.",
      role: existingRole,
    });
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const editRole = async (req, res) => {
  try {
    const { role_id } = req.params; // Extract role_id from the URL params
    const { role_name, description } = req.body;
    const { tenant_id, user_id } = req.user; // Extract tenant_id and user_id from authenticated user

    // Ensure only admins can edit roles
    const user = await User.findOne({
      where: { user_id, tenant_id },
      include: {
        model: Role,
        attributes: ["role_name"],
      },
    });

    if (!user || user.Role.role_name !== "admin") {
      return res.status(403).json({
        message: "Unauthorized. Only admins can edit roles.",
      });
    }

    // Find the role by ID and ensure it belongs to the authenticated user's tenant
    const role = await Role.findOne({ where: { role_id, tenant_id } });

    if (!role) {
      return res.status(404).json({
        message: `Role with ID ${role_id} not found in your tenancy.`,
      });
    }

    // Restrict editing of the "admin" role
    if (role.role_name.toLowerCase() === "admin") {
      return res
        .status(403)
        .json({ message: 'Editing the "admin" role is not allowed.' });
    }

    // Check if the new role_name (case-insensitive) already exists
    if (role_name && role_name.toLowerCase() !== role.role_name.toLowerCase()) {
      const existingRole = await Role.findOne({
        where: sequelize.where(
          sequelize.fn("LOWER", sequelize.col("role_name")),
          role_name.toLowerCase()
        ),
      });

      if (existingRole) {
        return res
          .status(400)
          .json({ message: "Role name already exists in this tenant." });
      }
    }

    // Update the role
    await role.update({
      role_name: role_name ? role_name.toLowerCase() : role.role_name,
      description: description || role.description,
    });

    res.status(200).json({
      message: "Role updated successfully.",
      role,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTaskStatuses = async (req, res) => {
  try {
    // Fetch all task statuses
    const statuses = await TaskStatus.findAll({
      attributes: ["status_id", "status_name", "description"],
    });

    if (!statuses.length) {
      return res.status(404).json({ message: "No task statuses found." });
    }

    res.status(200).json({
      message: "Task statuses fetched successfully.",
      statuses,
    });
  } catch (error) {
    console.error("Error fetching task statuses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createTaskCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;

    // Validate input
    if (!category_name) {
      return res.status(400).json({ message: "category_name is required." });
    }

    // Check if the category already exists
    const existingCategory = await TaskCategory.findOne({
      where: { category_name },
    });
    if (existingCategory) {
      return res.status(400).json({ message: "Task category already exists." });
    }

    // Create the task category
    const newCategory = await TaskCategory.create({
      category_name,
      description,
    });

    res.status(201).json({
      message: "Task category created successfully.",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error creating task category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTaskCategories = async (req, res) => {
  try {
    // Fetch all task categories
    const categories = await TaskCategory.findAll({
      attributes: ["category_id", "category_name", "description"],
    });

    if (!categories.length) {
      return res.status(404).json({ message: "No task categories found." });
    }

    res.status(200).json({
      message: "Task categories fetched successfully.",
      categories,
    });
  } catch (error) {
    console.error("Error fetching task categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProjectStatuses = async (req, res) => {
  try {
    // Fetch all project statuses
    const statuses = await ProjectStatus.findAll({
      attributes: ["status_id", "status_name", "description"],
    });

    if (!statuses.length) {
      return res.status(404).json({ message: "No project statuses found." });
    }

    res.status(200).json({
      message: "Project statuses fetched successfully.",
      statuses,
    });
  } catch (error) {
    console.error("Error fetching project statuses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createRole,
  editRole,
  getTaskStatuses,
  createTaskCategory,
  getTaskCategories,
  getProjectStatuses,
};
