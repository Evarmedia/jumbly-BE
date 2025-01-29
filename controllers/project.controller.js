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

// create a new project -admin creates a project and asigns it to a client
const createProjectAdmin = async (req, res) => {
  try {
    const user_id = req.user.user_id; // Get the authenticated user's ID
    const tenant_id = req.user.tenant_id; // Get the authenticated user's tenant ID
    const {
      project_name,
      start_date,
      end_date,
      status_id,
      description,
      client_id,
    } = req.body;

    // Check if the authenticated user is an admin within the same tenant
    const adminUser = await User.findOne({
      where: { user_id, tenant_id },
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

    // Verify that the client exists and belongs to the same tenant
    const client = await Client.findOne({
      where: { client_id, tenant_id },
    });

    if (!client) {
      return res.status(404).json({
        message: `Client with ID ${client_id} not found in your tenancy.`,
      });
    }

    // Ensure no duplicate project name within the client
    const existingProject = await Project.findOne({
      where: {
        project_name,
        client_id, // Scope uniqueness to the client
      },
    });

    if (existingProject) {
      return res.status(400).json({
        message: `A project with the name "${project_name}" already exists for this client.`,
      });
    }

    // Validate that start_date is before end_date (if provided)
    if (end_date && new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        message: "End date must be after the start date.",
      });
    }

    // Create the project and associate it with the client
    const newProject = await Project.create({
      client_id,
      project_name,
      start_date,
      end_date,
      status_id,
      description,
      tenant_id, // Ensure the project is linked to the same tenant
    });

    // Insert into AuditLogs
    await sequelize.query(
      `INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      {
        replacements: [
          "Projects",
          "INSERT",
          newProject.project_id,
          user_id,
          `Admin created a project with name "${project_name}" for client with ID ${client_id}`,
        ],
      }
    );

    return res.status(201).json({
      message: "Project created successfully and assigned to the client.",
      project: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// create a new project -client
const createProject = async (req, res) => {
  try {
    const user_id = req.user.user_id; // Get the authenticated user's ID
    const tenant_id = req.user.tenant_id; // Get the authenticated user's tenant ID
    const { project_name, start_date, end_date, status_id, description } =
      req.body;

    // Check if the user is associated with a client in the same tenant
    const user = await User.findOne({
      where: { user_id, tenant_id }, // Ensure user belongs to the same tenant
      include: {
        model: Client,
        through: UserClient, // Include the UserClient join table
        attributes: ["client_id"],
      },
    });

    if (!user || !user.Clients || user.Clients.length === 0) {
      return res.status(403).json({
        message:
          "Unauthorized. User must be a client within the tenancy to create a project.",
      });
    }

    const client_id = user.Clients[0].client_id; // Get the client's ID for the project

    // Validate that start_date is before end_date (if provided)
    if (end_date && new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        message: "End date must be after the start date.",
      });
    }

    // Ensure no duplicate project name within the client
    const existingProject = await Project.findOne({
      where: {
        project_name,
        client_id, // Ensure uniqueness within the client
      },
    });

    if (existingProject) {
      return res.status(400).json({
        message: `A project with the name "${project_name}" already exists for this client.`,
      });
    }

    // Create the project
    const newProject = await Project.create({
      client_id,
      tenant_id, // Ensure project is linked to the correct tenant
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
          newProject.project_id,
          user_id,
          `Client with email ${user.email} created a project "${project_name}."`,
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
    const { tenant_id } = req.user; // Get tenant_id from authenticated user
    const {
      client_id,
      status_id,
      start_date,
      end_date,
      page = 1,
      limit = 10,
    } = req.query;

    const whereClause = { tenant_id }; // Ensure query is tenant-scoped

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

    const { count, rows: projects } = await Project.findAndCountAll({
      where: whereClause,
      include: [
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
        },
        {
          model: ProjectStatus, // Include project status details
          attributes: ["status_name"],
          as: "status", // Use the alias defined in the models
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (!projects.length) {
      return res
        .status(404)
        .json({ message: "No projects found in your tenancy." });
    }

    res.status(200).json({
      message: "Projects retrieved successfully.",
      projects: projects.map((project) => ({
        project_id: project.project_id,
        project_name: project.project_name,
        start_date: project.start_date,
        end_date: project.end_date,
        status_id: project.status_id,
        status_name: project.status ? project.status.status_name : "Unknown",
        description: project.description,
        client: project.Client, // Include client details
      })),
      page: parseInt(page),
      limit: parseInt(limit),
      total: count, // Return total projects in the tenant
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// return projects for an auhenticaed client
const getClientProjects = async (req, res) => {
  try {
    const { user_id, tenant_id } = req.user; // Get the authenticated user's ID and tenant

    // Find the user, verify their role is 'client', and retrieve their associated client
    const user = await User.findOne({
      where: { user_id, tenant_id }, // Ensure user is in the same tenant
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

    // Check if the user is associated with a client within their tenant
    if (!user || !user.Clients || user.Clients.length === 0) {
      return res.status(403).json({
        message:
          "Unauthorized. User must be a client within the tenancy to view projects.",
      });
    }

    // Retrieve the client_id (assuming one-to-one client relationship for simplicity)
    const { client_id } = user.Clients[0]; // Adjust if there are multiple clients

    // Fetch all projects for the client within the same tenant
    const projects = await Project.findAll({
      where: { client_id, tenant_id },
      include: [
        {
          model: ProjectStatus, // Include project status details
          attributes: ["status_name"],
        },
      ],
    });

    // If no projects are found, return 404
    if (!projects.length) {
      return res.status(404).json({
        message: `No projects found for client ID ${client_id} in your tenancy.`,
      });
    }

    res.status(200).json({
      message: "Client projects retrieved successfully.",
      projects: projects.map((project) => ({
        project_id: project.project_id,
        project_name: project.project_name,
        start_date: project.start_date,
        end_date: project.end_date,
        status_id: project.status_id,
        status_name: project.ProjectStatus
          ? project.ProjectStatus.status_name
          : "Unknown",
        description: project.description,
      })),
    });
  } catch (error) {
    console.error("Error fetching client projects:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Get specific project details
const getProjectDetails = async (req, res) => {
  try {
    const { project_id } = req.params; // Extract project_id from the request params
    const { tenant_id } = req.user; // Get the tenant ID from the authenticated user

    // Fetch the project details and include client & status information
    const project = await Project.findOne({
      where: { project_id, tenant_id }, // Ensure project belongs to the authenticated user's tenant
      include: [
        {
          model: Client,
          attributes: ["client_id", "company_name", "contact_person", "email"], // Include client details
        },
        {
          model: ProjectStatus, // Include project status details
          attributes: ["status_name"],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({
        message: `Project with ID ${project_id} not found in your tenancy.`,
      });
    }

    res.status(200).json({
      message: "Project details retrieved successfully.",
      project: {
        project_id: project.project_id,
        project_name: project.project_name,
        start_date: project.start_date,
        end_date: project.end_date,
        status_id: project.status_id,
        status_name: project.ProjectStatus
          ? project.ProjectStatus.status_name
          : "Unknown",
        description: project.description,
        client: project.Client, // Include client details in the response
      },
    });
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
    const { user_id, tenant_id } = req.user;
    const { project_id } = req.params; // Extract project_id from URL params
    const { project_name, start_date, end_date, status_id, description } =
      req.body;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // Find the project by ID and ensure it belongs to the authenticated user's tenant
    const project = await Project.findOne({
      where: { project_id, tenant_id }, // Ensure the project belongs to the same tenant
      include: {
        model: Client,
        attributes: ["client_id"],
      },
    });

    if (!project) {
      return res.status(404).json({
        message: `Project with ID ${project_id} not found in your tenancy.`,
      });
    }

    // Validate that start_date is before end_date (if provided)
    if (end_date && new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        message: "End date must be after the start date.",
      });
    }

    // Ensure that only the client or an admin can update the project
    const user = await User.findOne({
      where: { user_id, tenant_id },
      include: [
        {
          model: Role,
          attributes: ["role_name"],
        },
        {
          model: Client,
          through: UserClient, // Ensure user is linked to a client
          attributes: ["client_id"],
        },
      ],
    });

    if (!user) {
      return res.status(403).json({
        message:
          "Unauthorized. You do not have permission to update this project.",
      });
    }

    const isClient = user.Role.role_name === "client";
    const isAdmin = user.Role.role_name === "admin";

    if (isClient && user.Clients[0].client_id !== project.client_id) {
      return res.status(403).json({
        message: "Unauthorized. You can only update your own projects.",
      });
    }

    // Update the project details
    await project.update({
      project_name,
      start_date,
      end_date,
      status_id,
      description,
    });

    // Fetch the updated status_name from the ProjectStatus model
    const projectStatus = await ProjectStatus.findByPk(project.status_id);

    // Insert into AuditLogs
    await sequelize.query(
      `INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      {
        replacements: [
          "Projects",
          "UPDATE",
          project.project_id,
          user_id,
          `${
            isClient ? `Client with ID ${user.Clients[0].client_id}` : "Admin"
          } updated project with ID "${project_id}".`,
        ],
      }
    );

    res.status(200).json({
      message: "Project details updated successfully.",
      project: {
        project_id: project.project_id,
        project_name: project.project_name,
        start_date: project.start_date,
        end_date: project.end_date,
        status_id: project.status_id,
        status_name: projectStatus ? projectStatus.status_name : "Unknown",
        description: project.description,
      },
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
    const { user_id, tenant_id } = req.user; // Get user and tenant details

    // Validate that status_id is provided
    if (!status_id) {
      return res.status(400).json({ message: "status_id is required." });
    }

    // Find the project by ID and ensure it belongs to the authenticated user's tenant
    const project = await Project.findOne({
      where: { project_id, tenant_id }, // Ensure project is in the same tenant
      include: {
        model: Client,
        attributes: ["client_id"],
      },
    });

    if (!project) {
      return res.status(404).json({
        message: `Project with ID ${project_id} not found in your tenancy.`,
      });
    }

    // Validate user role (client can only update their own projects)
    const user = await User.findOne({
      where: { user_id, tenant_id },
      include: [
        {
          model: Role,
          attributes: ["role_name"],
        },
        {
          model: Client,
          through: UserClient, // Ensure user is linked to a client
          attributes: ["client_id"],
        },
      ],
    });

    if (!user) {
      return res.status(403).json({
        message:
          "Unauthorized. You do not have permission to update this project.",
      });
    }

    const isClient = user.Role.role_name === "client";
    const isAdmin = user.Role.role_name === "admin";

    if (isClient && user.Clients[0].client_id !== project.client_id) {
      return res.status(403).json({
        message:
          "Unauthorized. You can only update the status of your own projects.",
      });
    }

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
    if (status_id === 3) {
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
    const { user_id, tenant_id } = req.user; // Get authenticated user's ID and tenant ID

    // Validate that supervisor_id is provided
    if (!supervisor_id) {
      return res.status(400).json({ message: "supervisor_id is required." });
    }

    // Find the project by ID and ensure it belongs to the authenticated user's tenant
    const project = await Project.findOne({
      where: { project_id, tenant_id }, // Ensure project is in the same tenant
      include: {
        model: Client,
        attributes: ["client_id"],
      },
    });

    if (!project) {
      return res.status(404).json({
        message: `Project with ID ${project_id} not found in your tenancy.`,
      });
    }

    // Validate that the supervisor exists and their role is 'supervisor' within the same tenant
    const supervisor = await User.findOne({
      where: { user_id: supervisor_id, tenant_id }, // Ensure supervisor belongs to the same tenant
      include: [
        {
          model: Role,
          where: { role_name: "supervisor" },
          attributes: [],
        },
      ],
    });

    if (!supervisor) {
      return res.status(404).json({
        message: `Supervisor with ID ${supervisor_id} not found in your tenancy or is not a supervisor.`,
      });
    }

    // Ensure only admins can assign supervisors
    const user = await User.findOne({
      where: { user_id, tenant_id },
      include: {
        model: Role,
        attributes: ["role_name"],
      },
    });

    if (!user || user.Role.role_name !== "admin") {
      return res.status(403).json({
        message: "Unauthorized. Only admins can assign project supervisors.",
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
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
    });

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
          `Admin with ID ${user_id} assigned Supervisor ${supervisor_id} to project ID "${project_id}".`,
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
    const { user_id, tenant_id } = req.user; // Extract user_id and tenant_id from authenticated user

    // Find the project by ID and ensure it belongs to the authenticated user's tenant
    const project = await Project.findOne({
      where: { project_id, tenant_id }, // Ensure the project belongs to the same tenant
      include: {
        model: Client,
        attributes: ["client_id"],
      },
    });

    if (!project) {
      return res.status(404).json({
        message: `Project with ID ${project_id} not found in your tenancy Or doesn't exist.`,
      });
    }

    // Ensure that only the client or an admin can delete the project
    const user = await User.findOne({
      where: { user_id, tenant_id },
      include: [
        {
          model: Role,
          attributes: ["role_name"],
        },
        {
          model: Client,
          through: UserClient, // Ensure user is linked to a client
          attributes: ["client_id"],
        },
      ],
    });

    if (!user) {
      return res.status(403).json({
        message:
          "Unauthorized. You do not have permission to delete this project.",
      });
    }

    const isClient = user.Role.role_name === "client";
    const isAdmin = user.Role.role_name === "admin";

    if (isClient && user.Clients[0].client_id !== project.client_id) {
      return res.status(403).json({
        message: "Unauthorized. You can only delete your own projects.",
      });
    }

    // Delete the project
    await project.destroy();

    // Insert audit log using raw SQL
    await sequelize.query(
      `INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      {
        replacements: [
          "Projects",
          "DELETE",
          project.project_id,
          user_id,
          `${
            isClient ? `Client with ID ${user.Clients[0].client_id}` : "Admin"
          } deleted project with ID "${project_id}".`,
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
