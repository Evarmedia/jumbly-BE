const { Project, Report } = require("../models/models");
const path = require("path");
const fs = require("fs");

/**
 * Generate a report for a specific project.
 */
const createReport = async (req, res) => {
  try {
    const { project_id } = req.body; // Get the project ID from the request body

    // Validate that the project exists
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
      ],
    });

    if (!project) {
      return res.status(404).json({ message: `Project with ID ${project_id} not found.` });
    }

    // Generate the report file
    const doc = new PDFDocument();
    const reportPath = path.join(__dirname, `../reports/project_${project_id}_report.pdf`);
    const writeStream = fs.createWriteStream(reportPath);

    doc.pipe(writeStream);

    // Add project details to the PDF
    doc.fontSize(20).text(`Project Report: ${project.project_name}`, { underline: true });
    doc.fontSize(16).text(`Project Name: ${project.project_name}`);
    doc.text(`Project ID: ${project.project_id}`);
    doc.text(`Description: ${project.description}`);
    doc.text(`Start Date: ${project.start_date}`);
    doc.text(`End Date: ${project.end_date}`);
    doc.text(`Status: ${project.status.status_name}`);

    // Add tasks
    doc.moveDown();
    doc.fontSize(18).text('Tasks:');
    if (project.Tasks.length > 0) {
      project.Tasks.forEach((task, index) => {
        doc.text(
          `${index + 1}. ${task.task_name} - Status: ${task.status.status_name}, Priority: ${task.priority.priority_name}, Category: ${task.category.category_name}`
        );
      });
    } else {
      doc.text(': No task created for this project');
    }

    // Add schedules
    doc.moveDown();
    doc.fontSize(18).text('Schedules:');
    if (project.Schedules.length > 0) {
      project.Schedules.forEach((schedule, index) => {
        doc.text(
          `${index + 1}. ${schedule.schedule_date} - Supervisor: ${schedule.Supervisor.first_name} ${schedule.Supervisor.last_name}`
        );
      });
    } else {
      doc.text(': No schedule found for this project');
    }

    // Finalize the PDF
    doc.end();

    // Wait for the file to finish writing
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    console.log(`Report generated: ${reportPath}`);

    // Save the report in the database
    await Report.create({
      project_id,
      submitted_by: req.user.user_id, // Assuming the user is authenticated
      location: reportPath,
      report_content: `Manual report for project ID ${project_id}`,
    });

    res.status(201).json({
      message: 'Report generated successfully.',
      report_url: `/api/reports/download/${project_id}`,
    });
  } catch (error) {
    console.error('Error generating report:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const downloadReport = async (req, res) => {
  try {
    const { project_id } = req.params;

    // Validate that the project exists
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with ID ${project_id} not found.` });
    }

    // Construct the file path for the report
    const filePath = path.join(
      __dirname,
      `../reports/project_${project_id}_report.pdf`
    );

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Report file not found." });
    }

    // Download the report file
    return res.download(
      filePath,
      `reports/project_${project_id}_report.pdf`,
      (err) => {
        if (err) {
          console.error("Error downloading the file:", err);
          return res
            .status(500)
            .json({ message: "Error downloading the report file." });
        }
      }
    );
  } catch (error) {
    console.error("Error in downloadReport:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const listReports = async (req, res) => {
  try {
    // Fetch all reports with associated project details
    const reports = await Report.findAll({
      include: [
        {
          model: Project,
          attributes: ["project_id", "project_name", "description"],
        },
      ],
      order: [["created_at", "DESC"]], // Optional: Order by most recently created reports
    });

    if (!reports.length) {
      return res.status(404).json({ message: "No reports found." });
    }

    res.status(200).json({
      message: "Reports fetched successfully.",
      reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProjectReports = async (req, res) => {
  try {
    const { project_id } = req.params;

    // Check if the project exists
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with ID ${project_id} not found.` });
    }

    // Fetch reports for the specific project
    const reports = await Report.findAll({
      where: { project_id },
      attributes: [
        "report_id",
        "location",
        "report_content",
        "created_at",
        "updated_at",
      ],
      order: [["created_at", "DESC"]], // Order reports by creation date, newest first
    });

    if (!reports.length) {
      return res
        .status(404)
        .json({
          message: `No reports found for project with ID ${project_id}.`,
        });
    }

    res.status(200).json({
      message: `Reports for project ${project.project_name} fetched successfully.`,
      reports,
    });
  } catch (error) {
    console.error("Error fetching project reports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a project's reports from the database and file system.
 */
const deleteProjectReports = async (req, res) => {
  try {
    const { project_id } = req.params;

    // Find all reports for the given project
    const reports = await Report.findAll({ where: { project_id } });

    if (!reports.length) {
      return res.status(404).json({ message: `No reports found for project with ID ${project_id}.` });
    }

    // Delete report files from the file system
    for (const report of reports) {
      const reportPath = report.location;
      if (fs.existsSync(reportPath)) {
        fs.unlinkSync(reportPath); // Remove the file
        console.log(`Deleted file: ${reportPath}`);
      } else {
        console.warn(`File not found: ${reportPath}`);
      }
    }

    // Delete reports from the database
    await Report.destroy({ where: { project_id } });

    res.status(200).json({ message: `Reports for project ID ${project_id} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting project reports:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = {
  createReport,
  downloadReport,
  listReports,
  getProjectReports,
  deleteProjectReports,
};
