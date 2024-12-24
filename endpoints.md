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
- `POST api/auth/register` - add new user, Add new staff member (operative or supervisor, client) --use register endpoint here

# Admin-Specific Endpoints
## Staff Management
- `GET api/users/staff` - Retrieve list of staff members(role_name = operative and supervisors) [x]
- `PUT api/users/{user_id}` - Modify staff member roles --use "Update user account details endpoint" here

## Client Management
- `GET /api/users/clients` - List all clients [x]
- `POST api/auth/register` - Create new client --use register endpoint here
- `PUT api/users/{user_id}` - Update client information ----use "Update user account details endpoint" here
- `GET /api/projects/client` - Retrieve client's projects [x]

## System Configuration
- `POST api/admin/roles` - Create new role XX
- `GET api/admin/task-statuses` - Retrieve task status types []
- `POST api/admin/task-categories` - Create new task category []
- `GET api/admin/task-categories` - List task categories []
- `GET api/admin/project-statuses` - Retrieve project status types []

# Supervisor/Client Endpoints
## Project Management
- `POST api/projects` - Create new Project []
- `GET api/projects` - List Project []
- `GET api/projects/{project_id}` - Retrieve specific projects details []
- `GET api/projects/{project_id}/tasks` - List project tasks []
- `PUT api/projects/{project_id}` - Update projects details []
- `PATCH api/projects/{project_id}/status` - Change projects status []
- `PATCH api/tasks/{project_id}/assign` - Reassign task to operative []

## Task Management
- `POST /tasks` - Create new task []
- `GET /tasks` - List tasks []
- `GET /tasks/{task_id}` - Retrieve specific task details []
- `PUT /tasks/{task_id}` - Update task details []
- `PATCH /tasks/{task_id}/status` - Change task status []
- `PATCH /tasks/{task_id}/assign` - Reassign task to operative []

## Scheduling
- `POST /schedules` - Create new schedule []
- `GET /schedules` - List all schedules []
- `GET /schedules/{schedule_id}` - Retrieve specific schedule []
- `PUT /schedules/{schedule_id}` - Update schedule details []

## Reporting
- `POST /reports` - Create new report []
- `GET /reports` - List generated reports []
- `GET /analytics` - Retrieve performance analytics XX

# Operative/Client Endpoints
## Task Management
- `GET /operative/tasks` - List assigned tasks []
- `GET /tasks/{task_id}` -- use Retrieve specific task details
- `PATCH /tasks/{task_id}/status` -- use Change task status

## Issue Reporting
- `POST /issues` - Report new issue []
- `GET /issues/{task_id}` - Retrieve specific issue details for a given task []
### For ADMIN/supervisor
- `GET /issues` - List reported issues []

# Client Endpoints
## Project Oversight
- `GET /client/projects` - List client's projects []
- `GET /projects/{project_id}/reports` - Retrieve project reports []
- `GET /projects/{project_id}/tasks` -- use List project tasks
- `GET /projects/{project_id}` -- use Retrieve specific projects details

# Cross-Role Endpoints
## Notifications
- `GET /notifications` - Retrieve user notifications []
- `PATCH /notifications/{notificationId}/status` - Mark notification as read/unread []

## Integration & Sync
- `POST /sync/calendar` - Sync schedules with external calendars
- `POST /sync/offline-data` - Synchronize offline-entered data

# Audit & Compliance
- `GET /audit-logs` - Retrieve system audit logs
- `GET /system/compliance-status` - Check data protection compliance

# Support & Maintenance
- `GET /system/updates` - Check for system updates
- `GET /support/resources` - Access support documentation
