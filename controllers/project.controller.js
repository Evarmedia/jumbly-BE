const { Project, Client, User, Role, UserClient } = require('../models/models');


// create a new project -admin
const createProjectAdmin = async (req, res) => {
    try {
        const user_id = req.user.user_id; // Get the authenticated user's ID
        const { project_name, start_date, end_date, status_id, description, client_id } = req.body;

        // Check if the authenticated user is an admin
        const adminUser = await User.findOne({
            where: { user_id },
            include: {
                model: Role,
                attributes: ['role_name'],
                where: { role_name: 'admin' },
            },
        });

        if (!adminUser) {
            return res.status(403).json({ message: 'Unauthorized. User must be an admin to create projects.' });
        }

        // Verify that the client exists
        const client = await Client.findByPk(client_id);
        if (!client) {
            return res.status(404).json({ message: `Client with ID ${client_id} not found.` });
        }

        // Create the project and associate it with the client
        const newProject = await Project.create({
            client_id,
            project_name,
            start_date,
            end_date,
            status_id,
            description,
        });

        return res.status(201).json({
            message: 'Project created successfully and assigned to the client.',
            project: newProject,
        });
    } catch (error) {
        console.error("Error creating project:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// create a new project -client
const createProject = async (req, res) => {
    try {
        const user_id = req.user.user_id; // Get the authenticated user's ID
        const { project_name, start_date, end_date, status_id, description } = req.body;

        // Check if the user is associated with a client
        const user = await User.findOne({
            where: { user_id },
            include: {
                model: Client,
                through: UserClient, // Include the UserClient join table
                attributes: ['client_id'],
            },
        });

        if (!user || !user.Clients || user.Clients.length === 0) {
            return res.status(403).json({ message: 'Unauthorized. User must be a client to create a project.' });
        }

        const client_id = user.Clients[0].client_id; // Get the client_id for the project

        // Create the project
        const newProject = await Project.create({
            client_id,
            project_name,
            start_date,
            end_date,
            status_id,
            description,
        });

        return res.status(201).json({
            message: 'Project created successfully.',
            project: newProject,
        });
    } catch (error) {
        console.error("Error creating project:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// list all projects in the project table:
const listAllProjects = async (req, res) => {
    try {
        // Fetch all projects and include client details
        const projects = await Project.findAll({
            include: {
                model: Client,
                attributes: ['client_id', 'company_name', 'contact_person', 'email'], // Include client details
            },
        });

        if (!projects.length) {
            return res.status(404).json({ message: 'No projects found.' });
        }

        res.status(200).json({ projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// return projects for an auhenticaed client
const getClientProjects = async (req, res) => {
    try {
        const user_id = req.user.user_id; // Get the authenticated user's ID

        // Find the user, verify their role is 'client', and retrieve their associated client via UserClient
        const user = await User.findOne({
            where: { user_id },
            include: [
                {
                    model: Role,
                    attributes: ['role_name'],
                    where: { role_name: 'client' },
                },
                {
                    model: Client,
                    through: UserClient, // Include the UserClient join table
                    attributes: ['client_id', 'company_name', 'contact_person', 'email'], // Fetch client details
                },
            ],
        });

        // Check if the user is associated with a client
        if (!user || !user.Clients || user.Clients.length === 0) {
            return res.status(403).json({ message: 'Unauthorized. User must be a client to view projects.' });
        }

        // Retrieve the client_id (assuming one-to-one client relationship for simplicity)
        const { client_id } = user.Clients[0]; // Adjust if there are multiple clients

        // Fetch all projects for the client
        const projects = await Project.findAll({
            where: { client_id },
            include: {
                model: Client,
                attributes: ['company_name', 'contact_person', 'email'], // Optional client details
            },
        });

        // If no projects are found, return 404
        if (!projects.length) {
            return res.status(404).json({ message: `No projects found for client ID ${client_id}` });
        }

        res.status(200).json({ projects });
    } catch (error) {
        console.error("Error fetching client projects:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//Get specific project details
const getProjectDetails = async (req, res) => {
    try {
        const { project_id } = req.params; // Extract project_id from the request params

        // Fetch the project details and include client information
        const project = await Project.findOne({
            where: { project_id },
            include: {
                model: Client,
                attributes: ['client_id', 'company_name', 'contact_person', 'email'], // Include client details
            },
        });

        if (!project) {
            return res.status(404).json({ message: `Project with ID ${project_id} not found.` });
        }

        res.status(200).json({ project });
    } catch (error) {
        console.error("Error fetching project details:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// update project details
const updateProjectDetails = async (req, res) => {
    try {
        const { project_id } = req.params; // Extract project_id from URL params
        const { project_name, start_date, end_date, status_id, description, } = req.body;

        // Find the project by ID
        const project = await Project.findByPk(project_id);

        if (!project) {
            return res.status(404).json({ message: `Project with ID ${project_id} not found.` });
        }

        // Update the project details
        const updatedProject = await project.update({
            project_name,
            start_date,
            end_date,
            status_id,
            description,
        });

        res.status(200).json({
            message: 'Project details updated successfully.',
            project: updatedProject,
        });
    } catch (error) {
        console.error("Error updating project details:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// update project status
const updateProjectStatus = async (req, res) => {
    try {
        const { project_id } = req.params; // Extract project_id from URL params
        const { status_id } = req.body; // Extract the new status ID from the request body

        // Validate that status_id is provided
        if (!status_id) {
            return res.status(400).json({ message: 'status_id is required.' });
        }

        // Find the project by ID
        const project = await Project.findByPk(project_id);

        if (!project) {
            return res.status(404).json({ message: `Project with ID ${project_id} not found.` });
        }

        // Update the project status
        await project.update({ status_id });

        res.status(200).json({
            message: 'Project status updated successfully.',
            project: {
                project_id: project.project_id,
                project_name: project.project_name,
                status_id: project.status_id,
            },
        });
    } catch (error) {
        console.error("Error updating project status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// delete project
const deleteProject = async (req, res) => {
    try {
        const { project_id } = req.params; // Extract project_id from the URL params

        // Find the project by ID
        const project = await Project.findByPk(project_id);

        if (!project) {
            return res.status(404).json({ message: `Project with ID ${project_id} not found.` });
        }

        // Delete the project
        await project.destroy();

        res.status(200).json({ message: `Project with ID ${project_id} deleted successfully.` });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createProjectAdmin,
    createProject,
    listAllProjects,
    getClientProjects,
    getProjectDetails,
    updateProjectDetails,
    updateProjectStatus,
    deleteProject,
};
