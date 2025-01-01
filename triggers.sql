-- Step 1: Add all table names to AuditLogs
INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details)
VALUES 
    ('Users', 'INSERT', 0, 0, 'Initial Table Registered'),
    ('Roles', 'INSERT', 0, 0, 'Initial Table Registered'),
    ('Clients', 'INSERT', 0, 0, 'Initial Table Registered'),
    ('UserClients', 'INSERT', 0, 0, 'Initial Table Registered'),
    ('Projects', 'INSERT', 0, 0, 'Initial Table Registered'),
    ('ProjectStatuses', 'INSERT', 0, 0, 'Initial Table Registered'),
    ('Tasks', 'INSERT', 0, 0, 'Initial Table Registered'),
    ('TaskStatuses', 'INSERT', 0, 0, 'Initial Table Registered'),
    ('TaskPriorities', 'INSERT', 0, 0, 'Initial Table Registered'),
    ('TaskCategories', 'INSERT', 0, 0, 'Initial Table Registered'),
    ('Schedules', 'INSERT', 0, 0, 'Initial Table Registered'),
    ('Reports', 'INSERT', 0, 0, 'Initial Table Registered'),
    ('Issues', 'INSERT', 0, 0, 'Initial Table Registered'),
    ('Notifications', 'INSERT', 0, 0, 'Initial Table Registered');

-- Step 2: Create reusable triggers for each table

-- Audit Logging Trigger Template

-- Users Table log Trigger
CREATE TRIGGER AuditLog_Users_Insert
AFTER INSERT ON Users
FOR EACH ROW
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details)
    VALUES ('Users', 'INSERT', NEW.user_id, NEW.user_id, 'User created with email ' || NEW.email);
END;

CREATE TRIGGER AuditLog_Users_Update
AFTER UPDATE ON Users
FOR EACH ROW
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details)
    VALUES ('Users', 'UPDATE', NEW.user_id, NEW.user_id, 'User updated: ' || OLD.email || ' -> ' || NEW.email);
END;

CREATE TRIGGER AuditLog_Users_Delete
AFTER DELETE ON Users
FOR EACH ROW
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details)
    VALUES ('Users', 'DELETE', OLD.user_id, OLD.user_id, 'User deleted with email ' || OLD.email);
END;

-- Triggers for Roles Table
CREATE TRIGGER AuditLog_Roles_Insert
AFTER INSERT ON Roles
FOR EACH ROW
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details)
    VALUES ('Roles', 'INSERT', NEW.role_id, 0, 'Role created: ' || NEW.role_name);
END;

CREATE TRIGGER AuditLog_Roles_Update
AFTER UPDATE ON Roles
FOR EACH ROW
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details)
    VALUES ('Roles', 'UPDATE', NEW.role_id, 0, 'Role updated: ' || OLD.role_name || ' -> ' || NEW.role_name);
END;

CREATE TRIGGER AuditLog_Roles_Delete
AFTER DELETE ON Roles
FOR EACH ROW
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details)
    VALUES ('Roles', 'DELETE', OLD.role_id, 0, 'Role deleted: ' || OLD.role_name);
END;


-- Trigger for Clients Table
CREATE TRIGGER after_insert_clients
AFTER INSERT ON Clients
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Clients', 'INSERT', NEW.client_id, @current_user_id, 'Inserted record in Clients table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_update_clients
AFTER UPDATE ON Clients
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Clients', 'UPDATE', NEW.client_id, @current_user_id, 'Updated record in Clients table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_delete_clients
AFTER DELETE ON Clients
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Clients', 'DELETE', OLD.client_id, @current_user_id, 'Deleted record from Clients table', CURRENT_TIMESTAMP);
END;

