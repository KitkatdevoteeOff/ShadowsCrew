const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcrypt'); // Ajout de bcrypt pour le hachage
const session = require('express-session'); // Nécessaire pour gérer les sessions
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.APP_PORT || 3000;
const CAPES_DATA_FILE = path.join(__dirname, 'data', 'capes.json');
const USERS_DATA_FILE = path.join(__dirname, 'data', 'users.json');
const SALT_ROUNDS = 10; // Niveau de sécurité pour bcrypt

// Configuration de la session (Nécessaire pour se "souvenir" de l'utilisateur)
app.use(session({
    secret: 'votre_secrete_key_pour_session', // DOIT être une chaîne aléatoire et secrète
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Mettre à true si vous utilisez HTTPS
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Fonctions utilitaires (lire/écrire capes.json) - (omises ici pour la concision)

/**
 * Lit le fichier des utilisateurs
 */
async function getUsersData() {
    try {
        const data = await fs.readFile(USERS_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {}; // Retourne un objet vide si pas de fichier
    }
}

/**
 * Écrit dans le fichier des utilisateurs
 */
async function writeUsersData(data) {
    await fs.writeFile(USERS_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// =============================================================
// ROUTES DE CONNEXION ET CRÉATION DE COMPTE
// =============================================================

// Redirige la racine vers la page d'accueil (index.html)
app.get('/', (req, res) => {
    // Si l'utilisateur est dans la session, le considérer comme connecté
    if (req.session.userId) {
        // Redirection vers la page avec le statut de connexion
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});


// Route de création de compte
app.post('/api/register', async (req, res) => {
    const { email, pseudo, password } = req.body;
    
    if (!email || !pseudo || !password) {
        return res.status(400).json({ success: false, message: "Tous les champs sont requis." });
    }

    const users = await getUsersData();

    if (users[email]) {
        return res.status(409).json({ success: false, message: "Cet email est déjà enregistré." });
    }

    try {
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        
        // ATTENTION : Pour l'API Cosmetica, vous devrez obtenir l'UUID à partir du pseudo Minecraft
        // via une API publique Mojang/UUID avant cette étape, ou le demander à l'utilisateur plus tard.
        const uuid_placeholder = "placeholder-" + Math.random().toString(36).substring(2, 9); // UUID factice

        users[email] = {
            password_hash: passwordHash,
            minecraft_pseudo: pseudo,
            uuid: uuid_placeholder // À remplacer par le vrai UUID
        };
        await writeUsersData(users);

        req.session.userId = email;
        res.json({ success: true, message: "Compte créé et connexion réussie !", pseudo: pseudo });

    } catch (error) {
        console.error("Erreur d'enregistrement:", error);
        res.status(500).json({ success: false, message: "Erreur serveur lors de l'enregistrement." });
    }
});

// Route de connexion
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    const users = await getUsersData();
    const user = users[email];

    if (!user) {
        return res.status(404).json({ success: false, message: "Email non trouvé." });
    }

    try {
        const match = await bcrypt.compare(password, user.password_hash);

        if (match) {
            req.session.userId = email;
            res.json({ success: true, message: "Connexion réussie !", pseudo: user.minecraft_pseudo });
        } else {
            res.status(401).json({ success: false, message: "Mot de passe incorrect." });
        }
    } catch (error) {
        console.error("Erreur de connexion:", error);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la connexion." });
    }
});

// Route de déconnexion
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: "Déconnexion réussie." });
});


// Route d'activation de cape (Mise à jour)
app.post('/api/activate', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: "Non connecté." });
    }
    
    const { code } = req.body;
    const users = await getUsersData();
    const user = users[req.session.userId];
    const uuid = user.uuid; // On utilise l'UUID associé au compte local
    // ... Reste de la logique d'activation de code et d'appel à l'API Cosmetica (voir l'ancienne version de server.js) ...

    // MAQUETTE : Réussite simulée
    return res.json({ success: true, message: `Cape attribuée à ${user.minecraft_pseudo} (UUID: ${uuid}) !` });
});


// =============================================================
// Démarrage du serveur
// =============================================================
// Le reste du code de démarrage...
// ...
