const express = require('express');
const db = require('./config/db'); // Import de notre config
require('dotenv').config();

const app = express();
app.use(express.json());

// Test de connexion à la DB au démarrage
async function testConnection() {
    try {
        await db.query('SELECT 1');
        console.log('🚀 Connecté à la base de données MySQL !');
    } catch (err) {
        console.error('❌ Erreur de connexion à la base de données:', err.message);
    }
}

testConnection();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur sur le port ${PORT}`);
});