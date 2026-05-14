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


// --- UPDATE : Modifier une tâche ---
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params; // On récupère l'ID dans l'URL (ex: /api/tasks/5)
        const { title, description, status } = req.body;
        
        const [result] = await db.query(
            'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?',
            [title, description, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }

        res.json({ message: "Tâche mise à jour avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- DELETE : Supprimer une tâche ---
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }

        res.json({ message: "Tâche supprimée définitivement !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
