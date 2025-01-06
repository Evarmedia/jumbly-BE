const {
  Project,
  Client,
  User,
  Role,
  UserClient,
  ProjectStatus,
} = require("../models/models");
const reportQueue = require("../queues/reportQueue.js");

const sequelize = require("../config/db");
const { Op } = require("sequelize");

// create a new project -admin
const createProjectAdmin = async (req, res) => {
  try {
    const user_id = req.user.user_id; // Get the authenticated user's ID
    const {
      project_name,
      start_date,
      end_date,
      status_id,
      description,
      client_id,
    } = req.body;

    // Check if the authenticated user is an admin
    const adminUser = await User.findOne({
      where: { user_id },
      include: {
        model: Role,
        attributes: ["role_name"],
        where: { role_name: "admin" },
      },
    });

    if (!adminUser) {
      return res.status(403).json({
        message: "Unauthorized. User must be an admin to create projects.",
      });
    }

    // Verify that the client exists
    const client = await Client.findByPk(client_id);
    if (!client) {
      return res
        .status(404)
        .json({ message: `Client with ID ${client_id} not found.` });
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

    // Insert into AuditLogs
    await sequelize.query(
      `INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      {
        replacements: [
          "Projects",
          "INSERT",
          client_id,
          user_id,
          `Admin Created a project with name "${project_name}" for client with ID ${client_id}`,
        ],
      }
    );

    return res.status(201).json({
      message: "Project created successfully and assigned to the client.",
      project: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// create a new project -client
const createProject = async (req, res) => {
  try {
    const user_id = req.user.user_id; // Get the authenticated user's ID
    const { project_name, start_date, end_date, status_id, description } =
      req.body;

    // Check if the user is associated with a client
    const user = await User.findOne({
      where: { user_id },
      include: {
        model: Client,
        through: UserClient, // Include the UserClient join table
        attributes: ["client_id"],
      },
    });

    if (!user || !user.Clients || user.Clients.length === 0) {
      return res.status(403).json({
        message: "Unauthorized. User must be a client to create a project.",
      });
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

    // Insert into AuditLogs
    await sequelize.query(
      `INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      {
        replacements: [
          "Projects",
          "INSERT",
          client_id,
          user_id,
          `Client with email ${user.email} Created a project "${project_name}."`,
        ],
      }
    );

    return res.status(201).json({
      message: "Project created successfully.",
      project: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// list all projects in the project table:
/**
Fetch all projects:
GET /api/projects

Fetch projects for a specific client:
GET /api/projects?client_id=1

Fetch paginated projects:
GET /api/projects?page=2&limit=5

Fetch projects within a date range:
GET /api/projects?start_date=2023-01-01&end_date=2023-12-31
 * 
*/
const listAllProjects = async (req, res) => {
  try {
    const {
      client_id,
      status_id,
      start_date,
      end_date,
      page = 1,
      limit = 10,
    } = req.query;

    const whereClause = {};

    if (client_id) {
      whereClause.client_id = client_id;
    }

    if (status_id) {
      whereClause.status_id = status_id;
    }

    if (start_date || end_date) {
      whereClause.start_date = {};
      if (start_date) {
        whereClause.start_date[Op.gte] = start_date;
      }
      if (end_date) {
        whereClause.start_date[Op.lte] = end_date;
      }
    }

    const offset = (page - 1) * limit; // Calculate the offset

    const projects = await Project.findAll({
      where: whereClause,
      include: {
        model: Client,
        attributes: ["client_id", "company_name", "contact_person", "email"],
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (!projects.length) {
      return res.status(404).json({ message: "No projects found." });
    }

    res.status(200).json({
      projects,
      page: parseInt(page),
      limit: parseInt(limit),
      total: projects.length,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
          attributes: ["role_name"],
          where: { role_name: "client" },
        },
        {
          model: Client,
          through: UserClient, // Include the UserClient join table
          attributes: ["client_id", "company_name", "contact_person", "email"], // Fetch client details
        },
      ],
    });

    // Check if the user is associated with a client
    if (!user || !user.Clients || user.Clients.length === 0) {
      return res.status(403).json({
        message: "Unauthorized. User must be a client to view projects.",
      });
    }

    // Retrieve the client_id (assuming one-to-one client relationship for simplicity)
    const { client_id } = user.Clients[0]; // Adjust if there are multiple clients

    // Fetch all projects for the client
    const projects = await Project.findAll({
      where: { client_id },
      include: {
        model: Client,
        attributes: ["company_name", "contact_person", "email"], // Optional client details
      },
    });

    // If no projects are found, return 404
    if (!projects.length) {
      return res
        .status(404)
        .json({ message: `No projects found for client ID ${client_id}` });
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
        attributes: ["client_id", "company_name", "contact_person", "email"], // Include client details
      },
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with ID ${project_id} not found.` });
    }

    res.status(200).json({ project });
  } catch (error) {
    console.error("Error fetching project details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// update project details
const updateProjectDetails = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { project_id } = req.params; // Extract project_id from URL params
    const { project_name, start_date, end_date, status_id, description } =
      req.body;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized. Please log in" });
    }
    // Find the project by ID
    const project = await Project.findByPk(project_id);

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with ID ${project_id} not found.` });
    }

    const client_id = project.client_id;
    // Update the project details
    const updatedProject = await project.update({
      project_name,
      start_date,
      end_date,
      status_id,
      description,
    });

    // Insert into AuditLogs
    await sequelize.query(
      `INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      {
        replacements: [
          "Projects",
          "UPDATE",
          client_id,
          user_id,
          `Client with ID ${client_id} Updated project with ID "${project_id}."`,
        ],
      }
    );

    res.status(200).json({
      message: "Project details updated successfully.",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update project status
const updateProjectStatus = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { status_id } = req.body;

    // Validate that status_id is provided
    if (!status_id) {
      return res.status(400).json({ message: "status_id is required." });
    }

    // Find the project by ID
    const project = await Project.findByPk(project_id);

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with ID ${project_id} not found.` });
    }

    const client_id = project.client_id;
    const user_id = req.user.user_id;

    // Update the project status
    await project.update({ status_id });

    // Insert audit log using raw SQL
    await sequelize.query(
      `INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      {
        replacements: [
          "Projects",
          "UPDATE",
          project_id,
          user_id,
          `User with ID ${user_id} updated status of project with ID "${project_id}" to "${status_id}".`,
        ],
      }
    );

    // Check if the project status is being set to "completed" and trigger report generation
    if (project.status_id === 3) {
      // 3 is the ID for "completed" status
      await reportQueue.add({ project_id, client_id: project.client_id });
      console.log(`Report generation triggered for project ${project_id}`);
    }

    // Fetch the updated status_name from the ProjectStatus model
    const projectStatus = await ProjectStatus.findByPk(status_id);

    // Respond with updated project details including the status_name
    res.status(200).json({
      message: "Project status updated successfully.",
      project: {
        project_id: project.project_id,
        project_name: project.project_name,
        status_id: project.status_id,
        status_name: projectStatus ? projectStatus.status_name : null,
      },
    });
  } catch (error) {
    console.error("Error updating project status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const assignProjectSupervisor = async (req, res) => {
  try {
    const { project_id } = req.params; // Extract project_id from URL params
    const { supervisor_id } = req.body; // Extract the new supervisor_id from the request body
    const { user_id } = req.user;

    // Validate that supervisor_id is provided
    if (!supervisor_id) {
      return res.status(400).json({ message: "supervisor_id is required." });
    }

    // Find the project by ID
    const project = await Project.findByPk(project_id);

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with ID ${project_id} not found.` });
    }

    // Validate that the supervisor exists and their role is 'supervisor'
    const supervisor = await User.findOne({
      where: { user_id: supervisor_id }, // Match the user_id
      include: [
        {
          model: Role, // Join with the Roles table
          where: { role_name: "supervisor" }, // Ensure the role is 'supervisor'
          attributes: [], // No need to include role details in the result
        },
      ],
    });

    if (!supervisor) {
      return res.status(404).json({
        message: `Supervisor with ID ${supervisor_id} not found or is not a supervisor.`,
      });
    }

    // Update the project with the supervisor ID
    await project.update({ supervisor_id });

    // Fetch updated project details along with supervisor details
    const updatedProject = await Project.findOne({
      where: { project_id },
      include: [
        {
          model: User,
          as: "Supervisor", // Ensure the alias matches the model association
          attributes: ["user_id", "first_name", "last_name"], // Include supervisor name
        },
      ],
    });

    const client_id = project.client_id;
    await sequelize.query(
      `INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      {
        replacements: [
          "Projects",
          "UPDATE",
          client_id,
          user_id,
          `Admin with ID ${user_id} reassigned project with ID "${project_id}." to Supervisor ${supervisor_id}`,
        ],
      }
    );

    res.status(200).json({
      message: "Project supervisor assigned successfully.",
      project: {
        project_id: updatedProject.project_id,
        project_name: updatedProject.project_name,
        supervisor: {
          id: supervisor.user_id,
          first_name: supervisor.first_name,
          last_name: supervisor.last_name,
        },
      },
    });
  } catch (error) {
    console.error("Error updating project supervisor", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// delete project
const deleteProject = async (req, res) => {
  try {
    const { project_id } = req.params; // Extract project_id from the URL params
    const { user_id } = req.user; // Extract user_id from

    // Find the project by ID
    const project = await Project.findByPk(project_id);

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with ID ${project_id} not found.` });
    }

    // Delete the project
    await project.destroy();

    const client_id = project.client_id;

    await sequelize.query(
      `INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      {
        replacements: [
          "Projects",
          "DELETE",
          client_id,
          user_id,
          `Client or Admin with ID ${user_id} Deleted Project with ID "${project_id}."`,
        ],
      }
    );

    res
      .status(200)
      .json({ message: `Project with ID ${project_id} deleted successfully.` });
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
  assignProjectSupervisor,
  deleteProject,
};
