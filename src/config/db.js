const mysql = require('mysql2');
require('dotenv').config(); // Charge les variables du .env

// Création du pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Max 10 utilisateurs simultanés
    queueLimit: 0
});

// Exportation en mode "Promise" pour utiliser async/await
module.exports = pool.promise();