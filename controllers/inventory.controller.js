const { Item, ProjectInventory, Project } = require("../models/models");

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
    // Fetch all items from the database
    const items = await Item.findAll();

    if (!items.length) {
      return res
        .status(404)
        .json({ message: "No items found in the inventory." });
    }

    res.status(200).json({
      message: "Items retrieved successfully.",
      items,
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
