const {
  Project,
} = require("../models/models");

const path = require("path");
const fs = require("fs");

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
      `../reports/project_${project_id}.pdf`
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
        return res.status(404).json({ message: `Project with ID ${project_id} not found.` });
      }
  
      // Fetch reports for the specific project
      const reports = await Report.findAll({
        where: { project_id },
        attributes: ['report_id', 'location', 'report_content', 'created_at', 'updated_at'],
        order: [['created_at', 'DESC']], // Order reports by creation date, newest first
      });
  
      if (!reports.length) {
        return res.status(404).json({ message: `No reports found for project with ID ${project_id}.` });
      }
  
      res.status(200).json({
        message: `Reports for project ${project.project_name} fetched successfully.`,
        reports,
      });
    } catch (error) {
      console.error('Error fetching project reports:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

module.exports = {
  downloadReport,
  listReports,
  getProjectReports,
};
