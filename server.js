require('dotenv').config(); // Load environment variables
const express = require('express');
const sequelize = require('./config/db'); // Import the Sequelize instance
const authRoutes = require('./routes/auth.route'); 
const userRoutes = require('./routes/user.route.js');

const app = express();
const PORT = process.env.PORT || 4321;
const cors = require('cors');

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes); // authentication routes
app.use('/api/users', userRoutes); // general user management routes

// Test server response 
app.get('/', (req, res) => {
    res.json({ message: 'hello Jumbly' });
  });

// Test the database connection and sync models
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync database models (you can set { alter: true } or { force: true } in development)
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
