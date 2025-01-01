-- 1. Users Table
CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL,       -- Foreign key for role
    email TEXT UNIQUE NOT NULL,     -- Common to all roles, required
    password TEXT NOT NULL,         -- Common to all roles, required
    first_name TEXT,                -- Common to all roles
    last_name TEXT,                 -- Common to all roles
    address TEXT,                   -- Common to Supervisor, Operator, Admin, Client
    gender TEXT,                    -- Common to Supervisor, Operator, Admin, Client
    phone TEXT,                     -- Common to all roles
    photo TEXT,                     -- Common to Supervisor, Operator, Admin, Client
    education TEXT,                 -- Unique to Supervisor, Operator
    birthdate DATE,                 -- Unique to Supervisor, Operator
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
    email TEXT UNIQUE,              -- Inherited from registration endpoint
    website TEXT,                   -- Client-specific
    company_name TEXT,              -- Client-specific
    industry TEXT,                  -- Description of the industry
    official_email TEXT,            -- Client-specific
    contact_person TEXT,            -- Client-specific
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
    supervisor_id INTEGER,      -- FK for Supervisors (Users table)
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES Clients(client_id),
    FOREIGN KEY (status_id) REFERENCES ProjectStatuses(status_id),
    FOREIGN KEY (supervisor_id) REFERENCES Users(user_id) -- Supervisor assignment
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
    assigned_by INTEGER,
    assigned_to INTEGER,
    task_name TEXT NOT NULL,
    task_description TEXT,
    status_id INTEGER NOT NULL, -- FK for Task Statuses
    priority_id INTEGER NOT NULL, -- FK for Task Priorities
    category_id INTEGER NOT NULL, -- FK for Task Categories
    due_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE,
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
-- CREATE TABLE TaskCategoryAssignments (
--     task_category_id INTEGER PRIMARY KEY AUTOINCREMENT,
--     task_id INTEGER NOT NULL,
--     category_id INTEGER NOT NULL,
--     FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
--     FOREIGN KEY (category_id) REFERENCES TaskCategories(category_id)
-- );

-- 12. Schedules Table
CREATE TABLE Schedules (
    schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    supervisor_id INTEGER NOT NULL,
    schedule_date DATE NOT NULL,
    status TEXT CHECK(status IN ('scheduled', 'completed', 'cancelled')) NOT NULL DEFAULT 'scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES Users(user_id)
);

-- 13. ScheduleTasks Table - JOIN Table
-- CREATE TABLE ScheduleTasks (
--     schedule_task_id INTEGER PRIMARY KEY AUTOINCREMENT,
--     schedule_id INTEGER NOT NULL,
--     task_id INTEGER NOT NULL,
--     FOREIGN KEY (schedule_id) REFERENCES Schedules(schedule_id),
--     FOREIGN KEY (task_id) REFERENCES Tasks(task_id)
-- );

-- 14. Reports Table
CREATE TABLE Reports (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    submitted_by INTEGER, -- ID of the user who generated the report (NULL for automated reports)
    location TEXT, -- Filepath or URL where the report is stored
    report_content TEXT NOT NULL, -- JSON or raw data for the report
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES Users(user_id)
);

-- 15. Issues Table
CREATE TABLE Issues (
    issue_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    reported_by INTEGER NOT NULL,
    issue_description TEXT  ,
    status TEXT CHECK(status IN ('reported', 'resolved')) NOT NULL DEFAULT 'reported',
    photo_attachment TEXT, -- Store URLs or file references
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES Users(user_id)
);

-- 16. Notifications Table
CREATE TABLE Notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,           -- The recipient of the notification
    message TEXT NOT NULL,              -- Notification content
    type TEXT,                          -- Notification type (e.g., 'task', 'system')
    status TEXT CHECK(status IN ('read', 'unread')) NOT NULL DEFAULT 'unread',
    priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'low',
    delivered_at DATETIME,              -- Timestamp for when the notification was delivered
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
*
-- 17. AuditLogs Table --Create Trigger for log
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
VALUES ('supervisor', 'Supervisor role with permissions to oversee operations and manage users.');

INSERT INTO Roles (role_name, description)
VALUES ('operator', 'Operator role with permissions to manage operations.');

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

CREATE TRIGGER update_updated_at
AFTER UPDATE ON Projects
FOR EACH ROW
BEGIN
    UPDATE Projects
    SET updated_at = CURRENT_TIMESTAMP
    WHERE project_id = OLD.project_id;
END;
