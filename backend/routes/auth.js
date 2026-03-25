const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

// ─────────────────────────────────────────────
// Validation mot de passe conforme RGPD
// Min 8 chars, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial
// ─────────────────────────────────────────────
function validatePassword(password) {
    if (!password || password.length < 8)
        return 'Le mot de passe doit contenir au moins 8 caractères';
    if (!/[A-Z]/.test(password))
        return 'Le mot de passe doit contenir au moins une lettre majuscule';
    if (!/[a-z]/.test(password))
        return 'Le mot de passe doit contenir au moins une lettre minuscule';
    if (!/[0-9]/.test(password))
        return 'Le mot de passe doit contenir au moins un chiffre';
    if (!/[!@#$%^&*\-_=+;:,.<>?]/.test(password))
        return 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%...)';
    return null;
}

// ─────────────────────────────────────────────
// POST /api/auth/register — Inscription acheteur ou vendeur
// ─────────────────────────────────────────────
router.post('/register', (req, res) => {
    const { fullName, email, phone, password, address, role } = req.body;

    if (!fullName || !email || !phone || !password) {
        return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }
    const pwdError = validatePassword(password);
    if (pwdError) return res.status(400).json({ error: pwdError });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Adresse email invalide' });
    }

    try {
        if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
        if (db.prepare('SELECT id FROM users WHERE phone = ?').get(phone)) {
            return res.status(400).json({ error: 'Ce numéro de téléphone est déjà utilisé' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const userRole = role === 'seller' ? 'seller' : 'buyer';

        const result = db.prepare(
            'INSERT INTO users (fullName, email, phone, password, address, role) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(fullName, email, phone, hashedPassword, address || '', userRole);

        const user = db.prepare(
            'SELECT id, fullName, email, phone, address, role, createdAt FROM users WHERE id = ?'
        ).get(result.lastInsertRowid);

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({ token, user });
    } catch (err) {
        console.error('Erreur inscription:', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
    }
});

// ─────────────────────────────────────────────
// POST /api/auth/login — Connexion
// ─────────────────────────────────────────────
router.post('/login', (req, res) => {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
        return res.status(400).json({ error: 'Email/téléphone et mot de passe requis' });
    }

    try {
        const user = db.prepare(
            'SELECT * FROM users WHERE email = ? OR phone = ?'
        ).get(emailOrPhone, emailOrPhone);

        if (!user) {
            return res.status(401).json({ error: 'Identifiants incorrects. Vérifiez votre email/téléphone et mot de passe.' });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Identifiants incorrects. Vérifiez votre email/téléphone et mot de passe.' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
        const { password: _, ...userWithoutPassword } = user;

        res.json({ token, user: userWithoutPassword });
    } catch (err) {
        console.error('Erreur connexion:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
});

// ─────────────────────────────────────────────
// GET /api/auth/me — Profil de l'utilisateur connecté
// ─────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

// ─────────────────────────────────────────────
// PUT /api/auth/update — Mise à jour du profil
// ─────────────────────────────────────────────
router.put('/update', authenticate, (req, res) => {
    const { fullName, phone, address } = req.body;

    try {
        // Vérifier si le téléphone est déjà pris par un autre utilisateur
        if (phone) {
            const existing = db.prepare('SELECT id FROM users WHERE phone = ? AND id != ?').get(phone, req.user.id);
            if (existing) {
                return res.status(400).json({ error: 'Ce numéro de téléphone est déjà utilisé' });
            }
        }

        db.prepare(
            'UPDATE users SET fullName = ?, phone = ?, address = ? WHERE id = ?'
        ).run(
            fullName || req.user.fullName,
            phone || req.user.phone,
            address !== undefined ? address : req.user.address,
            req.user.id
        );

        const updated = db.prepare(
            'SELECT id, fullName, email, phone, address, role, createdAt FROM users WHERE id = ?'
        ).get(req.user.id);

        res.json({ user: updated });
    } catch (err) {
        console.error('Erreur update profil:', err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
});

// ─────────────────────────────────────────────
// PUT /api/auth/change-password — Changer le mot de passe
// ─────────────────────────────────────────────
router.put('/change-password', authenticate, (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Ancien et nouveau mot de passe requis' });
    }
    const pwdError = validatePassword(newPassword);
    if (pwdError) return res.status(400).json({ error: pwdError });

    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

        if (!bcrypt.compareSync(currentPassword, user.password)) {
            return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
        }

        const hashed = bcrypt.hashSync(newPassword, 10);
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user.id);

        res.json({ message: 'Mot de passe modifié avec succès' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
