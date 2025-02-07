const {
  User,
  Role,
  Client,
  UserClient,
  Project,
  Feedback,
} = require("../models/models");

const { createNotification } = require("../utils/notification");

const { Op } = require("sequelize");

const createFeedback = async (req, res) => {
  try {
    const { user_id, tenant_id, first_name, email } = req.user; // Authenticated client user
    const { project_id, rating, comments } = req.body;

    // Validate required fields
    if (!project_id || !rating) {
      return res
        .status(400)
        .json({ message: "Project ID and rating are required." });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5." });
    }

    // Ensure the client is linked to a project within the same tenancy
    const userClient = await UserClient.findOne({
      where: { user_id },
      attributes: ["client_id"],
    });

    if (!userClient) {
      return res.status(403).json({
        message: "Unauthorized. You must be a client to submit feedback.",
      });
    }

    const { client_id } = userClient;

    // Ensure project exists and belongs to the same tenant
    const project = await Project.findOne({
      where: { project_id, tenant_id },
    });

    if (!project) {
      return res.status(404).json({
        message: `Project with ID ${project_id} not found in your tenancy.`,
      });
    }

    // Check if feedback already exists for this project and client
    const existingFeedback = await Feedback.findOne({
      where: { project_id, client_id },
    });

    if (existingFeedback) {
      return res.status(400).json({
        message: "You have already submitted feedback for this project.",
      });
    }

    // Create feedback entry
    const newFeedback = await Feedback.create({
      tenant_id,
      client_id,
      project_id,
      rating,
      comments,
    });

    // ✅ Get the admin user in the tenancy
    const adminUser = await User.findOne({
      where: { tenant_id },
      include: {
        model: Role,
        where: { role_name: "admin" },
        attributes: [], // No need to return role details
      },
      attributes: ["user_id"], // Get only user_id of the admin
    });

    if (adminUser) {
      // ✅ Send notification to the admin (Pass `tenant_id` as required by `createNotification`)
      await createNotification(
        adminUser.user_id, // Admin user ID
        `Feedback has been provided by ${first_name} with email: ${email} for project: ${project.project_name}`,
        "feedback", // Notification type
        "medium", // Priority
        tenant_id // Ensure correct tenant ID is stored
      );
    }

    return res.status(201).json({
      message: "Feedback submitted successfully.",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { user_id } = req.user; // Authenticated client user
    const { feedback_id } = req.params;
    const { rating, comments } = req.body;

    // Validate rating range
    if (rating && (rating < 1 || rating > 5)) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5." });
    }

    // Find client_id associated with the user
    const userClient = await UserClient.findOne({
      where: { user_id },
      attributes: ["client_id"],
    });

    if (!userClient) {
      return res.status(403).json({
        message: "Unauthorized. You must be a client to update feedback.",
      });
    }

    const { client_id } = userClient;

    // Ensure feedback exists and belongs to the authenticated client
    const feedback = await Feedback.findOne({
      where: { feedback_id, client_id },
    });

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback not found or you do not have permission to edit it.",
      });
    }

    // Update the feedback entry
    await feedback.update({
      rating: rating ?? feedback.rating, // Preserve existing value if not provided
      comments: comments ?? feedback.comments,
    });

    return res.status(200).json({
      message: "Feedback updated successfully.",
      feedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getProjectFeedback = async (req, res) => {
  try {
    const { tenant_id } = req.user; // Authenticated user's tenant
    const { project_id } = req.params;
    const { order } = req.query; // Sorting parameter

    // Ensure project exists within the tenant
    const project = await Project.findOne({
      where: { project_id, tenant_id },
    });

    if (!project) {
      return res.status(404).json({
        message: `Project with ID ${project_id} not found in your tenancy.`,
      });
    }

    // Define sorting order
    let orderClause = [["created_at", "DESC"]]; // Default: Newest feedback first
    if (order === "top") {
      orderClause = [["rating", "DESC"]]; // Sort by highest rating
    } else if (order === "low") {
      orderClause = [["rating", "ASC"]]; // Sort by lowest rating
    }

    // Retrieve feedback for the project
    const feedbackList = await Feedback.findAll({
      where: { project_id },
      include: [
        {
          model: Client,
          attributes: ["client_id", "company_name", "contact_person", "email"],
        },
      ],
      order: orderClause,
    });

    if (feedbackList.length === 0) {
      return res.status(404).json({
        message: `No feedback found for project ID ${project_id}.`,
      });
    }

    res.status(200).json({
      message: "Feedback retrieved successfully.",
      project_id,
      project_name: project.project_name,
      feedback: feedbackList.map((fb) => ({
        feedback_id: fb.feedback_id,
        rating: fb.rating,
        comments: fb.comments,
        created_at: fb.created_at,
        client_id: fb.Client.client_id,
        company_name: fb.Client.company_name,
        contact_person: fb.Client.contact_person,
        client_email: fb.Client.email,
      })),
    });
  } catch (error) {
    console.error("Error retrieving project feedback:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getClientFeedback = async (req, res) => {
  try {
    const { tenant_id } = req.user; // Authenticated user's tenant
    const { client_id } = req.params;
    const { order } = req.query; // Sorting parameter

    // Ensure client exists within the tenant
    const client = await Client.findOne({
      where: { client_id, tenant_id },
    });

    if (!client) {
      return res.status(404).json({
        message: `Client with ID ${client_id} not found in your tenancy.`,
      });
    }

    // Define sorting order
    let orderClause = [["created_at", "DESC"]]; // Default: Newest feedback first
    if (order === "top") {
      orderClause = [["rating", "DESC"]]; // Sort by highest rating
    } else if (order === "low") {
      orderClause = [["rating", "ASC"]]; // Sort by lowest rating
    }

    // Retrieve feedback for the client
    const feedbackList = await Feedback.findAll({
      where: { client_id },
      include: [
        {
          model: Project,
          attributes: ["project_id", "project_name"],
        },
      ],
      order: orderClause,
    });

    if (feedbackList.length === 0) {
      return res.status(404).json({
        message: `No feedback found for client ID ${client_id}.`,
      });
    }

    res.status(200).json({
      message: "Client feedback retrieved successfully.",
      client_id,
      company_name: client.company_name,
      feedback: feedbackList.map((fb) => ({
        feedback_id: fb.feedback_id,
        rating: fb.rating,
        comments: fb.comments,
        created_at: fb.created_at,
        project_id: fb.Project.project_id,
        project_name: fb.Project.project_name,
      })),
    });
  } catch (error) {
    console.error("Error retrieving client feedback:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getTenancyFeedback = async (req, res) => {
  try {
    const { tenant_id, role_name } = req.user; // Authenticated admin

    // Ensure only admins can access this endpoint
    if (role_name !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only admins can view tenancy-wide feedback.",
      });
    }

    // Extract query parameters
    const { order, sort_by } = req.query;

    // Define sorting order
    let orderClause = [["created_at", "DESC"]]; // Default: Newest feedback first
    if (order === "top") {
      orderClause = [["rating", "DESC"]]; // Highest-rated first
    } else if (order === "low") {
      orderClause = [["rating", "ASC"]]; // Lowest-rated first
    }

    // Additional sorting based on user preference
    if (sort_by) {
      const validSortFields = {
        rating: ["rating", "DESC"],
        date: ["created_at", "DESC"],
        project: ["Project.project_name", "ASC"],
        client: ["Client.company_name", "ASC"],
      };
      orderClause = [validSortFields[sort_by] || ["created_at", "DESC"]];
    }

    // Retrieve feedback for all projects in the tenancy
    const feedbackList = await Feedback.findAll({
      where: { tenant_id },
      include: [
        {
          model: Project,
          attributes: ["project_id", "project_name"],
        },
        {
          model: Client,
          attributes: ["client_id", "company_name", "contact_person", "email"],
        },
      ],
      order: orderClause,
    });

    if (feedbackList.length === 0) {
      return res.status(404).json({
        message: "No feedback found in your tenancy.",
      });
    }

    res.status(200).json({
      message: "Tenancy-wide feedback retrieved successfully.",
      feedback: feedbackList.map((fb) => ({
        feedback_id: fb.feedback_id,
        rating: fb.rating,
        comments: fb.comments,
        created_at: fb.created_at,
        project_id: fb.Project.project_id,
        project_name: fb.Project.project_name,
        client_id: fb.Client.client_id,
        company_name: fb.Client.company_name,
        contact_person: fb.Client.contact_person,
        client_email: fb.Client.email,
      })),
    });
  } catch (error) {
    console.error("Error retrieving tenancy-wide feedback:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const { user_id } = req.user; // Authenticated client user
    const { feedback_id } = req.params;

    // Find client_id associated with the user
    const userClient = await UserClient.findOne({
      where: { user_id },
      attributes: ["client_id"],
    });

    if (!userClient) {
      return res.status(403).json({
        message: "Unauthorized. You must be a client to delete feedback.",
      });
    }

    const { client_id } = userClient;

    // Ensure feedback exists and belongs to the authenticated client
    const feedback = await Feedback.findOne({
      where: { feedback_id, client_id },
    });

    if (!feedback) {
      return res.status(404).json({
        message:
          "Feedback not found or you do not have permission to delete it.",
      });
    }

    // Delete the feedback entry
    await feedback.destroy();

    return res.status(200).json({
      message: "Feedback deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting feedback:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createFeedback,
  updateFeedback,
  getProjectFeedback,
  getClientFeedback,
  getTenancyFeedback,
  deleteFeedback,
};
