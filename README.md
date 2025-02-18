
# Jumbly Backend

Jumbly Backend is the server-side application powering the Jumbly platform. It is designed to handle robust facility management, inventory operations, task management, scheduling, reporting, and more. The backend is built with Node.js and Express, utilizing Sequelize ORM with SQLite3 as the default database. It also includes comprehensive API documentation, PDF generation, and a queue system for asynchronous tasks.

---

## Features

- User Authentication and Role Management
- Facility Task Scheduling and Management
- Inventory Management with Transaction Logs
- Automated and Manual Report Generation in PDF Format
- Asynchronous Task Processing with Bull and Redis
- API Documentation with Swagger
- Email Notifications with Nodemailer
- Scalable and Modular Design

---

## Dependencies

To install the necessary dependencies for Jumbly Backend, use the following commands:

### Core Dependencies used

```bash
npm install express sequelize sqlite3
npm install sequelize-cli
npm install bcryptjs
npm install jsonwebtoken
npm install cors
npm install dotenv --save
npm install express-validator
npm install eslint --save-dev
npm install nodemailer
npm install ioredis
npm install swagger-ui-express swagger-jsdoc
npm install pdfkit node-cron bull redis
npm install multer --save  # For file uploads
npm install cookie-parser
```

### Optional Dependencies (for advanced features)

```bash
npm install morgan
npm install sequelize-paginate
npm install node-schedule
npm install redis
npm install jest --save-dev
```

---

## Technologies Used

- **Node.js + Express**: Backend framework for building scalable APIs.
- **SQLite3**: Lightweight relational database for development and local testing.
- **Sequelize**: ORM for managing database interactions.
- **Swagger**: For API documentation and testing.
- **Redis**: In-memory data structure store for queues and caching.
- **Bull**: Queue management for asynchronous tasks.
- **PDFKit**: PDF generation for reports.

---

## Features Overview

### 1. **Authentication**
- Implements JWT-based authentication.
- Role-based access control for Admin, Supervisor, operative, and Client roles.

### 2. **Task Management**
- Create, assign, update, and manage tasks for various projects.
- Flexible task statuses, priorities, and categories.

### 3. **Inventory Management**
- Borrow and return items between the main inventory and project inventory.
- Automatically log inventory changes with triggers.
- Inventory reconciliation with transaction logs.

### 4. **Scheduling**
- Project-based scheduling for supervisors and tasks.
- Automated validations for overlapping schedules.

### 5. **Reporting**
- Automated PDF report generation on project completion.
- Manual report generation endpoint for specific projects.
- Downloadable reports stored securely.

### 6. **Notifications**
- Real-time notifications for task assignments and updates.
- Configurable notification types and priorities.

### 7. **API Documentation**
- Comprehensive Swagger documentation for all API endpoints.
- Accessible at `/api-docs`.

---

## Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Evarmedia/jumbly-BE
   cd jumbly-BE
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Setup Environment Variables**:
   Create a `.env` file in the root directory with the following:
   ```env
    PORT=4321
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRATION=1h
    EMAIL_HOST=your_smtp_host
    EMAIL_PORT=465
    EMAIL_USER=your_email_username
    EMAIL_PASS=your_email_password
    EMAIL_FROM=your_email@example.com
    FRONTEND_URL=http://frontendurl.com
   ```

4. **Run Migrations**:
   ```bash
   npx sequelize-cli db:migrate
   ```

5. **Start the Server**:
   ```bash
   npm run dev
   ```

---

## Testing

- **Unit Testing**:
  ```bash
  npm test
  ```

- **Swagger Documentation**:
  Visit `http://localhost:4321/api-docs` to access and test the API.

---

## Contribution

Contributions are welcome! Please fork the repository and create a pull request for any features, bug fixes, or documentation updates.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
