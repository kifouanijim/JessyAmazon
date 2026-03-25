const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticate } = require('../middleware/auth');

// GET /api/cart — panier de l'utilisateur connecté
router.get('/', authenticate, (req, res) => {
    try {
        const items = db.prepare('SELECT * FROM cart_items WHERE userId = ?').all(req.user.id);
        res.json({ items });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/cart — ajouter/mettre à jour un article
router.post('/', authenticate, (req, res) => {
    const { productId, productName, price, quantity = 1, sellerName = '' } = req.body;

    if (!productId || !productName || !price) {
        return res.status(400).json({ error: 'productId, productName et price sont obligatoires' });
    }

    try {
        const existing = db.prepare('SELECT * FROM cart_items WHERE userId = ? AND productId = ?')
            .get(req.user.id, String(productId));

        if (existing) {
            db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE userId = ? AND productId = ?')
                .run(quantity, req.user.id, String(productId));
        } else {
            db.prepare(
                'INSERT INTO cart_items (userId, productId, productName, price, quantity, sellerName) VALUES (?, ?, ?, ?, ?, ?)'
            ).run(req.user.id, String(productId), productName, price, quantity, sellerName);
        }

        const items = db.prepare('SELECT * FROM cart_items WHERE userId = ?').all(req.user.id);
        res.json({ items });
    } catch (err) {
        console.error('Erreur ajout panier:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/cart/:productId — mettre à jour la quantité
router.put('/:productId', authenticate, (req, res) => {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ error: 'Quantité invalide' });
    }

    try {
        const item = db.prepare('SELECT * FROM cart_items WHERE userId = ? AND productId = ?')
            .get(req.user.id, req.params.productId);
        if (!item) return res.status(404).json({ error: 'Article introuvable dans le panier' });

        db.prepare('UPDATE cart_items SET quantity = ? WHERE userId = ? AND productId = ?')
            .run(quantity, req.user.id, req.params.productId);

        const items = db.prepare('SELECT * FROM cart_items WHERE userId = ?').all(req.user.id);
        res.json({ items });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE /api/cart/:productId — retirer un article
router.delete('/:productId', authenticate, (req, res) => {
    try {
        db.prepare('DELETE FROM cart_items WHERE userId = ? AND productId = ?')
            .run(req.user.id, req.params.productId);

        const items = db.prepare('SELECT * FROM cart_items WHERE userId = ?').all(req.user.id);
        res.json({ items });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE /api/cart — vider le panier
router.delete('/', authenticate, (req, res) => {
    try {
        db.prepare('DELETE FROM cart_items WHERE userId = ?').run(req.user.id);
        res.json({ items: [] });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
