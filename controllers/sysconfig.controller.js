const { Role, TaskStatus, TaskCategory, ProjectStatus } = require('../models/models');


const createRole = async (req, res) => {
    try {
        const { role_name, description } = req.body;

        // Validate input
        if (!role_name) {
            return res.status(400).json({ message: 'role_name is required.' });
        }

        // Check if the role already exists
        const existingRole = await Role.findOne({ where: { role_name } });
        if (existingRole) {
            return res.status(400).json({ message: 'Role already exists.' });
        }

        // Create the role
        const newRole = await Role.create({ role_name, description });

        res.status(201).json({
            message: 'Role created successfully.',
            role: newRole,
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

        // Find the role by ID
        const role = await Role.findByPk(role_id);
        if (!role) {
            return res.status(404).json({ message: `Role with ID ${role_id} not found.` });
        }

        // Restrict editing of the "admin" role
        if (role.role_name === 'admin') {
            return res.status(403).json({ message: 'Editing the "admin" role is not allowed.' });
        }

        // Check if the new role_name is already in use
        if (role_name && role_name !== role.role_name) {
            const existingRole = await Role.findOne({ where: { role_name } });
            if (existingRole) {
                return res.status(400).json({ message: 'Role name already exists.' });
            }
        }

        // Update the role
        await role.update({
            role_name: role_name || role.role_name,
            description: description || role.description,
        });

        res.status(200).json({
            message: 'Role updated successfully.',
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
            attributes: ['status_id', 'status_name', 'description'],
        });

        if (!statuses.length) {
            return res.status(404).json({ message: 'No task statuses found.' });
        }

        res.status(200).json({
            message: 'Task statuses fetched successfully.',
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
            return res.status(400).json({ message: 'category_name is required.' });
        }

        // Check if the category already exists
        const existingCategory = await TaskCategory.findOne({ where: { category_name } });
        if (existingCategory) {
            return res.status(400).json({ message: 'Task category already exists.' });
        }

        // Create the task category
        const newCategory = await TaskCategory.create({ category_name, description });

        res.status(201).json({
            message: 'Task category created successfully.',
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
            attributes: ['category_id', 'category_name', 'description'],
        });

        if (!categories.length) {
            return res.status(404).json({ message: 'No task categories found.' });
        }

        res.status(200).json({
            message: 'Task categories fetched successfully.',
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
            attributes: ['status_id', 'status_name', 'description'],
        });

        if (!statuses.length) {
            return res.status(404).json({ message: 'No project statuses found.' });
        }

        res.status(200).json({
            message: 'Project statuses fetched successfully.',
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
