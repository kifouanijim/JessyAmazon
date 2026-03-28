const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticate } = require('../middleware/auth');

// POST /api/promos/validate — valider un code promo
router.post('/validate', authenticate, (req, res) => {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Code requis' });

    try {
        const promo = db.prepare('SELECT * FROM promo_codes WHERE code = ? COLLATE NOCASE AND active = 1').get(code.trim());

        if (!promo) return res.status(404).json({ error: 'Code promo invalide ou expiré' });
        if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
            return res.status(400).json({ error: 'Ce code promo a expiré' });
        }
        if (promo.usedCount >= promo.maxUses) {
            return res.status(400).json({ error: 'Ce code promo a atteint sa limite d\'utilisation' });
        }
        if (orderTotal && orderTotal < promo.minOrder) {
            return res.status(400).json({ error: `Commande minimum de ${promo.minOrder.toLocaleString('fr-FR')} FCFA requise` });
        }

        const discount = promo.type === 'percent'
            ? Math.round((orderTotal || 0) * promo.value / 100)
            : promo.value;

        res.json({
            valid: true,
            promoId: promo.id,
            code: promo.code,
            type: promo.type,
            value: promo.value,
            discount,
            description: promo.type === 'percent' ? `-${promo.value}%` : `-${promo.value.toLocaleString('fr-FR')} FCFA`
        });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
