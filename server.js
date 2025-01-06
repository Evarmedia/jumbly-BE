require("dotenv").config(); // Load environment variables
const express = require("express");
const sequelize = require("./config/db");
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route.js");
const projectRoutes = require("./routes/project.route.js");
const taskRoutes = require("./routes/task.route.js");
const sysconfigRoutes = require("./routes/sysconfig.route.js");
const scheduleRoutes = require("./routes/schedule.route.js");
const reportRoutes = require("./routes/report.route.js");
const notificationRoutes = require("./routes/notification.route.js");
const syncRoute = require("./routes/sync.route.js");
const inventoryRoutes = require("./routes/inventory.route.js");
const transactionRoutes = require("./routes/transaction.route.js");
const { Project } = require("./models/models.js");

const cron = require("node-cron");
const reportQueue = require("./queues/reportQueue.js");

const app = express();
const PORT = process.env.PORT || 4321;
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const specs = require("./swagger");
const authMiddleware = require("./middleware/authMiddleware.js");
const cookieParser = require('cookie-parser');

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/api/auth", authRoutes); // authentication routes
app.use("/api/users", authMiddleware, userRoutes); // general users management routes
app.use("/api/projects", authMiddleware, projectRoutes); // projects management routes
app.use("/api/tasks", authMiddleware, taskRoutes); // tasks management routes
app.use("/api/admin", authMiddleware, sysconfigRoutes); // admin/system configuration management routes
app.use("/api/schedules", authMiddleware, scheduleRoutes); // schedules management routes
app.use("/api/reports", reportRoutes); // schedules management routes
app.use("/api/notifications", authMiddleware, notificationRoutes); // Notification routes
app.use("/api/sync", syncRoute); // sync route
app.use("/api/inventory", authMiddleware, inventoryRoutes); // sync route
app.use("/api/transactions", authMiddleware, transactionRoutes); // sync route

console.log(`App running in ${process.env.NODE_ENV} mode.`);

// Logs
// GET /api/log: Retrieve logs
app.get("/api/logs", async (req, res) => {
  try {
    const [log] = await sequelize.query(`SELECT * FROM AuditLogs`);
    res.status(200).json({ log });
  } catch (error) {
    console.error("Database retrieval failed:", error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// inventory logs
app.get("/api/inventory-logs", async (req, res) => {
  try {
    const [logs] = await sequelize.query(`
      SELECT 
        log_id,
        item_id,
        change_type,
        quantity_change,
        change_timestamp
      FROM 
        InventoryLog
      ORDER BY 
        change_timestamp DESC;
    `);

    if (!logs.length) {
      return res.status(404).json({ message: "No inventory logs found." });
    }

    res.status(200).json({
      message: "Inventory logs retrieved successfully.",
      logs,
    });
  } catch (error) {
    console.error("Error fetching inventory logs:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Test server response
app.get("/", (req, res) => {
  res.json({ message: "hello Jumbly" });
});

// Test the database connection and sync models
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Sync database models
    sequelize
      .sync()
      .then(() => console.log("Database synced"))
      .catch((error) => console.log("Error syncing database:", error));

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Browse API docs at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

// Schedule a weekly task to generate reports
cron.schedule("0 0 * * 0", async () => {
  console.log("Running weekly report generation task.");

  const projects = await Project.findAll({}); // Fetch all projects
  projects.forEach((project) => {
    reportQueue.add({
      project_id: project.project_id,
      client_id: project.client_id,
    });
  });
});
