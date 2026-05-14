const db = require('../config/db');

// --- CREATE ---
exports.createTask = async (req, res) => {
    try {
        const { title, description, user_id } = req.body;
        const [result] = await db.query(
            'INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)',
            [title, description, user_id]
        );
        res.status(201).json({ message: "Tâche créée !", id: result.insertId });
            console.log(req.body);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- READ ---
exports.getAllTasks = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};