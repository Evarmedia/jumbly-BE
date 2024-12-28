const { Task, Project } = require('../models/models');

const getProjectTasks = async (req, res) => {
    try {
        const { project_id } = req.params;

        // Verify the project exists
        const project = await Project.findByPk(project_id);
        if (!project) {
            return res.status(404).json({ message: `Project with ID ${project_id} not found.` });
        }

        // Fetch tasks for the project
        const tasks = await Task.findAll({
            where: { project_id },
        });

        if (!tasks.length) {
            return res.status(404).json({ message: `No tasks found for project ID ${project_id}.` });
        }

        res.status(200).json({ tasks });
    } catch (error) {
        console.error("Error fetching project tasks:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getProjectTasks,
};
