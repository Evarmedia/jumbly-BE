const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Jumbly-API",
      version: "1.0.0",
      description: "API documentation for Jumbly",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            user_id: {
              type: "integer",
              description: "The unique ID of the user.",
            },
            role_id: {
              type: "integer",
              description:
                "The role ID of the user, referencing the Roles table.",
            },
            tenant_id: {
              type: "integer",
              description:
                "The Tenant ID of user, referencing the Tenants table.",
            },
            email: {
              type: "string",
              format: "email",
              description: "The email address of the user.",
            },
            password: {
              type: "string",
              description: "The hashed password of the user.",
            },
            first_name: {
              type: "string",
              description: "The first name of the user.",
            },
            last_name: {
              type: "string",
              description: "The last name of the user.",
            },
            address: {
              type: "string",
              description: "The address of the user.",
            },
            gender: {
              type: "string",
              description: "The gender of the user.",
            },
            phone: {
              type: "string",
              description: "The phone number of the user.",
            },
            photo: {
              type: "string",
              description: "A photo URL for the user.",
            },
            education: {
              type: "string",
              description:
                "The education details of the user (Supervisor and Operator-specific).",
            },
            birthdate: {
              type: "string",
              format: "date",
              description:
                "The birthdate of the user (Supervisor and Operator-specific).",
            },
            status: {
              type: "string",
              enum: ["verified", "unverified"],
              description: "The verification status of the user.",
            },
            reset_token: {
              type: "string",
              nullable: true,
              description: "A token used for password reset.",
            },
            reset_token_expiration: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "The expiration timestamp for the reset token.",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the user was created.",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the user was last updated.",
            },
          },
        },
        Clients: {
          type: "object",
          properties: {
            client_id: {
              type: "integer",
              description: "The unique ID of the client.",
            },
            tenant_id: {
              type: "integer",
              description:
                "The Tenant ID of client, referencing the Tenants table.",
            },
            email: {
              type: "string",
              format: "email",
              description:
                "The email address of the client, inherited from the registration endpoint.",
            },
            website: {
              type: "string",
              description: "The website of the client.",
            },
            company_name: {
              type: "string",
              description: "The company name of the client.",
            },
            industry: {
              type: "string",
              description: "The industry the client belongs to.",
            },
            official_email: {
              type: "string",
              format: "email",
              description: "The official email address of the client.",
            },
            contact_person: {
              type: "string",
              description: "The contact person for the client.",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the client was created.",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the client was last updated.",
            },
          },
        },
        Roles: {
          type: "object",
          properties: {
            role_id: {
              type: "integer",
              description: "The unique ID of the role.",
            },
            role_name: {
              type: "string",
              description:
                "The name of the role (e.g., admin, client, operative, supervisor).",
            },
            tenant_id: {
              type: "integer",
              description:
                "The Tenant ID of roles, referencing the Tenants table.",
            },
            description: {
              type: "string",
              description: "A description of the role and its permissions.",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the role was created.",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the role was last updated.",
            },
          },
        },
        Project: {
          type: "object",
          properties: {
            project_id: {
              type: "integer",
              description: "The unique ID of the project.",
            },
            client_id: {
              type: "integer",
              description: "The ID of the associated client.",
            },
            tenant_id: {
              type: "integer",
              description:
                "The Tenant ID associated with project, referencing the Tenants table.",
            },
            project_name: {
              type: "string",
              description: "The name of the project.",
            },
            supervisor_id: {
              type: "integer",
              description: "The ID of the supervisor for the project.",
            },
            start_date: {
              type: "string",
              format: "date",
              description: "The start date of the project.",
            },
            end_date: {
              type: "string",
              format: "date",
              description: "The end date of the project (if available).",
            },
            status_id: {
              type: "integer",
              description: "The status of the project.",
            },
            description: {
              type: "string",
              description: "Additional details about the project.",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the project was created.",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the project was last updated.",
            },
            client: {
              type: "object",
              description: "The associated client details.",
              properties: {
                client_id: {
                  type: "integer",
                  description: "The unique ID of the client.",
                },
                company_name: {
                  type: "string",
                  description: "The name of the client's company.",
                },
                contact_person: {
                  type: "string",
                  description: "The contact person for the client.",
                },
                email: {
                  type: "string",
                  format: "email",
                  description: "The email address of the client.",
                },
              },
            },
          },
        },
        Task: {
          type: "object",
          properties: {
            task_id: {
              type: "integer",
              description: "The unique ID of the task.",
            },
            project_id: {
              type: "integer",
              description:
                "The ID of the project this task is associated with.",
            },
            assigned_by: {
              type: "integer",
              description: "The user ID of the person who assigned the task.",
            },
            assigned_to: {
              type: "integer",
              nullable: true,
              description:
                "The user ID of the person to whom the task is assigned (if any).",
            },
            task_name: {
              type: "string",
              description: "The name of the task.",
            },
            task_description: {
              type: "string",
              nullable: true,
              description: "A detailed description of the task.",
            },
            status_id: {
              type: "integer",
              description:
                "The ID of the task status, referencing TaskStatuses.",
            },
            priority_id: {
              type: "integer",
              description:
                "The ID of the task priority, referencing TaskPriorities.",
            },
            due_date: {
              type: "string",
              format: "date",
              description: "The due date for the task.",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the task was created.",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the task was last updated.",
            },
            project: {
              type: "object",
              description: "Details of the associated project.",
              properties: {
                project_id: {
                  type: "integer",
                  description: "The unique ID of the project.",
                },
                project_name: {
                  type: "string",
                  description: "The name of the project.",
                },
              },
            },
            status: {
              type: "object",
              description: "Details of the task status.",
              properties: {
                status_id: {
                  type: "integer",
                  description: "The unique ID of the status.",
                },
                status_name: {
                  type: "string",
                  description: "The name of the status.",
                },
              },
            },
            priority: {
              type: "object",
              description: "Details of the task priority.",
              properties: {
                priority_id: {
                  type: "integer",
                  description: "The unique ID of the priority.",
                },
                priority_name: {
                  type: "string",
                  description:
                    "The name of the priority (e.g., low, medium, high, urgent).",
                },
              },
            },
          },
        },
        Schedule: {
          type: "object",
          properties: {
            schedule_id: {
              type: "integer",
              description: "The unique ID of the schedule.",
            },
            project_id: {
              type: "integer",
              description: "The ID of the associated project.",
            },
            supervisor_id: {
              type: "integer",
              description: "The ID of the supervisor managing the schedule.",
            },
            schedule_date: {
              type: "string",
              format: "date",
              description: "The date of the schedule.",
            },
            status: {
              type: "string",
              enum: ["scheduled", "completed", "cancelled"],
              description: "The status of the schedule.",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the schedule was created.",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the schedule was last updated.",
            },
          },
        },
        TaskStatus: {
          type: "object",
          properties: {
            status_id: {
              type: "integer",
              description: "The unique ID of the task status.",
            },
            status_name: {
              type: "string",
              description: "The name of the task status.",
            },
            description: {
              type: "string",
              description: "A description of the task status.",
            },
          },
        },
        TaskCategory: {
          type: "object",
          properties: {
            category_id: {
              type: "integer",
              description: "The unique ID of the task category.",
            },
            category_name: {
              type: "string",
              description: "The name of the task category.",
            },
            description: {
              type: "string",
              description: "A description of the task category.",
            },
          },
        },
        ProjectStatus: {
          type: "object",
          properties: {
            status_id: {
              type: "integer",
              description: "The unique ID of the project status.",
            },
            status_name: {
              type: "string",
              description: "The name of the project status.",
            },
            description: {
              type: "string",
              description: "A description of the project status.",
            },
          },
        },
        Report: {
          type: "object",
          properties: {
            report_id: {
              type: "integer",
              description: "The unique ID of the report.",
            },
            project_id: {
              type: "integer",
              description: "The ID of the associated project.",
            },
            submitted_by: {
              type: "integer",
              nullable: true,
              description:
                "The ID of the user who generated the report (null for automated reports).",
            },
            location: {
              type: "string",
              description: "The file path or URL of the report.",
            },
            report_content: {
              type: "string",
              description: "A description or metadata of the report.",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the report was created.",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the report was last updated.",
            },
            project: {
              type: "object",
              $ref: "#/components/schemas/Project",
            },
          },
        },
        Issue: {
          type: "object",
          properties: {
            issue_id: {
              type: "integer",
              description: "The unique ID of the issue.",
            },
            task_id: {
              type: "integer",
              description: "The ID of the associated task.",
            },
            reported_by: {
              type: "integer",
              description: "The ID of the user reporting the issue.",
            },
            issue_description: {
              type: "string",
              description: "A detailed description of the issue.",
            },
            photo_attachment: {
              type: "string",
              nullable: true,
              description:
                "A URL or file path for an optional photo attachment.",
            },
            status: {
              type: "string",
              enum: ["reported", "resolved"],
              description: "The status of the issue.",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the issue was reported.",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the issue was last updated.",
            },
          },
        },
        Notifications: {
          type: "object",
          properties: {
            notification_id: {
              type: "integer",
              description: "The unique ID of the notification.",
            },
            user_id: {
              type: "integer",
              description:
                "The ID of the user to whom the notification is sent.",
            },
            tenant_id: {
              type: "integer",
              description:
                "The Tenant ID of user, referencing the Tenants table.",
            },
            message: {
              type: "string",
              description: "The content of the notification.",
            },
            type: {
              type: "string",
              description: "The type of notification (e.g., 'task', 'system').",
            },
            status: {
              type: "string",
              enum: ["read", "unread"],
              description: "The read/unread status of the notification.",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "The priority level of the notification.",
            },
            delivered_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the notification was delivered.",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the notification was created.",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description:
                "The timestamp when the notification was last updated.",
            },
          },
        },
        Item: {
          type: "object",
          properties: {
            item_id: {
              type: "integer",
              description: "The unique ID of the item.",
            },
            tenant_id: {
              type: "integer",
              description:
                "The Tenant ID, referencing the Tenants table.",
            },
            name: {
              type: "string",
              description: "The name of the item.",
            },
            quantity: {
              type: "integer",
              description: "The quantity of the item.",
            },
            description: {
              type: "string",
              description: "A description of the item.",
            },
          },
        },
        ProjectInventory: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "The unique ID of the project inventory record.",
            },
            tenant_id: {
              type: "integer",
              description:
                "The Tenant ID, referencing the Tenants table.",
            },
            project_id: {
              type: "integer",
              description: "The ID of the project.",
            },
            item: {
              $ref: "#/components/schemas/Item",
            },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            transaction_id: {
              type: "integer",
              description: "The unique ID of the transaction.",
            },
            item_id: {
              type: "integer",
              description: "The ID of the item involved in the transaction.",
            },
            project_id: {
              type: "integer",
              description:
                "The ID of the project associated with the transaction.",
            },
            quantity: {
              type: "integer",
              description:
                "The quantity of the item involved in the transaction.",
            },
            action: {
              type: "string",
              enum: ["borrow", "return"],
              description: "The type of transaction (borrow or return).",
            },
            date: {
              type: "string",
              format: "date-time",
              description: "The timestamp when the transaction occurred.",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
