try {
  const userId = req.user.user_id; // Extract user ID
  const { project_id } = req.params; // Extract project_id from route parameters

  if (!project_id) {
    return res.status(400).json({ msg: 'Product ID is required.' });
  }

  // Insert into AuditLogs
  await sequelize.query(
    `INSERT INTO AuditLogs (table_name, action, record_id, user_id, change_details, timestamp)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    {
      replacements: ['Products', 'INSERT', project_id, userId, 'Inserted record details'],
    }
  );

  res.json({ msg: 'Action logged successfully.' });
} catch (error) {
  console.error('Database operation failed:', error.message);
  res.status(500).json({ msg: 'Internal server error' });
}