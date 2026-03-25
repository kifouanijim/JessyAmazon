const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'votremarche_secret_key';

/**
 * Middleware d'authentification obligatoire
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentification requise. Veuillez vous connecter.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = db.prepare(
            'SELECT id, fullName, email, phone, address, role, createdAt FROM users WHERE id = ?'
        ).get(payload.userId);

        if (!user) {
            return res.status(401).json({ error: 'Utilisateur introuvable' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Session expirée. Veuillez vous reconnecter.' });
    }
}

/**
 * Middleware d'authentification optionnelle (ne bloque pas si pas de token)
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            const user = db.prepare(
                'SELECT id, fullName, email, phone, address, role FROM users WHERE id = ?'
            ).get(payload.userId);
            if (user) req.user = user;
        } catch (e) { /* Token invalide, continuer sans user */ }
    }
    next();
}

module.exports = { authenticate, optionalAuth, JWT_SECRET };
