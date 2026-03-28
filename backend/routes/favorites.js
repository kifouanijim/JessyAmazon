const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticate } = require('../middleware/auth');

// GET /api/favorites — liste des favoris
router.get('/', authenticate, (req, res) => {
    try {
        const favorites = db.prepare(`
            SELECT f.id, f.addedAt, p.id as productId, p.name, p.price,
                   p.imageUrl, p.sellerName, p.category, p.rating
            FROM favorites f
            JOIN products p ON p.id = f.productId
            WHERE f.userId = ?
            ORDER BY f.addedAt DESC
        `).all(req.user.id);
        res.json({ favorites });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/favorites/:productId — ajouter/retirer (toggle)
router.post('/:productId', authenticate, (req, res) => {
    try {
        const product = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.productId);
        if (!product) return res.status(404).json({ error: 'Produit introuvable' });

        const existing = db.prepare('SELECT id FROM favorites WHERE userId = ? AND productId = ?')
            .get(req.user.id, req.params.productId);

        if (existing) {
            db.prepare('DELETE FROM favorites WHERE userId = ? AND productId = ?')
                .run(req.user.id, req.params.productId);
            return res.json({ favorited: false });
        }

        db.prepare('INSERT INTO favorites (userId, productId) VALUES (?, ?)').run(req.user.id, req.params.productId);
        res.status(201).json({ favorited: true });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE /api/favorites/:productId — retirer d'un favori
router.delete('/:productId', authenticate, (req, res) => {
    try {
        db.prepare('DELETE FROM favorites WHERE userId = ? AND productId = ?').run(req.user.id, req.params.productId);
        res.json({ favorited: false });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
