const db = require('../config/db'); 
// Importation des schémas Zod
const { taskSchema, updateTaskSchema, idSchema } = require('../validators/taskValidator'); 

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
    try {
        // Validation Zod
        const dataToValidate = { ...req.body, user_id: 1 };
        const validatedData = taskSchema.parse(dataToValidate);

        const query = 'INSERT INTO tasks (title, description, user_id, status) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(query, [
            validatedData.title, 
            validatedData.description || null, 
            validatedData.user_id, 
            validatedData.status
        ]);

        res.status(201).json({ id: result.insertId, message: "Tâche créée !" });
    } catch (error) {
        if (error.name === "ZodError" && error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: error.message });
    }
};

// 3. Modifier (Titre et Description)
exports.updateTask = async (req, res) => {
    try {
        const { id } = idSchema.parse(req.params);
        const validatedData = updateTaskSchema.parse(req.body);

        await db.query(
            'UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description) WHERE id = ?',
            [validatedData.title || null, validatedData.description || null, id]
        );
        res.json({ message: "Tâche mise à jour avec succès !" });
    } catch (error) {
        if (error.name === "ZodError" && error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: error.message });
    }
};

// 4. MAJ du STATUT
exports.updateStatus = async (req, res) => {
    try {
        const { id } = idSchema.parse(req.params);
        const validatedData = updateTaskSchema.parse(req.body);

        if (!validatedData.status) {
            return res.status(400).json({ error: "Le statut est requis" });
        }

        await db.query('UPDATE tasks SET status = ? WHERE id = ?', [validatedData.status, id]);
        res.json({ message: "Statut mis à jour !" });
    } catch (error) {
        if (error.name === "ZodError" && error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: error.message });
    }
};

// 5. Supprimer
exports.deleteTask = async (req, res) => {
    try {
        const { id } = idSchema.parse(req.params);

        await db.query('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ message: "Tâche supprimée" });
    } catch (error) {
        if (error.name === "ZodError" && error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: error.message });
    }
};