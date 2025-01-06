const { Item, ProjectInventory, Project } = require("../models/models");
const sequelize = require("../config/db");

const { Op } = require("sequelize");

/**
 * Create an item in the main inventory.
 */
const createItem = async (req, res) => {
  try {
    const { name, quantity, description } = req.body;

    // Validate required fields
    if (!name || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "Name and quantity are required." });
    }

    // Validate quantity
    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity cannot be zero or negative." });
    }

    // Check if the item name already exists (case-insensitive)
    const existingItem = await Item.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')), // Convert name to lowercase
        name.toLowerCase() // Compare with input name in lowercase
      ),
    });

    if (existingItem) {
      return res.status(400).json({
        message: `Item with the name "${name}" already exists.`,
      });
    }

    // Create the item
    const newItem = await Item.create({
      name,
      quantity,
      description,
    });

    res.status(201).json({
      message: "Item created successfully.",
      item: newItem,
    });
  } catch (error) {
    console.error("Error creating item:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Retrieve a list of all items in the main inventory.
 */
const getAllItems = async (req, res) => {
  try {
    const { name, min_quantity, max_quantity, page = 1, limit = 10 } = req.query;

    // Build the where clause dynamically
    const whereClause = {};

    if (name) {
      whereClause.name = {
        [Op.iLike]: `%${name}%`, // Case-insensitive partial match
      };
    }

    if (min_quantity || max_quantity) {
      whereClause.quantity = {};
      if (min_quantity) {
        whereClause.quantity[Op.gte] = min_quantity; // Items with quantity >= min_quantity
      }
      if (max_quantity) {
        whereClause.quantity[Op.lte] = max_quantity; // Items with quantity <= max_quantity
      }
    }

    // Pagination setup
    const offset = (page - 1) * limit;

    // Fetch items with filters and pagination
    const items = await Item.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (!items.length) {
      return res.status(404).json({ message: "No items found in the inventory." });
    }

    res.status(200).json({
      message: "Items retrieved successfully.",
      items,
      page: parseInt(page),
      limit: parseInt(limit),
      total: items.length,
    });
  } catch (error) {
    console.error("Error fetching items:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Retrieve details of a specific item in the inventory.
 */
const getItemDetails = async (req, res) => {
  try {
    const { item_id } = req.params; // Get the item ID from the request params

    // Fetch the item by ID
    const item = await Item.findByPk(item_id);

    if (!item) {
      return res
        .status(404)
        .json({ message: `Item with ID ${item_id} not found.` });
    }

    res.status(200).json({
      message: "Item retrieved successfully.",
      item,
    });
  } catch (error) {
    console.error("Error fetching item details:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Retrieve the list of items in a specific project's inventory.
 */
const getProjectInventory = async (req, res) => {
  try {
    const { project_id } = req.params;

    // Validate that the project exists
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with ID ${project_id} not found.` });
    }

    // Fetch items associated with the project
    const projectInventory = await ProjectInventory.findAll({
      where: { project_id },
      include: [
        {
          model: Item,
          attributes: ["item_id", "name", "quantity", "description"],
        },
      ],
    });

    if (!projectInventory.length) {
      return res
        .status(404)
        .json({
          message: `No inventory items found for project ID ${project_id}.`,
        });
    }

    res.status(200).json({
      message: `Inventory items for project ID ${project_id} retrieved successfully.`,
      inventory: projectInventory,
    });
  } catch (error) {
    console.error("Error fetching project inventory:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update details of an item in the inventory.
 */
const updateItemDetails = async (req, res) => {
    try {
      const { item_id } = req.params; // Get the item ID from the request params
      const { name, quantity, description } = req.body; // Get the updated fields from the request body
  
      // Fetch the item by ID
      const item = await Item.findByPk(item_id);
  
      if (!item) {
        return res.status(404).json({ message: `Item with ID ${item_id} not found.` });
      }
  
      // Validate quantity if provided
      if (quantity !== undefined && quantity < 0) {
        return res.status(400).json({ message: 'Quantity cannot be negative.' });
      }
  
      // Update the item details
      await item.update({
        name: name || item.name,
        quantity: quantity !== undefined ? quantity : item.quantity,
        description: description || item.description,
      });
  
      res.status(200).json({
        message: 'Item updated successfully.',
        item,
      });
    } catch (error) {
      console.error('Error updating item details:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

/**
 * Delete an item from the main inventory.
 */
const deleteItem = async (req, res) => {
    try {
      const { item_id } = req.params; // Get the item ID from the request params
  
      // Fetch the item by ID
      const item = await Item.findByPk(item_id);
  
      if (!item) {
        return res.status(404).json({ message: `Item with ID ${item_id} not found.` });
      }
  
      // Delete the item
      await item.destroy();
  
      res.status(200).json({
        message: `Item with ID ${item_id} deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting item:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

module.exports = {
  createItem,
  getAllItems,
  getItemDetails,
  getProjectInventory,
  updateItemDetails,
  deleteItem,
};
