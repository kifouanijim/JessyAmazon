const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticate, optionalAuth } = require('../middleware/auth');

// GET /api/products/mine — produits du vendeur connecté
router.get('/mine', authenticate, (req, res) => {
    if (req.user.role !== 'seller') {
        return res.status(403).json({ error: 'Réservé aux vendeurs' });
    }
    try {
        const products = db.prepare('SELECT * FROM products WHERE sellerId = ? ORDER BY createdAt DESC').all(req.user.id);
        res.json({ products });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/products/seller-orders — commandes contenant les produits du vendeur
router.get('/seller-orders', authenticate, (req, res) => {
    if (req.user.role !== 'seller') {
        return res.status(403).json({ error: 'Réservé aux vendeurs' });
    }
    try {
        const items = db.prepare(
            'SELECT DISTINCT orderId FROM order_items WHERE sellerName = ?'
        ).all(req.user.fullName);

        const orders = items.map(({ orderId }) => {
            const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
            const orderItems = db.prepare(
                'SELECT * FROM order_items WHERE orderId = ? AND sellerName = ?'
            ).all(orderId, req.user.fullName);
            return { ...order, items: orderItems };
        });

        res.json({ orders });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/products — liste avec filtre optionnel ?category=
router.get('/', (req, res) => {
    const { category, search, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    try {
        const products = db.prepare(query).all(...params);
        res.json({ products });
    } catch (err) {
        console.error('Erreur produits:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/products/:id — détail d'un produit
router.get('/:id', (req, res) => {
    try {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        if (!product) return res.status(404).json({ error: 'Produit introuvable' });
        res.json({ product });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/products — créer un produit (vendeur seulement)
router.post('/', authenticate, (req, res) => {
    if (req.user.role !== 'seller') {
        return res.status(403).json({ error: 'Réservé aux vendeurs' });
    }
    const { name, description, price, originalPrice, category, stock, imageUrl } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ error: 'Nom, prix et catégorie sont obligatoires' });
    }

    try {
        const result = db.prepare(
            'INSERT INTO products (name, description, price, originalPrice, category, sellerId, sellerName, stock, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(name, description || '', price, originalPrice || null, category, req.user.id, req.user.fullName, stock || 100, imageUrl || '');

        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ product });
    } catch (err) {
        console.error('Erreur création produit:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/products/:id — modifier un produit (propriétaire ou admin)
router.put('/:id', authenticate, (req, res) => {
    try {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        if (!product) return res.status(404).json({ error: 'Produit introuvable' });
        if (product.sellerId !== req.user.id) {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        const { name, description, price, originalPrice, stock, imageUrl } = req.body;
        db.prepare(
            'UPDATE products SET name=?, description=?, price=?, originalPrice=?, stock=?, imageUrl=? WHERE id=?'
        ).run(
            name || product.name,
            description !== undefined ? description : product.description,
            price || product.price,
            originalPrice !== undefined ? originalPrice : product.originalPrice,
            stock !== undefined ? stock : product.stock,
            imageUrl !== undefined ? imageUrl : product.imageUrl,
            req.params.id
        );

        const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        res.json({ product: updated });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE /api/products/:id — supprimer un produit
router.delete('/:id', authenticate, (req, res) => {
    try {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        if (!product) return res.status(404).json({ error: 'Produit introuvable' });
        if (product.sellerId !== req.user.id) {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
        res.json({ message: 'Produit supprimé' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
