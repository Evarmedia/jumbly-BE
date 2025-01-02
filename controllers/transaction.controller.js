const { Transaction, ProjectInventory, Item } = require("../models/models");

/**
 * Borrow an item from the main inventory to a project's inventory.
 */
const borrowItem = async (req, res) => {
  try {
    const { item_id, project_id, quantity } = req.body;

    // Validate required fields
    if (!item_id || !project_id || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "item_id, project_id, and quantity are required." });
    }

    // Validate quantity
    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than zero." });
    }

    // Fetch the item from the main inventory
    const item = await Item.findByPk(item_id);
    if (!item) {
      return res
        .status(404)
        .json({ message: `Item not found in the main inventory.` });
    }

    // Check if enough quantity is available
    if (item.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient quantity in the main inventory." });
    }

    // Deduct the quantity from the main inventory
    item.quantity -= quantity;
    await item.save();

    // Add or update the quantity in the project's inventory
    const projectInventory = await ProjectInventory.findOne({
      where: { project_id, item_id },
    });

    if (projectInventory) {
      projectInventory.quantity += quantity;
      await projectInventory.save();
    } else {
      await ProjectInventory.create({
        project_id,
        item_id,
        quantity,
      });
    }

    // Record the transaction
    const newTransaction = await Transaction.create({
      item_id,
      project_id,
      quantity,
      action: "borrow",
    });

    res.status(201).json({
      message: "Item borrowed successfully.",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Error borrowing item:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Return an item from a project's inventory to the main inventory.
 */
const returnItem = async (req, res) => {
  try {
    const { item_id, project_id, quantity } = req.body;

    // Validate required fields
    if (!item_id || !project_id || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "item_id, project_id, and quantity are required." });
    }

    // Validate quantity
    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than zero." });
    }

    // Fetch the item from the project's inventory
    const projectInventory = await ProjectInventory.findOne({
      where: { item_id, project_id },
    });

    if (!projectInventory) {
      return res.status(404).json({
        message: `Item with ID ${item_id} not found in the inventory of project with ID ${project_id}.`,
      });
    }

    // Check if the project has enough borrowed quantity to return
    if (projectInventory.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Cannot return more items than currently borrowed." });
    }

    // Update the project's inventory
    projectInventory.quantity -= quantity;
    if (projectInventory.quantity === 0) {
      await projectInventory.destroy(); // Remove the record if quantity becomes zero
    } else {
      await projectInventory.save();
    }

    // Update the main inventory
    const item = await Item.findByPk(item_id);
    if (!item) {
      return res.status(404).json({
        message: `Item with ID ${item_id} not found in the main inventory.`,
      });
    }

    item.quantity += quantity;
    await item.save();

    // Record the transaction
    const newTransaction = await Transaction.create({
      item_id,
      project_id,
      quantity,
      action: "return",
    });

    res.status(201).json({
      message: "Item returned successfully.",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Error returning item:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Retrieve a list of all transactions (borrow/return logs).
 */
const getAllTransactions = async (req, res) => {
  try {
    // Fetch all transactions with related item and project details
    const transactions = await Transaction.findAll({
      include: [
        {
          model: Item,
          attributes: ["name", "description"],
        },
        {
          model: Project,
          attributes: ["project_name", "description"],
        },
      ],
      order: [["date", "DESC"]], // Order transactions by most recent first
    });

    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions found." });
    }

    res.status(200).json({
      message: "Transactions retrieved successfully.",
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Retrieve details of a specific transaction.
 */
const getTransactionDetails = async (req, res) => {
  try {
    const { transaction_id } = req.params; // Get the transaction ID from the request params

    // Fetch the transaction by ID with related item and project details
    const transaction = await Transaction.findOne({
      where: { transaction_id },
      include: [
        {
          model: Item,
          attributes: ["name", "description"],
        },
        {
          model: Project,
          attributes: ["project_name", "description"],
        },
      ],
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ message: `Transaction with ID ${transaction_id} not found.` });
    }

    res.status(200).json({
      message: "Transaction details retrieved successfully.",
      transaction,
    });
  } catch (error) {
    console.error("Error fetching transaction details:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  borrowItem,
  returnItem,
  getAllTransactions,
  getTransactionDetails,
};
