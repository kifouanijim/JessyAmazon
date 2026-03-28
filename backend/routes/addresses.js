const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticate } = require('../middleware/auth');

// GET /api/addresses
router.get('/', authenticate, (req, res) => {
    try {
        const addresses = db.prepare('SELECT * FROM user_addresses WHERE userId = ? ORDER BY isDefault DESC, createdAt DESC').all(req.user.id);
        res.json({ addresses });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/addresses
router.post('/', authenticate, (req, res) => {
    const { label, fullName, phone, address, city, isDefault } = req.body;
    if (!fullName || !phone || !address || !city) {
        return res.status(400).json({ error: 'Nom, téléphone, adresse et ville sont requis' });
    }
    try {
        if (isDefault) {
            db.prepare('UPDATE user_addresses SET isDefault = 0 WHERE userId = ?').run(req.user.id);
        }
        const result = db.prepare(
            'INSERT INTO user_addresses (userId, label, fullName, phone, address, city, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(req.user.id, label || 'Domicile', fullName, phone, address, city, isDefault ? 1 : 0);
        const newAddress = db.prepare('SELECT * FROM user_addresses WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ address: newAddress });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/addresses/:id
router.put('/:id', authenticate, (req, res) => {
    const { label, fullName, phone, address, city, isDefault } = req.body;
    try {
        const existing = db.prepare('SELECT * FROM user_addresses WHERE id = ? AND userId = ?').get(req.params.id, req.user.id);
        if (!existing) return res.status(404).json({ error: 'Adresse introuvable' });
        if (isDefault) {
            db.prepare('UPDATE user_addresses SET isDefault = 0 WHERE userId = ?').run(req.user.id);
        }
        db.prepare('UPDATE user_addresses SET label=?, fullName=?, phone=?, address=?, city=?, isDefault=? WHERE id=?')
            .run(label ?? existing.label, fullName ?? existing.fullName, phone ?? existing.phone,
                 address ?? existing.address, city ?? existing.city, isDefault ? 1 : existing.isDefault, req.params.id);
        const updated = db.prepare('SELECT * FROM user_addresses WHERE id = ?').get(req.params.id);
        res.json({ address: updated });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE /api/addresses/:id
router.delete('/:id', authenticate, (req, res) => {
    try {
        const existing = db.prepare('SELECT * FROM user_addresses WHERE id = ? AND userId = ?').get(req.params.id, req.user.id);
        if (!existing) return res.status(404).json({ error: 'Adresse introuvable' });
        db.prepare('DELETE FROM user_addresses WHERE id = ?').run(req.params.id);
        res.json({ message: 'Adresse supprimée' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
