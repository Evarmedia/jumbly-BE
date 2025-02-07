# Authentication & User Management
- `POST api/auth/register` - Create new user account ✅
- `POST api/auth/login` - Authenticate user credentials ✅
- `POST api/auth/verify-email` - Initiate password reset process ✅
- `POST api/auth/delete/{user_id}` - Delete user/client ✅
- `POST api/auth/forgot-password` - Initiate password forgot process ✅
- `POST api/auth/reset-password` - Initiate password reset process ✅
    ## User Management
- `GET api/users/profile` - Retrieve authenticated user's profile ✅
- `PUT api/users/{user_id}` - Update user account details ✅
- `GET api/users/roles` - List available user roles  ✅
- `POST api/auth/register` - add new user, Add new staff member (operative or supervisor, client) --use register endpoint here

# Admin-Specific Endpoints
## Staff Management
- `GET api/users/staff` - Retrieve list of staff members(role_name = operative and supervisors) ✅
- `PUT api/users/{user_id}` - Modify staff member roles --use "Update user account details endpoint" here

## Client Management
- `GET /api/users/clients` - List all clients ✅
- `POST api/auth/register` - Create new client --use register endpoint here
- `PUT api/users/{user_id}` - Update client information ----use "Update user account details endpoint" here
- `GET /api/projects/client` - Retrieve client's projects ✅

## System Configuration
- `POST api/admin/roles` - Create new role ✅
- `PUT api/admin/roles/{role_id}` - Edit existing role ✅
- `GET api/admin/task-statuses` - Retrieve task status types ✅
- `POST api/admin/task-categories` - Create new task category ✅
- `GET api/admin/task-categories` - List task categories ✅
- `GET api/admin/project-statuses` - Retrieve project status types ✅

# Supervisor/Client Endpoints
## Project Management
- `POST api/projects` - Create new Project autenticated client✅
- `POST api/projects/admin` - Create new Project admin ✅
- `GET api/projects` - List all Projects ✅
- `GET api/projects/{project_id}` - Retrieve specific projects details ✅
- `PUT api/projects/{project_id}` - Update projects details ✅
- `PATCH api/projects/{project_id}/status` - Change projects status ✅
- `PATCH api/projects/{project_id}/assign` - Reassign project to supervisor ✅ XX
- `DELETE api/projects/{project_id}/` - Delete a project ✅

## Task Management
- `POST api/tasks` - Create new task ✅
- `GET api/tasks` - List tasks ✅
- `GET api/tasks/projects/{project_id}/` - List project tasks ✅
- `GET api/tasks/{task_id}` - Retrieve specific task details ✅
- `GET api/tasks/operative ` - List assigned tasks✅
- `PUT api/tasks/{task_id}` - Update task details ✅
- `PATCH api/tasks/{task_id}/status` - Change task status ✅
- `PATCH api/tasks/{task_id}/assign` - Reassign task to operative ✅
- `DELETE api/tasks/{project_id}/` - Delete a task ✅
## Issue Reporting-tasks
- `POST api/tasks/issues` - Report new issue ✅
- `GET api/tasks/issues` - List reported issues []
- `GET api/tasks/issues/{task_id}` - Retrieve specific issue details for a given task ✅
- `PUT api/tasks/issues/{task_id}/status` - Update the status of a given task issue ✅

## Scheduling
- `POST api/schedules` - Create new schedule ✅
- `GET api/schedules` - List all schedules ✅
- `GET api/schedules/{project_id}` - Retrieve specific for project schedule ✅
- `GET api/schedules/{schedule_id}` - Retrieve specific schedule ✅
- `PUT api/schedules/{schedule_id}` - Update schedule details ✅


## Reporting
- `POST api/reports` - Create new report [XXX] -reports will be auto generated weekly or upon project completion
- `GET api/reports` - List generated reports ✅
- `GET api/reports/{project_id}` - Retrieve project's reports ✅
- `DELETE api/reports/{project_id}` - Delete a project's reports ✅

## Inventory Management:
### Inventory Management (Admin)
- `POST /api/inventory` - Create an item in the main items inventory.✅
- `GET /api/inventory` - Retrieve a list of all items in the main items inventory.✅
- `GET /api/inventory/:item_id` - Retrieve details of a specific item.✅
- `GET /api/inventory/:project_id/project` - Retrieve the list of items in a specific project's inventory.✅
- `PUT /api/inventory/:item_id` - Update item details (name, quantity, description).✅
- `DELETE /api/inventory/:item_id` - Delete an item from the main inventory.✅
### Supervisor Inventory Operations
- `POST /api/transactions/borrow` - Borrow an item from the main inventory to a project's inventory.✅
- `POST /api/admin/borrow` - admin can Borrow an item from the main inventory to a project's inventory.✅
- `POST /api/transactions/return` - Return an item from a project's inventory to the main inventory.✅
- `POST /api/admin/return` - admin can Return an item from a project's inventory to the main inventory.✅
### Transaction Management
- GET /api/transactions - Retrieve a list of all transactions (borrow/return logs).✅
- GET /api/transactions/:transaction_id - Retrieve details of a specific transaction.✅
### Logs (Optional)
- GET /api/inventory/logs - Retrieve the inventory change logs.✅

# Cross-Role Endpoints
## Notifications
- `POST api/notifications` - create user notifications ✅
- `GET api/notifications` - Retrieve user notifications ✅
- `PATCH api/notifications/{notificationId}/status` - Mark notification as read/unread ✅

## Integration & Sync
- `POST api/sync/offline-data` - Synchronize offline-entered data ✅

# Audit & Compliance
- `GET api/logs` - Retrieve system audit logs ✅
- `GET api/system/compliance-status` - Check data protection compliance // TO BE DONE IN FRONTEND
