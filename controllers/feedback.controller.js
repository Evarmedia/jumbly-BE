const { User, Client, UserClient, Project, Feedback } = require("../models/models");
const sequelize = require("../config/db");

const { Op } = require("sequelize");

const createFeedback = async (req, res) => {
  try {
    const { user_id, tenant_id } = req.user; // Authenticated client user
    const { project_id, rating, comments } = req.body;

    // Validate required fields
    if (!project_id || !rating) {
      return res.status(400).json({ message: "Project ID and rating are required." });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
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
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createFeedback };