-- Trigger for UserClients Table
CREATE TRIGGER after_insert_userclients
AFTER INSERT ON UserClients
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('UserClients', 'INSERT', NEW.user_client_id, @current_user_id, 'Inserted record in UserClients table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_update_userclients
AFTER UPDATE ON UserClients
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('UserClients', 'UPDATE', NEW.user_client_id, @current_user_id, 'Updated record in UserClients table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_delete_userclients
AFTER DELETE ON UserClients
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('UserClients', 'DELETE', OLD.user_client_id, @current_user_id, 'Deleted record from UserClients table', CURRENT_TIMESTAMP);
END;

-- Trigger for Projects Table
CREATE TRIGGER after_insert_projects
AFTER INSERT ON Projects
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Projects', 'INSERT', NEW.project_id, @current_user_id, 'Inserted record in Projects table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_update_projects
AFTER UPDATE ON Projects
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Projects', 'UPDATE', NEW.project_id, @current_user_id, 'Updated record in Projects table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_delete_projects
AFTER DELETE ON Projects
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Projects', 'DELETE', OLD.project_id, @current_user_id, 'Deleted record from Projects table', CURRENT_TIMESTAMP);
END;

-- Trigger for ProjectStatuses Table
CREATE TRIGGER after_insert_projectstatuses
AFTER INSERT ON ProjectStatuses
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('ProjectStatuses', 'INSERT', NEW.project_status_id, @current_user_id, 'Inserted record in ProjectStatuses table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_update_projectstatuses
AFTER UPDATE ON ProjectStatuses
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('ProjectStatuses', 'UPDATE', NEW.project_status_id, @current_user_id, 'Updated record in ProjectStatuses table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_delete_projectstatuses
AFTER DELETE ON ProjectStatuses
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('ProjectStatuses', 'DELETE', OLD.project_status_id, @current_user_id, 'Deleted record from ProjectStatuses table', CURRENT_TIMESTAMP);
END;

-- Trigger for Tasks Table
CREATE TRIGGER after_insert_tasks
AFTER INSERT ON Tasks
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Tasks', 'INSERT', NEW.task_id, @current_user_id, 'Inserted record in Tasks table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_update_tasks
AFTER UPDATE ON Tasks
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Tasks', 'UPDATE', NEW.task_id, @current_user_id, 'Updated record in Tasks table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_delete_tasks
AFTER DELETE ON Tasks
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Tasks', 'DELETE', OLD.task_id, @current_user_id, 'Deleted record from Tasks table', CURRENT_TIMESTAMP);
END;

-- Trigger for TaskStatuses Table
CREATE TRIGGER after_insert_taskstatuses
AFTER INSERT ON TaskStatuses
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('TaskStatuses', 'INSERT', NEW.task_status_id, @current_user_id, 'Inserted record in TaskStatuses table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_update_taskstatuses
AFTER UPDATE ON TaskStatuses
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('TaskStatuses', 'UPDATE', NEW.task_status_id, @current_user_id, 'Updated record in TaskStatuses table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_delete_taskstatuses
AFTER DELETE ON TaskStatuses
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('TaskStatuses', 'DELETE', OLD.task_status_id, @current_user_id, 'Deleted record from TaskStatuses table', CURRENT_TIMESTAMP);
END;

-- Trigger for Schedules Table
CREATE TRIGGER after_insert_schedules
AFTER INSERT ON Schedules
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Schedules', 'INSERT', NEW.schedule_id, @current_user_id, 'Inserted record in Schedules table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_update_schedules
AFTER UPDATE ON Schedules
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Schedules', 'UPDATE', NEW.schedule_id, @current_user_id, 'Updated record in Schedules table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_delete_schedules
AFTER DELETE ON Schedules
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Schedules', 'DELETE', OLD.schedule_id, @current_user_id, 'Deleted record from Schedules table', CURRENT_TIMESTAMP);
END;

-- Trigger for Reports Table
CREATE TRIGGER after_insert_reports
AFTER INSERT ON Reports
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Reports', 'INSERT', NEW.report_id, @current_user_id, 'Inserted record in Reports table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_update_reports
AFTER UPDATE ON Reports
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Reports', 'UPDATE', NEW.report_id, @current_user_id, 'Updated record in Reports table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_delete_reports
AFTER DELETE ON Reports
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Reports', 'DELETE', OLD.report_id, @current_user_id, 'Deleted record from Reports table', CURRENT_TIMESTAMP);
END;

-- Trigger for Issues Table
CREATE TRIGGER after_insert_issues
AFTER INSERT ON Issues
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Issues', 'INSERT', NEW.issue_id, @current_user_id, 'Inserted record in Issues table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_update_issues
AFTER UPDATE ON Issues
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Issues', 'UPDATE', NEW.issue_id, @current_user_id, 'Updated record in Issues table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_delete_issues
AFTER DELETE ON Issues
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Issues', 'DELETE', OLD.issue_id, @current_user_id, 'Deleted record from Issues table', CURRENT_TIMESTAMP);
END;

-- Trigger for Notifications Table
CREATE TRIGGER after_insert_notifications
AFTER INSERT ON Notifications
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Notifications', 'INSERT', NEW.notification_id, @current_user_id, 'Inserted record in Notifications table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_update_notifications
AFTER UPDATE ON Notifications
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Notifications', 'UPDATE', NEW.notification_id, @current_user_id, 'Updated record in Notifications table', CURRENT_TIMESTAMP);
END;

CREATE TRIGGER after_delete_notifications
AFTER DELETE ON Notifications
BEGIN
    INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
    VALUES ('Notifications', 'DELETE', OLD.notification_id, @current_user_id, 'Deleted record from Notifications table', CURRENT_TIMESTAMP);
END;

