const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Initialisation de l'application
const app = express();

// 2. Les Middlewares (Indispensables !)
app.use(cors());          // Autorise le frontend (ex: Live Server) à parler au backend
app.use(express.json());  // Permet à Express de lire le JSON envoyé dans les requêtes POST/PUT

// 3. Importation de vos routes
const taskRoutes = require('./routes/taskRoutes');

// 4. Utilisation des routes
// On préfixe toutes les routes de tâches par /api/tasks
app.use('/api/tasks', taskRoutes);

// 5. Route de test rapide pour l'équipe
app.get('/', (req, res) => {
    res.send("Le serveur du Task Manager est opérationnel ! 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});