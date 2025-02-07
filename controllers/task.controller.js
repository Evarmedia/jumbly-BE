const { createNotification } = require("../utils/notification");
const {
  Task,
  Project,
  User,
  Role,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  Issue,
} = require("../models/models");
const { Op } = require("sequelize");

const createTask = async (req, res) => {
  try {
    const { tenant_id } = req.user; // Get tenant_id from authenticated user
    const {
      project_id,
      task_name,
      task_description,
      assigned_by,
      assigned_to,
      status_id,
      priority_id,
      due_date,
      category_id,
    } = req.body;

    // Validate the project ID and ensure it belongs to the same tenant
    const project = await Project.findOne({
      where: { project_id, tenant_id },
    });

    if (!project) {
      return res.status(404).json({ message: `Project with ID ${project_id} not found in your tenancy.` });
    }

    // Validate `assigned_by` only if it's provided
    let assigner = null;
    if (assigned_by) {
      assigner = await User.findOne({
        where: { user_id: assigned_by, tenant_id },
        include: { model: Role, attributes: ["role_name"] },
      });

      if (!assigner || !assigner.Role || !["supervisor", "admin"].includes(assigner.Role.role_name)) {
        return res.status(404).json({
          message: `Assigned_by user with ID ${assigned_by} is neither an admin nor a supervisor.`,
        });
      }
    }

    // Validate `assigned_to` only if it's provided
    let operative = null;
    if (assigned_to) {
      operative = await User.findOne({
        where: { user_id: assigned_to, tenant_id },
        include: { model: Role, attributes: ["role_name"] },
      });

      if (!operative || operative.Role.role_name !== "operative") {
        return res.status(404).json({
          message: `Assigned_to user with ID ${assigned_to} is not an operative.`,
        });
      }
    }

    // Create the task
    const newTask = await Task.create({
      project_id,
      task_name,
      task_description,
      assigned_by: assigned_by || null, // Allow null values
      assigned_to: assigned_to || null,
      status_id,
      priority_id,
      due_date,
      category_id: category_id || null, // Allow null for unassigned category
    });

    // Fetch the created task with associations
    const createdTask = await Task.findOne({
      where: { task_id: newTask.task_id },
      include: [
        { model: Project, attributes: ["project_id", "project_name"] },
        {
          model: TaskStatus,
          as: "status",
          attributes: ["status_id", "status_name"],
        },
        {
          model: TaskPriority,
          as: "priority",
          attributes: ["priority_id", "priority_name"],
        },
        {
          model: TaskCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });

    res.status(201).json({
      message: "Task created successfully.",
      task_id: createdTask.task_id,
      task_name: createdTask.task_name,
      task_description: createdTask.task_description,
      due_date: createdTask.due_date,
      status_id: createdTask.status ? createdTask.status.status_id : null,
      status_name: createdTask.status ? createdTask.status.status_name : "Unknown",
      priority_id: createdTask.priority ? createdTask.priority.priority_id : null,
      priority_name: createdTask.priority ? createdTask.priority.priority_name : "Unknown",
      category_id: createdTask.category ? createdTask.category.category_id : null,
      category_name: createdTask.category ? createdTask.category.category_name : "Uncategorized",
      project_id: createdTask.Project ? createdTask.Project.project_id : null,
      project_name: createdTask.Project ? createdTask.Project.project_name : null,
      assigned_by: assigner ? assigner.user_id : null,
      assigned_by_role: assigner ? assigner.Role.role_name : null,
      assigned_to: operative ? operative.user_id : null,
      assigned_to_role: operative ? operative.Role.role_name : null,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { project_id } = req.params;

    // Verify the project exists
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with ID ${project_id} not found.` });
    }

    // Fetch tasks for the project with associations
    const tasks = await Task.findAll({
      where: { project_id },
      include: [
        { model: Project, attributes: ["project_id", "project_name"] },
        {
          model: TaskStatus,
          as: "status",
          attributes: ["status_id", "status_name"],
        },
        {
          model: TaskPriority,
          as: "priority",
          attributes: ["priority_id", "priority_name"],
        },
        {
          model: TaskCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });

    if (!tasks.length) {
      return res
        .status(404)
        .json({ message: `No tasks found for project ID ${project_id}.` });
    }

    res.status(200).json({
      message: "Tasks fetched successfully.",
      tasks,
    });
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const {
      project_id,
      status_id,
      priority_id,
      category_id,
      assigned_to,
      page = 1,
      limit = 10,
    } = req.query;

    // Build the where clause dynamically
    const whereClause = {};

    if (project_id) {
      whereClause.project_id = project_id;
    }

    if (status_id) {
      whereClause.status_id = status_id;
    }

    if (priority_id) {
      whereClause.priority_id = priority_id;
    }

    if (category_id) {
      whereClause.category_id = category_id;
    }

    if (assigned_to) {
      whereClause.assigned_to = assigned_to;
    }

    // Pagination setup
    const offset = (page - 1) * limit;

    // Fetch tasks with filters, associations, and pagination
    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        { model: Project, attributes: ["project_id", "project_name"] },
        {
          model: TaskStatus,
          as: "status",
          attributes: ["status_id", "status_name"],
        },
        {
          model: TaskPriority,
          as: "priority",
          attributes: ["priority_id", "priority_name"],
        },
        {
          model: TaskCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (!tasks.length) {
      return res.status(404).json({ message: "No tasks found." });
    }

    res.status(200).json({
      message: "Tasks fetched successfully.",
      tasks,
      page: parseInt(page),
      limit: parseInt(limit),
      total: tasks.length,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTaskDetails = async (req, res) => {
  try {
    const { task_id } = req.params;

    // Fetch the specific task with associations
    const task = await Task.findOne({
      where: { task_id },
      include: [
        { model: Project, attributes: ["project_id", "project_name"] },
        {
          model: TaskStatus,
          as: "status",
          attributes: ["status_id", "status_name"],
        },
        {
          model: TaskPriority,
          as: "priority",
          attributes: ["priority_id", "priority_name"],
        },
        {
          model: TaskCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });

    if (!task) {
      return res
        .status(404)
        .json({ message: `Task with ID ${task_id} not found.` });
    }

    res.status(200).json({
      message: "Task details fetched successfully.",
      task,
    });
  } catch (error) {
    console.error("Error fetching task details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getOperativeTasks = async (req, res) => {
  try {
    const { user_id, role_id } = req.user; // Extract user details from the authenticated request

    // Check if the user is an operative
    const isoperative = await Role.findOne({
      where: { role_id, role_name: "operative" },
    });
    if (!isoperative) {
      return res.status(403).json({
        message: "Access denied. Only operatives can view this endpoint.",
      });
    }

    // Fetch tasks assigned to the operative
    const tasks = await Task.findAll({
      where: { assigned_to: user_id },
      include: [
        { model: Project, attributes: ["project_id", "project_name"] },
        {
          model: TaskStatus,
          as: "status",
          attributes: ["status_id", "status_name"],
        },
        {
          model: TaskPriority,
          as: "priority",
          attributes: ["priority_id", "priority_name"],
        },
        {
          model: TaskCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });

    if (!tasks.length) {
      return res
        .status(404)
        .json({ message: "No tasks assigned to this operative." });
    }

    res.status(200).json({
      message: "Tasks fetched successfully.",
      tasks,
    });
  } catch (error) {
    console.error("Error fetching operative tasks:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateTaskDetails = async (req, res) => {
  try {
    const { task_id } = req.params; // Extract task_id from the URL params
    const {
      project_id,
      task_name,
      task_description,
      assigned_by,
      assigned_to,
      status_id,
      priority_id,
      due_date,
      category_id,
    } = req.body; // Extract updated fields from the request body

    // Find the task by ID
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res
        .status(404)
        .json({ message: `Task with ID ${task_id} not found.` });
    }

    // If project_id is provided, validate it
    if (project_id && project_id !== task.project_id) {
      const project = await Project.findByPk(project_id);
      if (!project) {
        return res
          .status(404)
          .json({ message: `Project with ID ${project_id} not found.` });
      }
    }

    // Validate assigned_by (if provided)
    if (assigned_by) {
      const supervisor = await User.findOne({
        where: { user_id: assigned_by },
        include: {
          model: Role,
          where: { role_name: "supervisor" },
          attributes: [],
        },
      });
      if (!supervisor) {
        return res.status(404).json({
          message: `Assigned_by user with ID ${assigned_by} is not a supervisor.`,
        });
      }
    }

    // Validate assigned_to (if provided)
    if (assigned_to) {
      const operative = await User.findOne({
        where: { user_id: assigned_to },
        include: {
          model: Role,
          where: { role_name: "operative" },
          attributes: [],
        },
      });
      if (!operative) {
        return res.status(404).json({
          message: `Assigned_to user with ID ${assigned_to} is not an operative.`,
        });
      }
    }

    // Update the task
    await task.update({
      project_id: project_id || task.project_id,
      task_name: task_name || task.task_name,
      task_description: task_description || task.task_description,
      assigned_by: assigned_by || task.assigned_by,
      assigned_to: assigned_to || task.assigned_to,
      status_id: status_id || task.status_id,
      priority_id: priority_id || task.priority_id,
      due_date: due_date || task.due_date,
      category_id: category_id || task.category_id,
    });

    // Fetch the updated task with associations
    const updatedTask = await Task.findOne({
      where: { task_id },
      include: [
        { model: Project, attributes: ["project_id", "project_name"] },
        {
          model: TaskStatus,
          as: "status",
          attributes: ["status_id", "status_name"],
        },
        {
          model: TaskPriority,
          as: "priority",
          attributes: ["priority_id", "priority_name"],
        },
        {
          model: TaskCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });

    res.status(200).json({
      message: "Task updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { task_id } = req.params; // Extract task_id from the URL params
    const { status_id } = req.body; // Extract the new status_id from the request body

    // Validate that status_id is provided
    if (!status_id) {
      return res.status(400).json({ message: "status_id is required." });
    }

    // Find the task by ID
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res
        .status(404)
        .json({ message: `Task with ID ${task_id} not found.` });
    }

    // Validate the new status_id exists in the TaskStatuses table
    const status = await TaskStatus.findByPk(status_id);
    if (!status) {
      return res
        .status(404)
        .json({ message: `Status with ID ${status_id} not found.` });
    }

    // Update the task status
    await task.update({ status_id });

    // Fetch the updated task with the new status
    const updatedTask = await Task.findOne({
      where: { task_id },
      include: [
        {
          model: TaskStatus,
          as: "status",
          attributes: ["status_id", "status_name"],
        },
      ],
    });

    // Create a notification for the assigned user
    await createNotification(
      updatedTask.assigned_to,
      `task status has been updated to: ${updatedTask.status.status_name}`
    );

    res.status(200).json({
      message: "Task status updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const reassignTask = async (req, res) => {
  try {
    const { task_id } = req.params; // Extract task_id from the URL params
    const { assigned_to } = req.body; // Extract the new operative's ID from the request body

    // Validate that assigned_to is provided
    if (!assigned_to) {
      return res
        .status(400)
        .json({ message: "operative ID {assigned_to} is required." });
    }

    // Find the task by ID
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res
        .status(404)
        .json({ message: `Task with ID ${task_id} not found.` });
    }

    // Validate that the new assigned_to user exists and is an operative
    const operative = await User.findOne({
      where: { user_id: assigned_to },
      include: {
        model: Role,
        where: { role_name: "operative" },
        attributes: [],
      },
    });

    if (!operative) {
      return res
        .status(404)
        .json({ message: `User with ID ${assigned_to} is not an operative.` });
    }

    // Update the task with the new assigned_to ID
    await task.update({ assigned_to });

    // Fetch the updated task details
    const updatedTask = await Task.findOne({
      where: { task_id },
      include: [
        {
          model: User,
          as: "AssignedTo",
          attributes: ["user_id", "first_name", "last_name"],
        }, // Include the new operative details
      ],
    });

    // Create a notification for the assigned user
    await createNotification(
      assigned_to,
      `You have been assigned to task: ${task.task_name}`,
      "task",
      "high"
    );

    res.status(200).json({
      message: "Task assigned successfully.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error reassigning task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { task_id } = req.params; // Extract task_id from the URL params

    // Find the task by ID
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res
        .status(404)
        .json({ message: `Task with ID ${task_id} not found.` });
    }

    // Delete the task
    await task.destroy();

    res.status(200).json({ message: `Task deleted successfully.` });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const reportIssue = async (req, res) => {
  try {
    const { user_id } = req.user; // Extract the logged-in user's ID
    const { task_id, issue_description, photo_attachment } = req.body;

    // Validate required fields
    if (!task_id || !issue_description) {
      return res.status(400).json({
        message: "task_id and issue_description are required.",
      });
    }

    // Validate that the task exists
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res
        .status(404)
        .json({ message: `Task with ID ${task_id} not found.` });
    }

    // Create the issue
    const newIssue = await Issue.create({
      task_id,
      reported_by: user_id, // Use the logged-in user's ID
      issue_description,
      photo_attachment,
    });

    // Notify the task assignee about the issue
    if (task.assigned_to) {
      await createNotification(
        task.assigned_to,
        `An issue has been reported for task: ${task.task_name}`,
        "issue",
        "medium"
      );
    }

    res.status(201).json({
      message: "Issue reported successfully.",
      issue: newIssue,
    });
  } catch (error) {
    console.error("Error reporting issue:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const listIssues = async (req, res) => {
  try {
    const { task_id, reported_by, status, page = 1, limit = 10 } = req.query;

    // Build the where clause dynamically
    const whereClause = {};

    if (task_id) {
      whereClause.task_id = task_id;
    }

    if (reported_by) {
      whereClause.reported_by = reported_by;
    }

    if (status) {
      whereClause.status = status;
    }

    // Pagination setup
    const offset = (page - 1) * limit;

    // Fetch issues with filters, associations, and pagination
    const issues = await Issue.findAll({
      where: whereClause,
      include: [
        {
          model: Task,
          attributes: ["task_id", "task_name", "project_id"],
        },
        {
          model: User,
          as: "reportedBy",
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
      order: [["created_at", "DESC"]], // Order issues by most recent first
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (!issues.length) {
      return res.status(404).json({ message: "No issues found." });
    }

    res.status(200).json({
      message: "Issues fetched successfully.",
      issues,
      page: parseInt(page),
      limit: parseInt(limit),
      total: issues.length,
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTaskIssues = async (req, res) => {
  try {
    const { task_id } = req.params;

    // Validate that the task exists
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res
        .status(404)
        .json({ message: `Task with ID ${task_id} not found.` });
    }

    // Fetch issues for the given task
    const issues = await Issue.findAll({
      where: { task_id },
      include: [
        {
          model: Task,
          attributes: ["task_id", "task_name", "project_id"],
        },
        {
          model: User,
          as: "reportedBy",
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
      order: [["created_at", "DESC"]], // Order issues by most recent first
    });

    if (!issues.length) {
      return res
        .status(404)
        .json({ message: `No issues found for task with ID ${task_id}.` });
    }

    res.status(200).json({
      message: `Issues for task ${task.task_name} fetched successfully.`,
      issues,
    });
  } catch (error) {
    console.error("Error fetching task issues:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { task_id } = req.params;
    const { status } = req.body;

    // Validate required fields
    if (!status) {
      return res.status(400).json({ message: "status is required." });
    }

    // Validate that the task exists
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res
        .status(404)
        .json({ message: `Task with ID ${task_id} not found.` });
    }

    // Find the issue associated with the task
    const issue = await Issue.findOne({ where: { task_id } });
    if (!issue) {
      return res
        .status(404)
        .json({ message: `Issue for task with ID ${task_id} not found.` });
    }

    // Validate the new status
    const validStatuses = ["reported", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Valid statuses are: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    // Update the issue status
    await issue.update({ status });

    res.status(200).json({
      message: "Issue status updated successfully.",
      issue,
    });
  } catch (error) {
    console.error("Error updating issue status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getAllTasks,
  getOperativeTasks,
  getTaskDetails,
  updateTaskDetails,
  updateTaskStatus,
  reassignTask,
  deleteTask,
  reportIssue,
  listIssues,
  getTaskIssues,
  updateIssueStatus,
};
