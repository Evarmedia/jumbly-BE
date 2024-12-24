-- 1. Users Table
CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT NOT NULL, -- Store hashed passwords
    role_id INTEGER NOT NULL, -- FK for Roles
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    status TEXT CHECK(status IN ('verified', 'unverified')) NOT NULL DEFAULT 'unverified',
    reset_token TEXT,  -- New field for password reset token
    reset_token_expiration DATETIME,  -- New field for token expiration date
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);


-- 2. Roles Table - precreate some
CREATE TABLE Roles (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Clients Table
CREATE TABLE Clients (
    client_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT UNIQUE,
    contact_person TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. UserClients Table - JOIN Table
CREATE TABLE UserClients (
    user_client_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (client_id) REFERENCES Clients(client_id)
);

-- 5. Projects Table
CREATE TABLE Projects (
    project_id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    project_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status_id INTEGER NOT NULL, -- FK for Project Statuses
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES Clients(client_id),
    FOREIGN KEY (status_id) REFERENCES ProjectStatuses(status_id)
);

-- 6. ProjectStatuses Table - precreate some
CREATE TABLE ProjectStatuses (
    status_id INTEGER PRIMARY KEY AUTOINCREMENT,
    status_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tasks Table
CREATE TABLE Tasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    assigned_by INTEGER NOT NULL,
    assigned_to INTEGER,
    task_name TEXT NOT NULL,
    task_description TEXT,
    status_id INTEGER NOT NULL, -- FK for Task Statuses
    priority_id INTEGER NOT NULL, -- FK for Task Priorities
    due_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (assigned_by) REFERENCES Users(user_id),
    FOREIGN KEY (assigned_to) REFERENCES Users(user_id),
    FOREIGN KEY (status_id) REFERENCES TaskStatuses(status_id),
    FOREIGN KEY (priority_id) REFERENCES TaskPriorities(priority_id)
);

-- 8. TaskStatuses Table - precreate some
CREATE TABLE TaskStatuses (
    status_id INTEGER PRIMARY KEY AUTOINCREMENT,
    status_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. TaskPriorities Table - precreate some
CREATE TABLE TaskPriorities (
    priority_id INTEGER PRIMARY KEY AUTOINCREMENT,
    priority_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. TaskCategories Table - precreate some
CREATE TABLE TaskCategories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. TaskCategoryAssignments Table - JOIN Table
CREATE TABLE TaskCategoryAssignments (
    task_category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (category_id) REFERENCES TaskCategories(category_id)
);

-- 12. Schedules Table
CREATE TABLE Schedules (
    schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    supervisor_id INTEGER NOT NULL,
    schedule_date DATE NOT NULL,
    status TEXT CHECK(status IN ('scheduled', 'completed', 'cancelled')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (supervisor_id) REFERENCES Users(user_id)
);

-- 13. ScheduleTasks Table - JOIN Table
CREATE TABLE ScheduleTasks (
    schedule_task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL,
    task_id INTEGER NOT NULL,
    FOREIGN KEY (schedule_id) REFERENCES Schedules(schedule_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id)
);

-- 14. Reports Table
CREATE TABLE Reports (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    submitted_by INTEGER NOT NULL,
    report_content TEXT NOT NULL, -- Use TEXT for structured data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (submitted_by) REFERENCES Users(user_id)
);

-- 15. Issues Table
CREATE TABLE Issues (
    issue_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    reported_by INTEGER NOT NULL,
    issue_description TEXT NOT NULL,
    status TEXT CHECK(status IN ('reported', 'resolved')) NOT NULL DEFAULT 'reported',
    photo_attachment TEXT, -- Store URLs or file references
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (reported_by) REFERENCES Users(user_id)
);

-- 16. Notifications Table
CREATE TABLE Notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    status TEXT CHECK(status IN ('read', 'unread')) NOT NULL DEFAULT 'unread',
    delivered_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- 17. AuditLogs Table
CREATE TABLE AuditLogs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    action TEXT CHECK(action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    record_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    change_details TEXT, -- Use TEXT for flexible change tracking
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Pre Inserting roles into the Roles table
INSERT INTO Roles (role_name, description)
VALUES ('admin', 'Administrator role with full access to the system.');

INSERT INTO Roles (role_name, description)
VALUES ('client', 'Client role with limited access to view data.');

INSERT INTO Roles (role_name, description)
VALUES ('operative', 'Operative role with permissions to manage operations.');

INSERT INTO Roles (role_name, description)
VALUES ('supervisor', 'Supervisor role with permissions to oversee operations and manage users.');

-- Pre Inserting project status
INSERT INTO ProjectStatuses (status_name, description)
VALUES 
('not_completed', 'Project has not been completed'),
('pending', 'Project is pending review or approval'),
('completed', 'Project has been completed successfully');

--pre inserting task statuses
INSERT INTO TaskStatuses (status_name, description)
VALUES 
('not_started', 'Task has not been started'),
('in_progress', 'Task is currently being worked on'),
('completed', 'Task has been completed successfully'),
('on_hold', 'Task is currently on hold'),
('cancelled', 'Task has been cancelled');

--pre inserting task Priorities
INSERT INTO TaskPriorities (priority_name, description)
VALUES 
('low', 'Task has low priority'),
('medium', 'Task has medium priority'),
('high', 'Task has high priority'),
('urgent', 'Task requires immediate attention');

--pre inserting taskCategories
INSERT INTO TaskCategories (category_name, description)
VALUES 
('meetings', 'Tasks related to meetings and appointments'),
('emails', 'Tasks related to responding to emails'),
('projects', 'Tasks related to ongoing projects'),
('administrative', 'Tasks related to administrative tasks'),
('personal', 'Tasks related to personal development and goals');