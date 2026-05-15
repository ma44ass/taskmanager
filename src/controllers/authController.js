const db = require('../config/db'); // Ton fichier de connexion MySQL
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription d'un nouvel utilisateur
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Hacher le mot de passe (on fait 10 tours de "salt")
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Insérer dans la base de données
        const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "L'email ou le pseudo existe déjà" });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "Utilisateur créé avec succès !" });
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du hachage" });
    }
};

//connexion:
exports.login = async (req, res) => {
    console.log("1. Route Login atteinte (Mode Promise)");
    const { email, password } = req.body;

    try {
        // En mode promise(), on utilise destructuring [rows]
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        //console.log("2. Requête terminée, nombre d'utilisateurs trouvés :", users.length);

        if (users.length === 0) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const user = users[0];

        // Vérification du mot de passe
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        // Génération du Token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        //console.log("3. Connexion réussie pour", user.username);
        res.json({ message: "Connexion réussie !", token });

    } catch (error) {
        //console.error("Erreur lors du login:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};