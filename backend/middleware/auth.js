const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('❌ ERREUR: JWT_SECRET manquant dans .env — serveur arrêté pour des raisons de sécurité.');
    process.exit(1);
}

/**
 * Middleware d'authentification obligatoire
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    // Accepter aussi ?token= dans l'URL (pour les téléchargements directs comme les factures PDF)
    const token = (authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null) || req.query.token;

    if (!token) {
        return res.status(401).json({ error: 'Authentification requise. Veuillez vous connecter.' });
    }

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
