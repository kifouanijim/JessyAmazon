require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Initialize database at startup (creates tables if needed).
require('./database');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const favoriteRoutes = require('./routes/favorites');
const promoRoutes = require('./routes/promos');
const addressRoutes = require('./routes/addresses');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Sécurité HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Autoriser les requêtes sans origin (ex: Postman, curl)
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('CORS bloqué : ' + origin));
    },
    credentials: true
}));

app.use(express.json());

// Rate limiting — connexion : 10 tentatives / 15 min par IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting — inscription : 5 comptes / heure par IP
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Trop de créations de compte. Réessayez dans 1 heure.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting — reset password : 5 demandes / 30 min par IP
const resetLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 5,
    message: { error: 'Trop de demandes de réinitialisation. Réessayez dans 30 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth/forgot-password', resetLimiter);

app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'votremarche-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/addresses', addressRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Route introuvable' });
});

app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
    console.log(`API VotreMarche en ligne sur http://localhost:${PORT}`);
});
