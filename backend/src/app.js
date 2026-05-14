// 1. Importation d'Express
const express = require('express');

// 2. Initialisation de l'application
const app = express();

// 3. Définition d'une route de base
// Quand quelqu'un visite http://localhost:3000/
app.get('/', (req, res) => {
    res.send('Serveur opérationnel ! Bienvenue sur l\'API Task Manager.');
});

// 4. Lancement du serveur sur un port spécifique
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Le serveur tourne sur : http://localhost:${PORT}`);
});