const { Schedule, Project, Client, User, Role, UserClient, TaskStatus, TaskPriority, TaskCategory } = require('../models/models');


const createSchedule = async (req, res) => {
    try {
        const { project_id, supervisor_id, schedule_date, status } = req.body;

        // Validate required fields
        if (!project_id || !supervisor_id || !schedule_date) {
            return res.status(400).json({ message: 'All fields (project_id, supervisor_id, schedule_date) are required.' });
        }

        // Validate the project exists
        const project = await Project.findByPk(project_id);
        if (!project) {
            return res.status(404).json({ message: `Project with ID ${project_id} not found.` });
        }

        // Validate the supervisor exists and is a supervisor
        const supervisor = await User.findOne({
            where: { user_id: supervisor_id },
            include: {
                model: Role,
                where: { role_name: 'supervisor' },
                attributes: [],
            },
        });
        if (!supervisor) {
            return res.status(404).json({ message: `Supervisor with ID ${supervisor_id} not found.` });
        }

        // Create the schedule
        const newSchedule = await Schedule.create({
            project_id,
            supervisor_id,
            schedule_date,
            status,
        });

        res.status(201).json({
            message: 'Schedule created successfully.',
            schedule: newSchedule,
        });
    } catch (error) {
        console.error("Error creating schedule:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const getAllSchedules = async (req, res) => {
    try {
        // Fetch all schedules with associated project and supervisor details
        const schedules = await Schedule.findAll({
            include: [
                {
                    model: Project,
                    attributes: ['project_id', 'project_name'],
                },
                {
                    model: User,
                    as: 'Supervisor',
                    attributes: ['user_id', 'first_name', 'last_name'],
                },
            ],
        });

        if (!schedules.length) {
            return res.status(404).json({ message: 'No schedules found.' });
        }

        res.status(200).json({
            message: 'Schedules fetched successfully.',
            schedules,
        });
    } catch (error) {
        console.error("Error fetching schedules:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getProjectSchedules = async (req, res) => {
    try {
        const { project_id } = req.params;

        // Validate the project exists
        const project = await Project.findByPk(project_id);
        if (!project) {
            return res.status(404).json({ message: `Project with ID ${project_id} not found.` });
        }

        // Fetch schedules for the project
        const schedules = await Schedule.findAll({
            where: { project_id },
            include: [
                {
                    model: Project,
                    attributes: ['project_id', 'project_name'],
                },
                {
                    model: User,
                    as: 'Supervisor',
                    attributes: ['user_id', 'first_name', 'last_name'],
                },
            ],
        });

        if (!schedules.length) {
            return res.status(404).json({ message: `No schedules found for project ID ${project_id}.` });
        }

        res.status(200).json({
            message: 'Schedules fetched successfully.',
            schedules,
        });
    } catch (error) {
        console.error("Error fetching project schedules:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const getScheduleDetails = async (req, res) => {
    try {
        const { schedule_id } = req.params;

        // Fetch the schedule by ID
        const schedule = await Schedule.findOne({
            where: { schedule_id },
            include: [
                {
                    model: Project,
                    attributes: ['project_id', 'project_name'],
                },
                {
                    model: User,
                    as: 'Supervisor',
                    attributes: ['user_id', 'first_name', 'last_name'],
                },
            ],
        });

        if (!schedule) {
            return res.status(404).json({ message: `Schedule with ID ${schedule_id} not found.` });
        }

        res.status(200).json({
            message: 'Schedule fetched successfully.',
            schedule,
        });
    } catch (error) {
        console.error("Error fetching schedule details:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const updateScheduleDetails = async (req, res) => {
    try {
        const { schedule_id } = req.params;
        const { project_id, supervisor_id, schedule_date, status } = req.body;

        // Fetch the schedule by ID
        const schedule = await Schedule.findByPk(schedule_id);
        if (!schedule) {
            return res.status(404).json({ message: `Schedule with ID ${schedule_id} not found.` });
        }

        // Validate the project (if provided)
        if (project_id && project_id !== schedule.project_id) {
            const project = await Project.findByPk(project_id);
            if (!project) {
                return res.status(404).json({ message: `Project with ID ${project_id} not found.` });
            }
        }

        // Validate the supervisor (if provided)
        if (supervisor_id && supervisor_id !== schedule.supervisor_id) {
            const supervisor = await User.findOne({
                where: { user_id: supervisor_id },
                include: {
                    model: Role,
                    where: { role_name: 'supervisor' },
                    attributes: [],
                },
            });
            if (!supervisor) {
                return res.status(404).json({ message: `Supervisor with ID ${supervisor_id} not found.` });
            }
        }

        // Update the schedule
        await schedule.update({
            project_id: project_id || schedule.project_id,
            supervisor_id: supervisor_id || schedule.supervisor_id,
            schedule_date: schedule_date || schedule.schedule_date,
            status: status || schedule.status,
        });

        // Fetch the updated schedule with associations
        const updatedSchedule = await Schedule.findOne({
            where: { schedule_id },
            include: [
                {
                    model: Project,
                    attributes: ['project_id', 'project_name'],
                },
                {
                    model: User,
                    as: 'Supervisor',
                    attributes: ['user_id', 'first_name', 'last_name'],
                },
            ],
        });

        res.status(200).json({
            message: 'Schedule updated successfully.',
            schedule: updatedSchedule,
        });
    } catch (error) {
        console.error("Error updating schedule details:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createSchedule,
    getAllSchedules,
    getProjectSchedules,
    getScheduleDetails,
    updateScheduleDetails,
};