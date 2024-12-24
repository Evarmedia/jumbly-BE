const { Project, Client, User, Role, UserClient } = require('../models/models');

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
                    attributes: ['client_id', 'company_name'], // Fetch client details
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

module.exports = {
    getClientProjects,
};
