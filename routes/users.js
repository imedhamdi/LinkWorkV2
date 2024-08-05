const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assurez-vous que le modèle User est correctement configuré
const pool = require('../db/db');
const transporter = require('../config/email'); 
const { body, validationResult } = require('express-validator');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Limitation du débit pour la route d'inscription --> Moved up
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, 
    message: 'Trop de tentatives d\'inscription. Veuillez réessayer plus tard.'
});

// GET /users - Récupérer tous les utilisateurs (probablement à restreindre aux admins)
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Configuration de multer pour le stockage des CV
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../resumes')); // Dossier de destination des CV
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Nom unique pour chaque fichier
    }
});

const upload = multer({ storage: storage });

// POST /users/register - Inscription d'un utilisateur
router.post('/register', registerLimiter, upload.single('resume'), [
    // Règles de validation
    body('first_name')
        .notEmpty().withMessage('Le prénom est obligatoire.')
        .matches(/^[a-zA-ZÀ-ÿ '-]+$/).withMessage('Le prénom ne doit contenir que des lettres, des espaces, des tirets et des apostrophes.'),

    body('last_name')
        .notEmpty().withMessage('Le nom est obligatoire.')
        .matches(/^[a-zA-ZÀ-ÿ '-]+$/).withMessage('Le nom ne doit contenir que des lettres, des espaces, des tirets et des apostrophes.'),

    body('email')
        .isEmail().withMessage('Veuillez entrer une adresse e-mail valide.')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),

    body('phone')
        .isMobilePhone('fr-FR').withMessage('Veuillez entrer un numéro de téléphone français valide.'),

    body('situation_actuelle').isIn(['en_poste', 'sans_emploi']).withMessage('Situation actuelle invalide.'),
    body('disponibilite').isIn(['immediate', 'a_convenir']).withMessage('Disponibilité invalide.'),
    body('experience').isIn(['debutant', '2-3_ans', '4-10_ans', '10_ans_et_plus']).withMessage('Expérience invalide.'),
    body('qualification').isIn(['BEP/CAP', 'Bac', 'Bac+2', 'Bac+3/4', 'Bac+5', 'Cadre_dirigeant']).withMessage('Qualification invalide.')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Vérification de l'existence de l'utilisateur par email
        const existingUser = await User.findByEmail(req.body.email);
        if (existingUser) {
            return res.status(409).json({ error: 'Cet email est déjà utilisé' }); 
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Chemin du CV téléchargé
        const resumePath = req.file ? req.file.path : null;

        const newUser = new User({
            ...req.body, 
            password: hashedPassword,
            resume_path: resumePath 
        });

        const user = await User.create(newUser);
        res.status(201).json(user); 
    } catch (error) {
        console.error('Erreur lors de l\'inscription :', error); 

        if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: 'Erreur lors du téléchargement du CV : ' + error.message });
        } else if (error.code === 'ER_DUP_ENTRY') { // Doublon d'email (au cas où la vérification précédente échoue)
            return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
        } else {
            // Erreur inattendue
            console.error(error); 
            return res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
        }
    }
});
// GET /users/reset-password/:token - Affichage du formulaire de réinitialisation
router.get('/reset-password/:token', async (req, res) => {
    try {
        const resetToken = req.params.token;

        // Vérification du token JWT
        jwt.verify(resetToken, 'VOTRE_CLE_SECRETE', async (err, decoded) => {
            if (err) {
                return res.render('reset-password', {
                    error: 'Token de réinitialisation invalide ou expiré',
                    token: resetToken
                });
            }

            // Extraction de l'email du token
            const email = decoded.email;

            // Vérification de l'utilisateur (optionnel, mais recommandé)
            const user = await User.findByEmail(email);
            if (!user) {
                return res.render('reset-password', {
                    error: 'Utilisateur non trouvé',
                    token: resetToken
                });
            }

            // Affichage du formulaire de réinitialisation
            res.render('reset-password', { token: resetToken, error: null });
        });
    } catch (err) {
        console.error('Erreur lors de l\'affichage du formulaire de réinitialisation :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /users/reset-password/:token - Réinitialisation du mot de passe
router.post('/reset-password/:token', async (req, res) => {
    try {
        const resetToken = req.params.token;
        const newPassword = req.body.password;

        // Vérifiez la présence du mot de passe
        if (!newPassword) {
            return res.status(400).render('reset-password', { token: resetToken, error: 'Le mot de passe est requis.' });
        }

        // Vérifiez que le mot de passe respecte les critères de sécurité (par exemple, longueur minimale)
        if (newPassword.length < 6) {
            return res.status(400).render('reset-password', { token: resetToken, error: 'Le mot de passe doit contenir au moins 6 caractères.' });
        }

        // Vérifiez la validité du token
        jwt.verify(resetToken, 'VOTRE_CLE_SECRETE', async (err, decoded) => {
            if (err) {
                return res.status(400).render('reset-password', { token: resetToken, error: 'Token de réinitialisation invalide ou expiré.' });
            }

            const email = decoded.email;
            const user = await User.findByResetToken(resetToken);

            if (!user) {
                return res.status(400).render('reset-password', { token: resetToken, error: 'Token de réinitialisation invalide ou expiré.' });
            }

            // Réinitialiser le mot de passe
            const success = await User.resetPassword(resetToken, newPassword);

            if (!success) {
                return res.status(500).render('reset-password', { token: resetToken, error: 'Échec de la mise à jour du mot de passe.' });
            }

            res.redirect('/seConnecter.html');
        });
    } catch (err) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', err);
        res.status(500).render('reset-password', { token: req.params.token, error: 'Erreur serveur.' });
    }
});

// POST /users/forgot-password - Demande de réinitialisation de mot de passe
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const resetToken = await User.generateResetToken(email);
        const resetLink = `http://127.0.0.1:3000/users/reset-password/${resetToken}`; // Lien de réinitialisation

        // Envoi de l'e-mail 
        await transporter.sendMail({
            from: 'votre_email@gmail.com',
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`,
        });

        res.json({ message: 'Un email de réinitialisation a été envoyé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /users/login - Connexion d'un utilisateur
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Vérification des champs
        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        // 2. Recherche de l'utilisateur par email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Email incorrect' });
        }

        // 3. Vérification du mot de passe
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Mot de passe incorrect' });
        }

        // 4. Génération du token JWT
        const token = jwt.sign({ userId: user.user_id }, 'VOTRE_CLE_SECRETE', { expiresIn: '1h' }); // Remplacez 'VOTRE_CLE_SECRETE' par une clé secrète forte

        // 5. Réponse réussie avec prénom et nom
        res.json({
            message: 'Connexion réussie',
            token,
            userId: user.user_id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone
        });
    } catch (err) {
        console.error('Erreur lors de la connexion :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /users/:id - Récupérer un utilisateur par son ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /users/:id - Mettre à jour un utilisateur
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { first_name, last_name, email, password, phone, currentPassword, newPassword } = req.body;

        // Vérifier si l'utilisateur existe
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Vérifier le mot de passe actuel
        const isPasswordCorrect = await bcrypt.compare(currentPassword, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
        }

        // Hachage du nouveau mot de passe si fourni
        let hashedPassword = existingUser.password; // Par défaut, on garde l'ancien mot de passe
        if (newPassword) {
            hashedPassword = await bcrypt.hash(newPassword, 10);
        }

        // Mettre à jour les données de l'utilisateur
        const sql = `
            UPDATE users 
            SET first_name = ?, last_name = ?, email = ?, password = ?, phone = ?
            WHERE user_id = ?
        `;
        const values = [first_name, last_name, email, hashedPassword, phone, userId];
        await pool.query(sql, values);

        // Récupérer l'utilisateur mis à jour
        const updatedUser = await User.findById(userId);
        res.json(updatedUser);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') { // Doublon d'email
            res.status(409).json({ error: 'Cet email est déjà utilisé' });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
});

// DELETE /users/:id - Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Vérifier si l'utilisateur existe
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Supprimer l'utilisateur
        const sql = 'DELETE FROM users WHERE user_id = ?';
        await pool.query(sql, [userId]);

        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;