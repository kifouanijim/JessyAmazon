const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticate } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const { sendOrderConfirmation } = require('../services/email');

// POST /api/orders — passer une commande
router.post('/', authenticate, (req, res) => {
    const {
        items,
        deliveryName, deliveryPhone, deliveryAddress, deliveryCity,
        paymentMethod, deliveryMethod, notes, promoCode, discount: promoDiscount
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
    const discount = promoDiscount || 0;
    const total = Math.max(0, subtotal + shippingCost - discount);

    try {
        // Vérification du stock disponible
        for (const item of items) {
            const pid = String(item.id || item.productId);
            const product = db.prepare('SELECT name, stock FROM products WHERE id = ?').get(pid);
            if (product && product.stock < item.quantity) {
                return res.status(400).json({ error: `Stock insuffisant pour "${product.name}" (disponible : ${product.stock})` });
            }
        }

        const orderResult = db.prepare(`
            INSERT INTO orders (userId, subtotal, shippingCost, discount, total, deliveryName, deliveryPhone,
                deliveryAddress, deliveryCity, paymentMethod, deliveryMethod, notes, promoCode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            req.user.id, subtotal, shippingCost, discount, total,
            deliveryName, deliveryPhone, deliveryAddress, deliveryCity,
            paymentMethod, deliveryMethod || 'delivery', notes || '', promoCode || ''
        );

        const orderId = orderResult.lastInsertRowid;

        const insertItem = db.prepare(
            'INSERT INTO order_items (orderId, productId, productName, price, quantity, sellerName) VALUES (?, ?, ?, ?, ?, ?)'
        );
        for (const item of items) {
            insertItem.run(orderId, String(item.id || item.productId), item.name || item.productName, item.price, item.quantity, item.seller || item.sellerName || '');
        }

        // Décrémenter le stock
        for (const item of items) {
            db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?')
                .run(item.quantity, String(item.id || item.productId));
        }

        // Vider le panier
        db.prepare('DELETE FROM cart_items WHERE userId = ?').run(req.user.id);

        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
        const orderItems = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(orderId);

        // Incrémenter l'utilisation du code promo
        if (promoCode) {
            db.prepare('UPDATE promo_codes SET usedCount = usedCount + 1 WHERE code = ? COLLATE NOCASE').run(promoCode);
        }

        // Envoyer l'email de confirmation (async, ne bloque pas la réponse)
        sendOrderConfirmation(req.user, { ...order, items: orderItems }).catch(err =>
            console.error('Erreur envoi email:', err)
        );

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

// PATCH /api/orders/:id/status — mettre à jour le statut (vendeur ou admin)
router.patch('/:id/status', authenticate, (req, res) => {
    const { status } = req.body;
    const validStatuses = ['En cours', 'Confirmée', 'En livraison', 'Livrée', 'Annulée'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
    }
    try {
        if (req.user.role === 'seller') {
            const hasItem = db.prepare(
                'SELECT oi.id FROM order_items oi WHERE oi.orderId = ? AND oi.sellerName = ?'
            ).get(req.params.id, req.user.fullName);
            if (!hasItem) return res.status(403).json({ error: 'Non autorisé' });
        }
        db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
        res.json({ order });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/orders/:id/invoice — Télécharger la facture PDF
router.get('/:id/invoice', authenticate, (req, res) => {
    try {
        const order = db.prepare('SELECT * FROM orders WHERE id = ? AND userId = ?')
            .get(req.params.id, req.user.id);
        if (!order) return res.status(404).json({ error: 'Commande introuvable' });

        const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
        const user = db.prepare('SELECT fullName, email, phone FROM users WHERE id = ?').get(order.userId);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="facture-${order.id}.pdf"`);
        doc.pipe(res);

        // En-tête
        doc.fontSize(22).fillColor('#4a634e').text('VotreMarché', 50, 50);
        doc.fontSize(10).fillColor('#666').text('Plateforme e-commerce Congo-Brazzaville', 50, 78);
        doc.fontSize(18).fillColor('#000').text(`FACTURE #${order.id}`, 350, 50, { align: 'right' });
        doc.fontSize(10).fillColor('#666').text(`Date : ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`, 350, 75, { align: 'right' });

        doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#e2e8f0').stroke();

        // Infos client
        doc.fontSize(11).fillColor('#000').text('Facturé à :', 50, 115);
        doc.fontSize(10).fillColor('#333')
            .text(user?.fullName || 'Client', 50, 132)
            .text(user?.email || '', 50, 148)
            .text(user?.phone || '', 50, 164);

        // Infos livraison
        doc.fontSize(11).fillColor('#000').text('Livraison :', 300, 115);
        doc.fontSize(10).fillColor('#333')
            .text(order.deliveryName || '', 300, 132)
            .text(order.deliveryAddress || '', 300, 148)
            .text(`${order.deliveryCity || ''} — ${order.deliveryPhone || ''}`, 300, 164);

        // Tableau articles
        const tableTop = 210;
        doc.moveTo(50, tableTop - 5).lineTo(545, tableTop - 5).strokeColor('#e2e8f0').stroke();
        doc.fontSize(10).fillColor('#fff').rect(50, tableTop, 495, 20).fill('#4a634e');
        doc.fillColor('#fff')
            .text('Article', 55, tableTop + 5)
            .text('Qté', 380, tableTop + 5, { width: 50, align: 'center' })
            .text('Prix unitaire', 430, tableTop + 5, { width: 80, align: 'right' })
            .text('Total', 460, tableTop + 5, { width: 80, align: 'right' });

        let y = tableTop + 30;
        items.forEach((item, i) => {
            if (i % 2 === 0) doc.rect(50, y - 5, 495, 22).fill('#f8fafc');
            doc.fillColor('#000')
                .text(item.productName, 55, y, { width: 320 })
                .text(String(item.quantity), 380, y, { width: 50, align: 'center' })
                .text(`${item.price.toLocaleString('fr-FR')} F`, 430, y, { width: 80, align: 'right' })
                .text(`${(item.price * item.quantity).toLocaleString('fr-FR')} F`, 460, y, { width: 80, align: 'right' });
            y += 25;
        });

        doc.moveTo(50, y).lineTo(545, y).strokeColor('#e2e8f0').stroke();
        y += 15;

        // Totaux
        const addLine = (label, value, bold = false) => {
            if (bold) doc.fontSize(12).fillColor('#000');
            else doc.fontSize(10).fillColor('#666');
            doc.text(label, 380, y).text(value, 460, y, { width: 80, align: 'right' });
            y += 20;
        };
        addLine('Sous-total :', `${order.subtotal.toLocaleString('fr-FR')} F`);
        addLine('Livraison :', `${order.shippingCost.toLocaleString('fr-FR')} F`);
        if (order.discount > 0) addLine('Réduction :', `-${order.discount.toLocaleString('fr-FR')} F`);
        addLine('TOTAL :', `${order.total.toLocaleString('fr-FR')} FCFA`, true);

        // Pied de page
        doc.fontSize(9).fillColor('#999').text('Merci pour votre achat sur VotreMarché !', 50, 750, { align: 'center', width: 495 });
        doc.end();
    } catch (err) {
        console.error('Erreur facture PDF:', err);
        if (!res.headersSent) res.status(500).json({ error: 'Erreur génération facture' });
    }
});

module.exports = router;
