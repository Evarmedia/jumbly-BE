const { Project, Task, Issue, Schedule } = require("../models/models");

/**
 * Synchronize offline-entered data with the server.
 */
const syncOfflineData = async (req, res) => {
  try {
    const { projects, tasks, issues, schedules } = req.body;

    const syncResults = {
      projects: [],
      tasks: [],
      issues: [],
      schedules: [],
    };

    // Synchronize projects
    if (projects && projects.length) {
      for (const project of projects) {
        const { project_id, ...projectData } = project;

        const existingProject = project_id
          ? await Project.findByPk(project_id)
          : null;
        if (existingProject) {
          await existingProject.update(projectData);
          syncResults.projects.push({ project_id, status: "updated" });
        } else {
          const newProject = await Project.create(projectData);
          syncResults.projects.push({
            project_id: newProject.project_id,
            status: "created",
          });
        }
      }
    }

    // Synchronize tasks
    if (tasks && tasks.length) {
      for (const task of tasks) {
        const { task_id, ...taskData } = task;

        const existingTask = task_id ? await Task.findByPk(task_id) : null;
        if (existingTask) {
          await existingTask.update(taskData);
          syncResults.tasks.push({ task_id, status: "updated" });
        } else {
          const newTask = await Task.create(taskData);
          syncResults.tasks.push({
            task_id: newTask.task_id,
            status: "created",
          });
        }
      }
    }

    // Synchronize issues
    if (issues && issues.length) {
      for (const issue of issues) {
        const { issue_id, ...issueData } = issue;

        const existingIssue = issue_id ? await Issue.findByPk(issue_id) : null;
        if (existingIssue) {
          await existingIssue.update(issueData);
          syncResults.issues.push({ issue_id, status: "updated" });
        } else {
          const newIssue = await Issue.create(issueData);
          syncResults.issues.push({
            issue_id: newIssue.issue_id,
            status: "created",
          });
        }
      }
    }

    // Synchronize schedules
    if (schedules && schedules.length) {
      for (const schedule of schedules) {
        const { schedule_id, ...scheduleData } = schedule;

        const existingSchedule = schedule_id
          ? await Schedule.findByPk(schedule_id)
          : null;
        if (existingSchedule) {
          await existingSchedule.update(scheduleData);
          syncResults.schedules.push({ schedule_id, status: "updated" });
        } else {
          const newSchedule = await Schedule.create(scheduleData);
          syncResults.schedules.push({
            schedule_id: newSchedule.schedule_id,
            status: "created",
          });
        }
      }
    }

    res.status(200).json({
      message: "Offline data synchronized successfully.",
      syncResults,
    });
  } catch (error) {
    console.error("Error synchronizing offline data:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  syncOfflineData,
};
