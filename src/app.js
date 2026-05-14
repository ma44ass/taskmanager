const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json()); // Pour lire le corps des requêtes JSON (req.body)

// Route de test
app.get('/', (req, res) => {
    res.json({ message: "L'API Task Manager est prête !" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});