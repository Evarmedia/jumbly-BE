const {
  User,
  Client,
  UserClient,
  Project,
  Feedback,
} = require("../models/models");

const { Op } = require("sequelize");

const createFeedback = async (req, res) => {
  try {
    const { user_id, tenant_id } = req.user; // Authenticated client user
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
  deleteFeedback,
};
