const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const { borrowItem, returnItem, getAllTransactions, getTransactionDetails, } = require('../controllers/transaction.controller');

/**
 * @swagger
 * /api/transactions/borrow:
 *   post:
 *     summary: Borrow an item from the main inventory to a project's inventory
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item_id:
 *                 type: integer
 *                 description: The ID of the item to borrow.
 *               project_id:
 *                 type: integer
 *                 description: The ID of the project to which the item is allocated.
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the item to borrow.
 *             required:
 *               - item_id
 *               - project_id
 *               - quantity
 *     responses:
 *       201:
 *         description: Item borrowed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item borrowed successfully.
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Missing or invalid fields, or insufficient quantity.
 *       404:
 *         description: Item not found.
 *       500:
 *         description: Server error.
 */
// Route to borrow an item from the main inventory to a project's inventory
router.post('/borrow', authMiddleware, borrowItem);


/**
 * @swagger
 * /api/transactions/return:
 *   post:
 *     summary: Return an item from a project's inventory to the main inventory
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item_id:
 *                 type: integer
 *                 description: The ID of the item to return.
 *               project_id:
 *                 type: integer
 *                 description: The ID of the project returning the item.
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the item to return.
 *             required:
 *               - item_id
 *               - project_id
 *               - quantity
 *     responses:
 *       201:
 *         description: Item returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item returned successfully.
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Missing or invalid fields, or quantity exceeds borrowed amount.
 *       404:
 *         description: Item not found in the project's inventory or main inventory.
 *       500:
 *         description: Server error.
 */
// Route to return an item from a project's inventory to the main inventory
router.post('/return', authMiddleware, returnItem);


/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Retrieve a list of all transactions (borrow/return logs)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transactions retrieved successfully.
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: No transactions found.
 *       500:
 *         description: Server error.
 */
// Route to retrieve all transactions
router.get('/', authMiddleware, getAllTransactions);


/**
 * @swagger
 * /api/transactions/{transaction_id}:
 *   get:
 *     summary: Retrieve details of a specific transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: transaction_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the transaction to retrieve.
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transaction details retrieved successfully.
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found.
 *       500:
 *         description: Server error.
 */
// Route to retrieve details of a specific transaction
router.get('/:transaction_id', authMiddleware, getTransactionDetails);

module.exports = router;
