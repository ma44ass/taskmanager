const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 1. Initialisation
const app = express();

// 2. Middlewares
app.use(cors());
app.use(express.json());

// 3. Serveur de fichiers statiques (Frontend)
app.use(express.static(path.join(__dirname, 'src/frontend')));

// 4. Importation des routes
// const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

// 5. Utilisation des routes
// app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 6. Route principale (sert l'index.html si on accède à /)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/frontend', 'index.html'));
});

// 7. Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});