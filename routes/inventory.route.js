const express = require('express');
const router = express.Router();
const { createItem, getAllItems, getItemDetails, getProjectInventory, updateItemDetails, deleteItem, } = require('../controllers/inventory.controller');
const { checkRole } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Create an item in the main inventory
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the item.
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the item.
 *               description:
 *                 type: string
 *                 description: An optional description of the item.
 *             required:
 *               - name
 *               - quantity
 *     responses:
 *       201:
 *         description: Item created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item created successfully.
 *                 item:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Missing or invalid fields.
 *       500:
 *         description: Server error.
 */
// Route to create a new item in the main inventory
router.post('/', checkRole('admin'), createItem);


/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Retrieve all items in the inventory (tenant-specific)
 *     description: Fetch all items belonging to the authenticated user's tenant with optional filtering, sorting, and pagination.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: The name (or partial name) of the item to search for (case-insensitive).
 *       - in: query
 *         name: min_quantity
 *         schema:
 *           type: integer
 *         required: false
 *         description: Minimum quantity of items to filter by.
 *       - in: query
 *         name: max_quantity
 *         schema:
 *           type: integer
 *         required: false
 *         description: Maximum quantity of items to filter by.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of items per page for pagination.
 *     responses:
 *       200:
 *         description: List of items retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Items retrieved successfully.
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       item_id:
 *                         type: integer
 *                         description: The ID of the item.
 *                       name:
 *                         type: string
 *                         description: The name of the item.
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of the item.
 *                       description:
 *                         type: string
 *                         description: A brief description of the item.
 *                       tenant_id:
 *                         type: integer
 *                         description: The tenant ID the item belongs to.
 *                 page:
 *                   type: integer
 *                   description: Current page number.
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   description: Number of items per page.
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   description: Total number of items matching the criteria.
 *                   example: 20
 *       404:
 *         description: No items found in the inventory.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No items found in your inventory.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error.
 *                 error:
 *                   type: string
 *                   description: Error message.
 */
// Route to get all items in the main inventory
router.get('/', checkRole('admin'), getAllItems);


/**
 * @swagger
 * /api/inventory/{item_id}:
 *   get:
 *     summary: Retrieve details of a specific item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: item_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the item to retrieve.
 *     responses:
 *       200:
 *         description: Item retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item retrieved successfully.
 *                 item:
 *                   $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found.
 *       500:
 *         description: Server error.
 */
// Route to get details of a specific item in the inventory
router.get('/:item_id', checkRole('admin'), getItemDetails);


/**
 * @swagger
 * /api/inventory/{project_id}/project:
 *   get:
 *     summary: Retrieve the list of items in a specific project's inventory
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project whose inventory items are to be retrieved.
 *     responses:
 *       200:
 *         description: Inventory items retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Inventory items retrieved successfully.
 *                 inventory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique ID of the project inventory record.
 *                       project_id:
 *                         type: integer
 *                         description: The ID of the project.
 *                       item:
 *                         $ref: '#/components/schemas/Item'
 *       404:
 *         description: Project not found or no inventory items found.
 *       500:
 *         description: Server error.
 */
// Route to get project-specific inventory items
router.get('/:project_id/project', checkRole('admin', 'supervisor'), getProjectInventory);


/**
 * @swagger
 * /api/inventory/{item_id}:
 *   put:
 *     summary: Update details of an item in the inventory
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: item_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the item to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the item.
 *               quantity:
 *                 type: integer
 *                 description: The updated quantity of the item.
 *               description:
 *                 type: string
 *                 description: The updated description of the item.
 *     responses:
 *       200:
 *         description: Item updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item updated successfully.
 *                 item:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid quantity value.
 *       404:
 *         description: Item not found.
 *       500:
 *         description: Server error.
 */
// Route to update item details in the inventory
router.put('/:item_id', checkRole('admin'), updateItemDetails);


/**
 * @swagger
 * /api/inventory/{item_id}:
 *   delete:
 *     summary: Delete an item from the main inventory
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: item_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the item to delete.
 *     responses:
 *       200:
 *         description: Item deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item deleted successfully.
 *       404:
 *         description: Item not found.
 *       500:
 *         description: Server error.
 */
// Route to delete an item from the main inventory
router.delete('/:item_id', checkRole('admin'), deleteItem);

module.exports = router;
