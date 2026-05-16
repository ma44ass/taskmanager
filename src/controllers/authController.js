const db = require('../config/db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
        
        await db.query(query, [username, email, hashedPassword]);
        return res.status(201).json({ message: "Utilisateur créé !" });
    } catch (error) {
        console.error("Erreur Inscription:", error);
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "L'email existe déjà" });
        return res.status(500).json({ error: error.message });
    }
};

// Connexion (Version ultra-stable)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. On cherche l'utilisateur
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (!users || users.length === 0) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const user = users[0];

        // 2. Vérification mot de passe
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        // 3. Vérification du JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error("ERREUR: JWT_SECRET est manquant dans le .env");
            return res.status(500).json({ message: "Erreur configuration serveur" });
        }

        // 4. Génération Token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // ON ENVOIE ENFIN LA RÉPONSE (incluant le username pour le frontend)
        console.log(`✅ Login réussi pour : ${user.email}`);
        return res.status(200).json({ 
            message: "Connexion réussie !", 
            token,
            username: user.username 
        });

    } catch (error) {
        console.error("Erreur pendant le login:", error);
        return res.status(500).json({ message: "Erreur serveur interne" });
    }
};