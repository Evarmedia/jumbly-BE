# Authentication & User Management
- `POST api/auth/register` - Create new user account [x]
- `POST api/auth/login` - Authenticate user credentials [x]
- `POST api/auth/verify-email` - Initiate password reset process [x]
- `POST api/auth/delete/{user_id}` - Delete user/client [x]
- `POST api/auth/forgot-password` - Initiate password forgot process [x]
- `POST api/auth/reset-password` - Initiate password reset process [x]
    ## User Management
- `GET api/users/profile` - Retrieve authenticated user's profile [x]
- `PUT api/users/{user_id}` - Update user account details [x]
- `GET api/users/roles` - List available user roles  [x]
- `POST api/user/add` - add new user, Add new staff member (operative or supervisor, client)

# Admin-Specific Endpoints
## Staff Management
- `GET /admin/staff` - Retrieve list of staff members(operative and supervisors) []
- `PATCH /admin/staff/{userId}/roles` - Modify staff member roles

## Client Management
- `GET /admin/clients` - List all clients
- `POST api/auth/register` - Create new client
- `PUT /admin/clients/{client_id}` - Update client information
- `GET /admin/clients/{client_id}/projects` - Retrieve client's projects

## System Configuration
- `POST /admin/roles` - Create new role
- `GET /admin/task-statuses` - Retrieve task status types
- `GET /admin/task-categories` - List task categories
- `POST /admin/task-categories` - Create new task category
- `GET /admin/project-statuses` - Retrieve project status types

# Supervisor Endpoints
## Task Management
- `GET /supervisor/tasks` - List assigned tasks
- `POST /supervisor/tasks` - Create new task
- `PUT /supervisor/tasks/{task_id}` - Update task details
- `PATCH /supervisor/tasks/{task_id}/status` - Change task status
- `PATCH /supervisor/tasks/{task_id}/assign` - Reassign task to operative

## Scheduling
- `GET /supervisor/schedules` - List all schedules
- `POST /supervisor/schedules` - Create new schedule
- `GET /supervisor/schedules/{schedule_id}` - Retrieve specific schedule
- `PUT /supervisor/schedules/{schedule_id}` - Update schedule details

## Reporting
- `GET /supervisor/reports` - List generated reports
- `POST /supervisor/reports` - Create new report
- `GET /supervisor/analytics` - Retrieve performance analytics

# Operative Endpoints
## Task Management
- `GET /operative/tasks` - List assigned tasks
- `GET /operative/tasks/{task_id}` - Retrieve specific task details
- `PATCH /operative/tasks/{task_id}/status` - Update task completion status

## Issue Reporting
- `POST /operative/issues` - Report new issue
- `GET /operative/issues` - List reported issues
- `GET /operative/issues/{issue_id}` - Retrieve specific issue details

# Client Endpoints
## Project Oversight
- `GET /client/projects` - List client's projects
- `GET /client/projects/{project_id}` - Retrieve project details
- `GET /client/projects/{project_id}/tasks` - List project tasks
- `GET /client/projects/{project_id}/reports` - Retrieve project reports

## Inspections & Feedback
- `POST /client/inspections` - Submit project inspection
- `GET /client/inspections` - List past inspections
- `POST /client/feedback` - Submit service feedback

# Cross-Role Endpoints
## Notifications
- `GET /notifications` - Retrieve user notifications
- `PATCH /notifications/{notificationId}/status` - Mark notification as read/unread

## Integration & Sync
- `POST /sync/calendar` - Sync schedules with external calendars
- `POST /sync/offline-data` - Synchronize offline-entered data

# Audit & Compliance
- `GET /audit-logs` - Retrieve system audit logs
- `GET /system/compliance-status` - Check data protection compliance

# Support & Maintenance
- `GET /system/updates` - Check for system updates
- `GET /support/resources` - Access support documentation
