const { taskSchema, updateTaskSchema, idSchema } = require('../validators/taskValidator');
const db = require('../config/db');

// --- CREATE : Ajouter une tâche ---
exports.createTask = async (req, res) => {
    try {
        // On valide les données. .strict() dans le validator bloquera les intrus ici.
        const validatedData = taskSchema.parse(req.body);
        
        // On déstructure uniquement ce qui a été validé
        const { title, description, status, is_completed, due_date } = validatedData;
        const userId = 1; // Temporaire : à remplacer par req.user.id après ajout du JWT
        
        const query = `
            INSERT INTO tasks (title, description, status, is_completed, due_date, user_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(query, [
            title,
            description || null,
            status || 'pending',
            is_completed || false,
            due_date || null,
            userId
        ]);

        res.status(201).json({
            message: "Tâche créée avec succès !",
            taskId: result.insertId 
        });

    } catch (err) { 
        if (err.name === "ZodError") {
            const flattened = err.flatten();
            return res.status(400).json({
                status: "error",
                message: "Données invalides",
                errors: flattened.fieldErrors,
                globalErrors: flattened.formErrors // Affiche si .strict() a bloqué un champ
            });
        }
        console.error("Erreur SQL:", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

// --- READ : Lister toutes les tâches de l'utilisateur ---
exports.getAllTasks = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM tasks WHERE user_id = 1 ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error("Erreur GET:", err);
        res.status(500).json({ error: "Impossible de récupérer les tâches" });
    }
};

// --- UPDATE : Mise à jour dynamique et sécurisée ---
exports.updateTask = async (req, res) => {

    try {
        const { id } = req.params;

        // 1. Validation partielle (Zod nettoie les champs inconnus ou bloque si .strict())
        const validatedData = updateTaskSchema.parse(req.body);        
        // 2. On récupère les clés DEPUIS les données validées (Sécurité maximale)
        const updates = Object.keys(validatedData);
        console.log("DEBUG - Longueur de updates :", updates.length);
        if (updates.length === 0) {
        return res.status(400).json({ 
            message: "Aucune donnée valide fournie pour la mise à jour" 
         });
}

        // 3. Construction dynamique de la clause SET (ex: "title = ?, status = ?")
        const setClause = updates.map(key => `${key} = ?`).join(', ');
        const values = updates.map(key => validatedData[key]);
        
        // Ajout de l'ID de la tâche et de l'utilisateur pour le WHERE
        values.push(id, 1); 

        const query = `UPDATE tasks SET ${setClause} WHERE id = ? AND user_id = ?`;
        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Tâche non trouvée ou non autorisée" });
        }

        res.json({ message: "Tâche mise à jour avec succès !" });

    } catch (err) {
        if (err.name === "ZodError") {
            const flattened = err.flatten();
            return res.status(400).json({
                status: "error",
                message: "Modification refusée",
                errors: flattened.fieldErrors,
                globalErrors: flattened.formErrors
            });
        }
        console.error("Erreur UPDATE:", err);
        res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
};

// --- DELETE : Supprimer définitivement ---
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Validation de l'ID
        idSchema.parse({ id });
        
        const [result] = await db.query(
            'DELETE FROM tasks WHERE id = ? AND user_id = 1', 
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Tâche introuvable" });
        }

        res.json({ message: "Tâche supprimée définitivement !" });

    } catch (err) {
        if (err.name === "ZodError") {
            return res.status(400).json({
                status: "error",
                message: "Format d'ID invalide",
                errors: err.flatten().fieldErrors
            });
        }

        console.error("Erreur DELETE:", err);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};