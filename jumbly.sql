.headers on

CREATE TABLE Tenants (
    tenant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_name TEXT UNIQUE, --notnull
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create the new `TenantRoles` table
CREATE TABLE TenantRoles (
    tenant_role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE
);

-- 1. Users Table
CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,    -- Foreign key for tenant
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
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id)
);

-- 2. Roles Table - precreate some
CREATE TABLE Roles (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Clients Table
CREATE TABLE Clients (
    client_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,    -- Foreign key for tenant
    email TEXT UNIQUE,              -- Inherited from registration endpoint
    website TEXT,                   -- Client-specific
    company_name TEXT,              -- Client-specific
    industry TEXT,                  -- Description of the industry
    official_email TEXT,            -- Client-specific
    contact_person TEXT,            -- Client-specific
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id)
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
    tenant_id INTEGER NOT NULL,    -- Foreign key for tenant
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
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id)
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

-- 13. Reports Table
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

-- 14. Issues Table
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

-- 15. Notifications Table
CREATE TABLE Notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,    -- Foreign key for tenant
    user_id INTEGER NOT NULL,           -- The recipient of the notification
    message TEXT NOT NULL,              -- Notification content
    type TEXT,                          -- Notification type (e.g., 'task', 'system')
    status TEXT CHECK(status IN ('read', 'unread')) NOT NULL DEFAULT 'unread',
    priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'low',
    delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP,              -- Timestamp for when the notification was delivered
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- 16. AuditLogs Table --Create Trigger for log
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


--17 Create Items Table
CREATE TABLE Items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,    -- Foreign key for tenant
    name TEXT UNIQUE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    description TEXT,
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id)
);

--18 Create ProjectInventory Table
CREATE TABLE ProjectInventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,    -- Foreign key for tenant
    project_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE
);

--19 Create Transactions Table
CREATE TABLE Transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    action TEXT NOT NULL CHECK (action IN ('borrow', 'return')),
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE
);

--20 Create InventoryLog Table
CREATE TABLE InventoryLog (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('insert', 'update', 'delete')),
    quantity_change INTEGER NOT NULL,
    change_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE
);

-- Before delete
CREATE TRIGGER BeforeDeleteProject
BEFORE DELETE ON Projects
FOR EACH ROW
BEGIN
    -- Safely return all items from the project's inventory to the main inventory
    UPDATE Items
    SET quantity = quantity + COALESCE((
        SELECT SUM(quantity)
        FROM ProjectInventory
        WHERE project_id = OLD.project_id
    ), 0)
    WHERE item_id IN (
        SELECT item_id
        FROM ProjectInventory
        WHERE project_id = OLD.project_id
    );

    -- Explicitly delete the project's inventory if not using ON DELETE CASCADE
    DELETE FROM ProjectInventory WHERE project_id = OLD.project_id;
END;

-- Trigger: Log All Inventory Changes
-- Log additions
CREATE TRIGGER LogInventoryInsert
AFTER INSERT ON Items
FOR EACH ROW
BEGIN
    INSERT INTO InventoryLog (item_id, change_type, quantity_change, change_timestamp)
    VALUES (NEW.item_id, 'insert', NEW.quantity, CURRENT_TIMESTAMP);
END;

-- Log updates
CREATE TRIGGER LogInventoryUpdate
AFTER UPDATE ON Items
FOR EACH ROW
BEGIN
    INSERT INTO InventoryLog (item_id, change_type, quantity_change, change_timestamp)
    VALUES (NEW.item_id, 'update', NEW.quantity - COALESCE(OLD.quantity, 0), CURRENT_TIMESTAMP);
END;

-- Log deletions
CREATE TRIGGER LogInventoryDelete
BEFORE DELETE ON Items
FOR EACH ROW
BEGIN
    INSERT INTO InventoryLog (item_id, change_type, quantity_change, change_timestamp)
    VALUES (OLD.item_id, 'delete', -OLD.quantity, CURRENT_TIMESTAMP);
END;

-- Trigger: to update updated_at to current datetime
CREATE TRIGGER update_updated_at
AFTER UPDATE ON Projects
FOR EACH ROW
BEGIN
    UPDATE Projects
    SET updated_at = CURRENT_TIMESTAMP
    WHERE project_id = OLD.project_id;
END;


-- Indexes for Users Table
CREATE INDEX idx_users_role_id ON Users(role_id);
CREATE INDEX idx_users_status ON Users(status);
CREATE INDEX idx_users_email ON Users(email);


-- Indexes for Clients Table
-- CREATE INDEX idx_clients_email ON Clients(email);
-- CREATE INDEX idx_clients_company_name ON Clients(company_name);
-- CREATE INDEX idx_clients_industry ON Clients(industry);

-- Indexes for UserClients Table
CREATE INDEX idx_user_clients_user_id ON UserClients(user_id);
CREATE INDEX idx_user_clients_client_id ON UserClients(client_id);

-- Indexes for Projects Table
CREATE INDEX idx_projects_client_id ON Projects(client_id);
CREATE INDEX idx_projects_supervisor_id ON Projects(supervisor_id);
CREATE INDEX idx_projects_status_id ON Projects(status_id);

-- Indexes for Tasks Table
CREATE INDEX idx_tasks_project_id ON Tasks(project_id);
CREATE INDEX idx_tasks_assigned_by ON Tasks(assigned_by);
CREATE INDEX idx_tasks_assigned_to ON Tasks(assigned_to);
CREATE INDEX idx_tasks_status_id ON Tasks(status_id);
CREATE INDEX idx_tasks_priority_id ON Tasks(priority_id);
CREATE INDEX idx_tasks_category_id ON Tasks(category_id);


-- Indexes for Schedules Table
CREATE INDEX idx_schedules_project_id ON Schedules(project_id);
CREATE INDEX idx_schedules_supervisor_id ON Schedules(supervisor_id);

-- Indexes for Reports Table
CREATE INDEX idx_reports_project_id ON Reports(project_id);
-- CREATE INDEX idx_reports_submitted_by ON Reports(submitted_by);

-- Indexes for Issues Table
CREATE INDEX idx_issues_task_id ON Issues(task_id);
CREATE INDEX idx_issues_reported_by ON Issues(reported_by);

-- Indexes for Notifications Table
CREATE INDEX idx_notifications_user_id ON Notifications(user_id);

-- Indexes for AuditLogs Table
CREATE INDEX idx_auditlogs_user_id ON AuditLogs(user_id);
CREATE INDEX idx_auditlogs_table_name ON AuditLogs(table_name);
CREATE INDEX idx_auditlogs_action ON AuditLogs(action);


Pre Inserting roles into the Roles table
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
