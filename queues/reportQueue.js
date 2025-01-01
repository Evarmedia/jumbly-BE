const Queue = require('bull');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { 
  Project, 
  Task, 
  Schedule, 
  TaskStatus, 
  TaskPriority, 
  TaskCategory, 
  User, 
  Client, 
  ProjectStatus, 
  UserClient 
} = require('../models/models');

// Set up the report generation queue
const reportQueue = new Queue('reportQueue', {
  redis: { port: 6379, host: '127.0.0.1' },
});

// Define the report generation process
reportQueue.process(async (job) => {
    const { project_id, client_id } = job.data;
  
    try {
      // Fetch the project with all related models
      const project = await Project.findOne({
        where: { project_id },
        include: [
          {
            model: Task,
            include: [
              { model: TaskStatus, as: 'status', attributes: ['status_name'] },
              { model: TaskPriority, as: 'priority', attributes: ['priority_name'] },
              { model: TaskCategory, as: 'category', attributes: ['category_name'] },
            ],
          },
          {
            model: Schedule,
            include: [
              { model: User, as: 'Supervisor', attributes: ['first_name', 'last_name'] },
            ],
          },
          {
            model: ProjectStatus,
            as: 'status',
            attributes: ['status_name'],
          },
          {
            model: Client,
            include: [
              { model: User, through: UserClient, attributes: ['first_name', 'last_name'] },
            ],
          },
        ],
      });
  
      if (!project) throw new Error(`Project with ID ${project_id} not found.`);
  
      // Create a PDF document
      const doc = new PDFDocument();
      const reportPath = path.join(__dirname, `../reports/project_${project_id}_report.pdf`);
      const writeStream = fs.createWriteStream(reportPath);
  
      doc.pipe(writeStream);
  
      // Add project details to the PDF
      doc.fontSize(20).text(`Project Report: ${project.project_name}`, { underline: true });
      doc.fontSize(16).text(`Client ID: ${client_id}`);
      doc.text(`Project Name: ${project.project_name}`);
      doc.text(`Project ID: ${project.project_id}`);
      doc.text(`Description: ${project.description}`);
      doc.text(`Start Date: ${project.start_date}`);
      doc.text(`End Date: ${project.end_date}`);
      doc.text(`Status: ${project.status.status_name}`);
  
      // Add tasks to the PDF
      doc.moveDown();
      doc.fontSize(18).text('Tasks:');
      if (project.Tasks.length > 0) {
        project.Tasks.forEach((task, index) => {
          doc.text(
            `${index + 1}. ${task.task_name} - Status: ${task.status.status_name}, Priority: ${task.priority.priority_name}, Category: ${task.category.category_name}`
          );
        });
      } else {
        doc.text('No task created for this project');
      }
  
      // Add schedules to the PDF
      doc.moveDown();
      doc.fontSize(18).text('Schedules:');
      if (project.Schedules.length > 0) {
        project.Schedules.forEach((schedule, index) => {
          doc.text(
            `${index + 1}. ${schedule.schedule_date} - Status: ${schedule.status}, Supervisor: ${schedule.Supervisor.first_name} ${schedule.Supervisor.last_name}`
          );
        });
      } else {
        doc.text('No schedule found for this project');
      }
  
      // Finalize the PDF
      doc.end();
  
      // Wait for the file to finish writing
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
  
      console.log(`Report generated: ${reportPath}`);

          // Insert the generated report into the Reports table
    await Report.create({
        project_id,
        submitted_by: null, // NULL because it's an automated report
        location: reportPath,
        report_content: `Project report for project ID ${project_id}`, // Optional metadata
      });
  
      console.log(`Report logged in the database for project ID ${project_id}`);
    } catch (error) {
      console.error('Error generating report:', error.message);
      throw error;
    }
  });
  
  module.exports = reportQueue;  