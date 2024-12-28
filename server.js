require('dotenv').config(); // Load environment variables
const express = require('express');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth.route'); 
const userRoutes = require('./routes/user.route.js');
const projectRoutes = require('./routes/project.route.js');
const taskRoutes = require('./routes/task.route.js');

const app = express();
const PORT = process.env.PORT || 4321;
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));



// Routes
app.use('/api/auth', authRoutes); // authentication routes
app.use('/api/users', userRoutes); // general user management routes
app.use('/api/projects', projectRoutes); // project management routes
app.use('/api/tasks', taskRoutes); // task management routes

// Test server response 
app.get('/', (req, res) => {
    res.json({ message: 'hello Jumbly' });
  });

// Test the database connection and sync models
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync database models
    sequelize.sync()
  .then(() => console.log('Database synced'))
  .catch((error) => console.log('Error syncing database:', error));

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();
