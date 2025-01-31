const {
  Transaction,
  ProjectInventory,
  Item,
  Project,
  Client,
  User,
} = require("../models/models");

const sequelize = require("../config/db");
const { Op } = require("sequelize");

/**
 * Borrow an item from the main inventory to a project's inventory.
 */
const borrowItem = async (req, res) => {
  try {
    const { tenant_id, role_name } = req.user; // Get tenant_id and role from authenticated user
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

    // Ensure the project exists and belongs to the same tenant
    const project = await Project.findOne({
      where: { project_id, tenant_id },
      include: [
        {
          model: Client,
          attributes: ["client_id", "company_name", "contact_person", "email"],
        },
        {
          model: User, // Include supervisor details
          as: "Supervisor",
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({
        message: `Project with ID ${project_id} not found in your tenancy.`,
      });
    }

    // Ensure the item exists and belongs to the same tenant
    const item = await Item.findOne({
      where: { item_id, tenant_id }, // Restrict item access to the same tenant
      attributes: ["item_id", "name", "quantity"], // Fetch item name and quantity
    });

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

    // Add or update the quantity in the project's inventory, ensuring tenant scope
    const projectInventory = await ProjectInventory.findOne({
      where: { project_id, item_id, tenant_id },
    });

    if (projectInventory) {
      projectInventory.quantity += quantity;
      await projectInventory.save();
    } else {
      await ProjectInventory.create({
        project_id,
        item_id,
        quantity,
        tenant_id, // Ensure project inventory is linked to the same tenant
      });
    }

    // Record the transaction
    const newTransaction = await Transaction.create({
      item_id,
      project_id,
      quantity, // Quantity borrowed
      action: "borrow",
      tenant_id, // Ensure transaction is tenant-scoped
    });

    // Insert into AuditLogs
    await sequelize.query(
      `INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      {
        replacements: [
          "Transactions",
          "INSERT",
          newTransaction.transaction_id,
          req.user.user_id,
          `User with ID ${req.user.user_id} borrowed ${quantity} of item ID ${item_id} for project ID ${project_id}`,
        ],
      }
    );

    res.status(201).json({
      message: "Transaction Complete, Item borrowed successfully.",
      transaction_id: newTransaction.transaction_id,
      item_id: item.item_id,
      item_name: item.name,
      quantity_borrowed: quantity,
      quantity_left: item.quantity,
      project_id: project.project_id,
      project_name: project.project_name,
      start_date: project.start_date,
      end_date: project.end_date,
      client_id: project.Client ? project.Client.client_id : null,
      client_company_name: project.Client ? project.Client.company_name : null,
      client_contact_person: project.Client ? project.Client.contact_person : null,
      client_email: project.Client ? project.Client.email : null,
      supervisor_id: project.Supervisor ? project.Supervisor.user_id : null,
      supervisor_first_name: project.Supervisor
        ? project.Supervisor.first_name
        : null,
      supervisor_last_name: project.Supervisor
        ? project.Supervisor.last_name
        : null,
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
    const { tenant_id } = req.user; // Get tenant_id from authenticated user
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

    // Ensure the project exists and belongs to the same tenant
    const project = await Project.findOne({
      where: { project_id, tenant_id },
      include: [
        {
          model: Client,
          attributes: ["client_id", "company_name", "contact_person", "email"],
        },
        {
          model: User, // Include supervisor details
          as: "Supervisor",
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({
        message: `Project with ID ${project_id} not found in your tenancy.`,
      });
    }

    // Fetch the item from the project's inventory (tenant-scoped)
    const projectInventory = await ProjectInventory.findOne({
      where: { item_id, project_id, tenant_id },
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

    // Fetch the item from the main inventory (tenant-scoped)
    const item = await Item.findOne({
      where: { item_id, tenant_id },
      attributes: ["item_id", "name", "quantity"], // Fetch item name and quantity
    });

    if (!item) {
      return res.status(404).json({
        message: `Item with ID ${item_id} not found in the main inventory.`,
      });
    }

    // Update the project's inventory
    projectInventory.quantity -= quantity;
    if (projectInventory.quantity === 0) {
      await projectInventory.destroy(); // Remove the record if quantity becomes zero
    } else {
      await projectInventory.save();
    }

    // Update the main inventory
    item.quantity += quantity;
    await item.save();

    // Record the transaction
    const newTransaction = await Transaction.create({
      item_id,
      project_id,
      quantity, // Quantity returned
      action: "return",
      tenant_id, // Ensure transaction is tenant-scoped
    });

    // Insert into AuditLogs
    await sequelize.query(
      `INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      {
        replacements: [
          "Transactions",
          "INSERT",
          newTransaction.transaction_id,
          req.user.user_id,
          `User with ID ${req.user.user_id} returned ${quantity} of item ID ${item_id} for project ID ${project_id}`,
        ],
      }
    );

    res.status(201).json({
      message: "Transaction completed, Item returned successfully.",
      item_id: item.item_id,
      item_name: item.name,
      quantity_returned: quantity,
      quantity_left: projectInventory.quantity, // Updated item quantity after returning
      transaction_id: newTransaction.transaction_id,
      project_id: project.project_id,
      project_name: project.project_name,
      start_date: project.start_date,
      end_date: project.end_date,
      client_id: project.Client ? project.Client.client_id : null,
      client_company_name: project.Client ? project.Client.company_name : null,
      client_contact_person: project.Client ? project.Client.contact_person : null,
      client_email: project.Client ? project.Client.email : null,
      supervisor_id: project.Supervisor ? project.Supervisor.user_id : null,
      supervisor_first_name: project.Supervisor
        ? project.Supervisor.first_name
        : null,
      supervisor_last_name: project.Supervisor
        ? project.Supervisor.last_name
        : null,
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
