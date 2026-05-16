const db = require('../config/db'); 

// 1. Récupérer toutes les tâches
exports.getAllTasks = async (req, res) => {
    try {
        const [tasks] = await db.query('SELECT * FROM tasks ORDER BY id DESC');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Créer une tâche
exports.createTask = async (req, res) => {
    const { title, description } = req.body;
    try {
        // CORRECTION : On utilise 'pending' au lieu de 0 pour correspondre à l'ENUM SQL
        const query = 'INSERT INTO tasks (title, description, user_id, status) VALUES (?, ?, 1, "pending")';
        const [result] = await db.query(query, [title, description]);
        res.status(201).json({ id: result.insertId, message: "Tâche créée !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Modifier (Titre et Description)
exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    try {
        await db.query(
            'UPDATE tasks SET title = ?, description = ? WHERE id = ?',
            [title, description, id]
        );
        res.json({ message: "Tâche mise à jour avec succès !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. MAJ du STATUT (Reçoit 'pending', 'in_progress' ou 'completed')
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 
    try {
        // MySQL accepte directement la string si elle fait partie de l'ENUM
        await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: "Statut mis à jour !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Supprimer
exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ message: "Tâche supprimée" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};