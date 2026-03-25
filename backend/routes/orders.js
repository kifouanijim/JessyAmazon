const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticate } = require('../middleware/auth');

// POST /api/orders — passer une commande
router.post('/', authenticate, (req, res) => {
    const {
        items,
        deliveryName, deliveryPhone, deliveryAddress, deliveryCity,
        paymentMethod, deliveryMethod, notes
    } = req.body;

    if (!items || !items.length) {
        return res.status(400).json({ error: 'Le panier est vide' });
    }
    if (!deliveryName || !deliveryPhone || !deliveryAddress || !deliveryCity) {
        return res.status(400).json({ error: 'Les informations de livraison sont incomplètes' });
    }
    if (!paymentMethod) {
        return res.status(400).json({ error: 'Veuillez choisir un mode de paiement' });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = deliveryMethod === 'pickup' ? 0 : 2500;
    const total = subtotal + shippingCost;

    try {
        const orderResult = db.prepare(`
            INSERT INTO orders (userId, subtotal, shippingCost, total, deliveryName, deliveryPhone,
                deliveryAddress, deliveryCity, paymentMethod, deliveryMethod, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            req.user.id, subtotal, shippingCost, total,
            deliveryName, deliveryPhone, deliveryAddress, deliveryCity,
            paymentMethod, deliveryMethod || 'delivery', notes || ''
        );

        const orderId = orderResult.lastInsertRowid;

        const insertItem = db.prepare(
            'INSERT INTO order_items (orderId, productId, productName, price, quantity, sellerName) VALUES (?, ?, ?, ?, ?, ?)'
        );
        for (const item of items) {
            insertItem.run(orderId, String(item.id || item.productId), item.name || item.productName, item.price, item.quantity, item.seller || item.sellerName || '');
        }

        // Vider le panier
        db.prepare('DELETE FROM cart_items WHERE userId = ?').run(req.user.id);

        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
        const orderItems = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(orderId);

        res.status(201).json({ order: { ...order, items: orderItems } });
    } catch (err) {
        console.error('Erreur commande:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la création de la commande' });
    }
});

// GET /api/orders — liste des commandes de l'utilisateur
router.get('/', authenticate, (req, res) => {
    try {
        const orders = db.prepare('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
        const ordersWithItems = orders.map(order => ({
            ...order,
            items: db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id)
        }));
        res.json({ orders: ordersWithItems });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/orders/:id — détail d'une commande
router.get('/:id', authenticate, (req, res) => {
    try {
        const order = db.prepare('SELECT * FROM orders WHERE id = ? AND userId = ?')
            .get(req.params.id, req.user.id);
        if (!order) return res.status(404).json({ error: 'Commande introuvable' });

        const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
        res.json({ order: { ...order, items } });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
