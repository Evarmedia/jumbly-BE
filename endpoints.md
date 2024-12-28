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
- `POST api/projects` - Create new Project autenticated client[x]
- `POST api/projects/admin` - Create new Project admin [x]
- `GET api/projects` - List all Projects [x]
- `GET api/projects/{project_id}` - Retrieve specific projects details [x]
- `PUT api/projects/{project_id}` - Update projects details [x]
- `PATCH api/projects/{project_id}/status` - Change projects status [x]
- `PATCH api/projects/{project_id}/assign` - Reassign project to supervisor [] XX
- `DELETE api/projects/{project_id}/` - Delete a project [x]

## Task Management
- `POST api/tasks` - Create new task []
- `GET api/tasks` - List tasks []
- `GET api/tasks/projects/{project_id}/` - List project tasks [x]
- `GET api/tasks/{task_id}` - Retrieve specific task details []
- `PUT api/tasks/{task_id}` - Update task details []
- `PATCH api/tasks/{task_id}/status` - Change task status []
- `PATCH api/tasks/{task_id}/assign` - Reassign task to operative []
- `DELETE api/tasks/{project_id}/` - Delete a task

## Scheduling
- `POST api/schedules` - Create new schedule []
- `GET api/schedules` - List all schedules []
- `GET api/schedules/{schedule_id}` - Retrieve specific schedule []
- `PUT api/schedules/{schedule_id}` - Update schedule details []

## Inventory Management:

## Reporting
- `POST api/reports` - Create new report []
- `GET api/reports` - List generated reports []
- `GET api/analytics` - Retrieve performance analytics XX

# Operative/Client Endpoints
## Task Management
- `GET api/operative/tasks` - List assigned tasks []
- `GET api/tasks/{task_id}` -- use Retrieve specific task details
- `PATCH api/tasks/{task_id}/status` -- use Change task status

## Issue Reporting
- `POST api/issues` - Report new issue []
- `GET api/issues/{task_id}` - Retrieve specific issue details for a given task []
### For ADMIN/supervisor
- `GET apiapi/issues` - List reported issues []

# Client Endpoints
## Project Oversight
- `GET api/client/projects` - List client's projects []
- `GET api/projects/{project_id}/reports` - Retrieve project reports []
- `GET api/projects/{project_id}/tasks` -- use List project tasks
- `GET api/projects/{project_id}` -- use Retrieve specific projects details

# Cross-Role Endpoints
## Notifications
- `GET api/notifications` - Retrieve user notifications []
- `PATCH api/notifications/{notificationId}/status` - Mark notification as read/unread []

## Integration & Sync
- `POST apiapi/sync/calendar` - Sync schedules with external calendars
- `POST apiapi/sync/offline-data` - Synchronize offline-entered data

# Audit & Compliance
- `GET api/audit-logs` - Retrieve system audit logs
- `GET api/system/compliance-status` - Check data protection compliance

# Support & Maintenance
- `GET api/system/updates` - Check for system updates
- `GET api/support/resources` - Access support documentation
