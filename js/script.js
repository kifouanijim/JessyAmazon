/**
 * VotreMarché - Script JavaScript principal
 * Plateforme e-commerce Congo-Brazzaville
 */

// === INJECTION CSS NOTIFICATIONS ===
(function injectStyles() {
    const style = document.createElement('style');
    style.id = 'vm-styles';
    style.textContent = `
        .vm-notification {
            position: fixed; bottom: 20px; right: 20px; z-index: 9999;
            max-width: 380px; min-width: 280px;
            background: #1e293b; border: 1px solid #334155; border-radius: 12px;
            transform: translateX(130%); transition: transform 0.3s ease;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .vm-notification.show { transform: translateX(0); }
        .vm-notification.success { border-left: 4px solid #22c55e; }
        .vm-notification.error { border-left: 4px solid #ef4444; }
        .vm-notification.info { border-left: 4px solid #3b82f6; }
        .vm-notification-body {
            display: flex; align-items: center; justify-content: space-between;
            gap: 12px; padding: 14px 16px; color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px;
        }
        .vm-notification-close {
            background: none; border: none; color: #94a3b8; cursor: pointer;
            font-size: 20px; padding: 0; line-height: 1; flex-shrink: 0;
        }
        .vm-notification-close:hover { color: white; }
        .vm-field-error { color: #ef4444; font-size: 12px; margin-top: 4px; }
        input.vm-error, textarea.vm-error, select.vm-error { border-color: #ef4444 !important; outline-color: #ef4444; }
        .tab-panel { display: none; }
        .tab-panel.active { display: block; }
        .tab-button.active { border-bottom: 2px solid #f2c335; color: #f2c335; }
    `;
    document.head.appendChild(style);
})();

// === API ===
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/api'
    : 'https://jessyamazon.onrender.com/api';

// === CONFIGURATION ===
const CONFIG = {
    animationDuration: 300,
    mobileBreakpoint: 768,
    currency: 'FCFA',
    locale: 'fr-FR',
    SHIPPING_COST: 2500
};

// === BASE DE DONNÉES PRODUITS ===
const PRODUCTS_DB = [
    // Smartphones
    { id: 'sp1', name: 'Samsung Galaxy A54 5G', cat: 'smartphones', price: 185000, originalPrice: 220000, rating: 4.5, reviews: 234, seller: 'TechShop Congo', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&q=80' },
    { id: 'sp2', name: 'iPhone 14 (Reconditionné)', cat: 'smartphones', price: 350000, originalPrice: 420000, rating: 4.3, reviews: 89, seller: 'DigitalStore BZV', img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=300&fit=crop&q=80' },
    { id: 'sp3', name: 'Tecno Camon 20 Pro', cat: 'smartphones', price: 95000, originalPrice: 110000, rating: 4.0, reviews: 312, seller: 'MobileCongo', img: 'https://images.unsplash.com/photo-1573920111158-364c0c1e3f95?w=400&h=300&fit=crop&q=80' },
    { id: 'sp4', name: 'Infinix Hot 30i', cat: 'smartphones', price: 65000, originalPrice: 78000, rating: 3.9, reviews: 445, seller: 'MobileCongo', img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=300&fit=crop&q=80' },
    { id: 'sp5', name: 'Xiaomi Redmi Note 12', cat: 'smartphones', price: 120000, originalPrice: 145000, rating: 4.4, reviews: 178, seller: 'TechShop Congo', img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=300&fit=crop&q=80' },
    // Ordinateurs
    { id: 'pc1', name: 'Laptop HP 15 - Core i5 8Go RAM', cat: 'ordinateurs', price: 520000, originalPrice: 600000, rating: 4.4, reviews: 67, seller: 'TechShop Congo', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&q=80' },
    { id: 'pc2', name: 'Lenovo IdeaPad 3 - Core i3', cat: 'ordinateurs', price: 445000, originalPrice: 500000, rating: 4.2, reviews: 45, seller: 'DigitalStore BZV', img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop&q=80' },
    { id: 'pc3', name: 'Dell Inspiron 15 - Core i7', cat: 'ordinateurs', price: 750000, originalPrice: 900000, rating: 4.6, reviews: 34, seller: 'TechShop Congo', img: 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=400&h=300&fit=crop&q=80' },
    { id: 'pc4', name: 'Acer Aspire 5 - Core i5 512Go SSD', cat: 'ordinateurs', price: 485000, originalPrice: 560000, rating: 4.3, reviews: 56, seller: 'DigitalStore BZV', img: 'https://images.unsplash.com/photo-1484788984921-03950022c38b?w=400&h=300&fit=crop&q=80' },
    // Télévisions
    { id: 'tv1', name: 'TV Samsung 55" 4K UHD Smart', cat: 'televisions', price: 680000, originalPrice: 800000, rating: 4.6, reviews: 156, seller: 'ElectroKongo', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834d?w=400&h=300&fit=crop&q=80' },
    { id: 'tv2', name: 'TV Hisense 43" Full HD', cat: 'televisions', price: 310000, originalPrice: 360000, rating: 4.1, reviews: 89, seller: 'TechShop Congo', img: 'https://images.unsplash.com/photo-1571415060716-baff5ea4c8ac?w=400&h=300&fit=crop&q=80' },
    { id: 'tv3', name: 'TV TCL 32" HD Smart', cat: 'televisions', price: 185000, originalPrice: 220000, rating: 4.0, reviews: 201, seller: 'ElectroKongo', img: 'https://images.unsplash.com/photo-1612815988474-e2ca5570d6b5?w=400&h=300&fit=crop&q=80' },
    // Fruits & Légumes
    { id: 'fv1', name: 'Panier Légumes Frais 5kg', cat: 'fruits-legumes', price: 5000, originalPrice: 6500, rating: 4.7, reviews: 423, seller: 'Marché Bio Congo', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop&q=80' },
    { id: 'fv2', name: 'Régime de Bananes Locales', cat: 'fruits-legumes', price: 2500, originalPrice: 3000, rating: 4.8, reviews: 678, seller: 'Fermier Local', img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop&q=80' },
    { id: 'fv3', name: 'Tomates Fraîches 2kg', cat: 'fruits-legumes', price: 2000, originalPrice: 2500, rating: 4.6, reviews: 345, seller: 'Marché Bio Congo', img: 'https://images.unsplash.com/photo-1546069901-522a62d4c8a0?w=400&h=300&fit=crop&q=80' },
    { id: 'fv4', name: 'Avocats du Congo (sachet 6)', cat: 'fruits-legumes', price: 3500, originalPrice: 4000, rating: 4.9, reviews: 512, seller: 'Fermier Local', img: 'https://images.unsplash.com/photo-1601004890144-df86f4af0ac5?w=400&h=300&fit=crop&q=80' },
    // Viandes & Poissons
    { id: 'vp1', name: 'Poulet Entier (1.5kg)', cat: 'viandes-poissons', price: 8500, originalPrice: 10000, rating: 4.6, reviews: 234, seller: 'Boucherie du Congo', img: 'https://images.unsplash.com/photo-1607623814075-a6df5f1b802a?w=400&h=300&fit=crop&q=80' },
    { id: 'vp2', name: 'Capitaine Fumé (500g)', cat: 'viandes-poissons', price: 6000, originalPrice: 7000, rating: 4.8, reviews: 345, seller: 'Pêcherie Nationale', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&q=80' },
    { id: 'vp3', name: 'Bœuf Haché Frais (1kg)', cat: 'viandes-poissons', price: 12000, originalPrice: 14000, rating: 4.5, reviews: 189, seller: 'Boucherie du Congo', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&q=80' },
    { id: 'vp4', name: 'Tilapia Frais (1kg)', cat: 'viandes-poissons', price: 5500, originalPrice: 6500, rating: 4.7, reviews: 267, seller: 'Pêcherie Nationale', img: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=300&fit=crop&q=80' },
    // Épicerie
    { id: 'ep1', name: 'Riz Parfumé 25kg', cat: 'epicerie', price: 18000, originalPrice: 20000, rating: 4.5, reviews: 567, seller: 'GroceryKongo', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&q=80' },
    { id: 'ep2', name: 'Huile de Palme 5L', cat: 'epicerie', price: 9500, originalPrice: 11000, rating: 4.3, reviews: 289, seller: 'Produits du Congo', img: 'https://images.unsplash.com/photo-1474979266404-7f4ef851e755?w=400&h=300&fit=crop&q=80' },
    { id: 'ep3', name: 'Sucre de Canne 5kg', cat: 'epicerie', price: 4500, originalPrice: 5000, rating: 4.4, reviews: 412, seller: 'GroceryKongo', img: 'https://images.unsplash.com/photo-1558618047-3c75ece7c05a?w=400&h=300&fit=crop&q=80' },
    { id: 'ep4', name: 'Farine de Manioc 10kg', cat: 'epicerie', price: 7500, originalPrice: 9000, rating: 4.6, reviews: 334, seller: 'Produits du Congo', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&q=80' },
    // Mode Hommes
    { id: 'mh1', name: 'Chemise Wax Africaine Homme', cat: 'hommes', price: 15000, originalPrice: 18000, rating: 4.4, reviews: 123, seller: 'Mode Congo', img: 'https://images.unsplash.com/photo-1563630423-ba3c2c79e2d1?w=400&h=300&fit=crop&q=80' },
    { id: 'mh2', name: 'Jean Slim Homme Noir', cat: 'hommes', price: 22000, originalPrice: 25000, rating: 4.2, reviews: 89, seller: 'Fashion House BZV', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&q=80' },
    { id: 'mh3', name: 'Costume 2 Pièces Homme', cat: 'hommes', price: 85000, originalPrice: 100000, rating: 4.5, reviews: 56, seller: 'Élégance Congo', img: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=400&h=300&fit=crop&q=80' },
    { id: 'mh4', name: 'Boubou Traditionnel Homme', cat: 'hommes', price: 35000, originalPrice: 40000, rating: 4.7, reviews: 198, seller: 'Artisanat Congo', img: 'https://images.unsplash.com/photo-1590739225650-37bc7cb34231?w=400&h=300&fit=crop&q=80' },
    // Mode Femmes
    { id: 'mf1', name: 'Robe Wax Africaine', cat: 'femmes', price: 25000, originalPrice: 30000, rating: 4.8, reviews: 456, seller: 'Mode Congo', img: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=400&h=300&fit=crop&q=80' },
    { id: 'mf2', name: 'Ensemble Tailleur Femme', cat: 'femmes', price: 35000, originalPrice: 42000, rating: 4.6, reviews: 234, seller: 'Élégance Congo', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop&q=80' },
    { id: 'mf3', name: 'Sac à Main Cuir Premium', cat: 'femmes', price: 28000, originalPrice: 35000, rating: 4.4, reviews: 178, seller: 'Fashion House BZV', img: 'https://images.unsplash.com/photo-1584917865442-a7e2e3d8e4c9?w=400&h=300&fit=crop&q=80' },
    { id: 'mf4', name: 'Pagne Tissé 6 Mètres', cat: 'femmes', price: 18000, originalPrice: 22000, rating: 4.9, reviews: 623, seller: 'Tissage Congo', img: 'https://images.unsplash.com/photo-1558171813-6a0da4f7dd17?w=400&h=300&fit=crop&q=80' },
    // Mode Enfants
    { id: 'me1', name: 'Ensemble Scolaire Enfant (6-12 ans)', cat: 'enfants', price: 12000, originalPrice: 15000, rating: 4.5, reviews: 312, seller: 'Kids Fashion', img: 'https://images.unsplash.com/photo-1484820540004-14cf2b89bdb9?w=400&h=300&fit=crop&q=80' },
    { id: 'me2', name: 'Robe Wax Fille (4-8 ans)', cat: 'enfants', price: 8000, originalPrice: 10000, rating: 4.7, reviews: 267, seller: 'Kids Fashion', img: 'https://images.unsplash.com/photo-1530023879523-7a70c0feec3e?w=400&h=300&fit=crop&q=80' },
    { id: 'me3', name: 'Tenue de Sport Enfant', cat: 'enfants', price: 9500, originalPrice: 12000, rating: 4.3, reviews: 145, seller: 'SportKongo', img: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=400&h=300&fit=crop&q=80' },
    // Meubles
    { id: 'mb1', name: 'Canapé 3 Places Tissu Premium', cat: 'meubles', price: 285000, originalPrice: 320000, rating: 4.3, reviews: 67, seller: 'Mobilier Congo', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop&q=80' },
    { id: 'mb2', name: 'Bureau en Bois Massif', cat: 'meubles', price: 125000, originalPrice: 150000, rating: 4.4, reviews: 45, seller: 'Ébénisterie Congo', img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=300&fit=crop&q=80' },
    { id: 'mb3', name: 'Lit 2 places + Matelas inclus', cat: 'meubles', price: 320000, originalPrice: 380000, rating: 4.5, reviews: 89, seller: 'Mobilier Congo', img: 'https://images.unsplash.com/photo-1505693314914-d43a509c4c99?w=400&h=300&fit=crop&q=80' },
    // Décorations
    { id: 'dc1', name: 'Tableau Décoratif Africain 80x60', cat: 'decorations', price: 18000, originalPrice: 22000, rating: 4.7, reviews: 189, seller: 'Art Congo', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop&q=80' },
    { id: 'dc2', name: 'Vase en Terre Cuite Artisanal', cat: 'decorations', price: 12000, originalPrice: 15000, rating: 4.6, reviews: 134, seller: 'Artisanat Congo', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=80' },
    { id: 'dc3', name: 'Masque Traditionnel Décoratif', cat: 'decorations', price: 22000, originalPrice: 28000, rating: 4.8, reviews: 245, seller: 'Art Congo', img: 'https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&h=300&fit=crop&q=80' },
    // Outils de jardin
    { id: 'ot1', name: 'Kit Outils de Jardinage 8 pièces', cat: 'outils', price: 35000, originalPrice: 42000, rating: 4.5, reviews: 78, seller: 'GardenKongo', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&q=80' },
    { id: 'ot2', name: 'Arrosoir Inox 10 Litres', cat: 'outils', price: 8500, originalPrice: 10000, rating: 4.3, reviews: 56, seller: 'GardenKongo', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&q=80' },
];

const CAT_PARENTS = {
    'alimentation': ['fruits-legumes', 'viandes-poissons', 'epicerie'],
    'mode': ['hommes', 'femmes', 'enfants'],
    'electronique': ['smartphones', 'ordinateurs', 'televisions'],
    'maison': ['meubles', 'decorations', 'outils'],
};

const CAT_NAMES = {
    'alimentation': 'Alimentation & Boissons',
    'mode': 'Mode & Vêtements',
    'electronique': 'Électronique',
    'maison': 'Maison & Jardin',
    'fruits-legumes': 'Fruits & Légumes',
    'viandes-poissons': 'Viandes & Poissons',
    'epicerie': 'Épicerie',
    'hommes': 'Mode Homme',
    'femmes': 'Mode Femme',
    'enfants': 'Mode Enfants',
    'smartphones': 'Smartphones',
    'ordinateurs': 'Ordinateurs',
    'televisions': 'Télévisions',
    'meubles': 'Meubles',
    'decorations': 'Décorations',
    'outils': 'Outils de Jardin',
};

// === UTILS ===
class Utils {
    static formatCurrency(amount) {
        return amount.toLocaleString('fr-FR') + ' FCFA';
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    static showNotification(message, type = 'info') {
        const existing = document.querySelectorAll('.vm-notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `vm-notification ${type}`;
        const icons = { success: '✓', error: '✕', info: 'ℹ' };
        notification.innerHTML = `
            <div class="vm-notification-body">
                <span>${icons[type] || ''} ${message}</span>
                <button class="vm-notification-close">&times;</button>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        const hide = () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        };
        setTimeout(hide, 4000);
        notification.querySelector('.vm-notification-close').addEventListener('click', hide);
    }

    static validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    static validatePassword(password) {
        if (!password || password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
        if (!/[A-Z]/.test(password)) return 'Le mot de passe doit contenir au moins une lettre majuscule';
        if (!/[a-z]/.test(password)) return 'Le mot de passe doit contenir au moins une lettre minuscule';
        if (!/[0-9]/.test(password)) return 'Le mot de passe doit contenir au moins un chiffre';
        if (!/[!@#$%^&*\-_=+;:,.<>?]/.test(password)) return 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%...)';
        return null;
    }

    static validatePhone(phone) {
        return /^(\+242|242)?\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}$/.test(phone.replace(/\s/g, ''));
    }

    static renderStars(rating) {
        const full = Math.floor(rating);
        const half = (rating % 1) >= 0.5;
        let html = '';
        for (let i = 0; i < 5; i++) {
            if (i < full) html += '<i class="fas fa-star" style="color:#f2c335;font-size:11px;"></i>';
            else if (i === full && half) html += '<i class="fas fa-star-half-alt" style="color:#f2c335;font-size:11px;"></i>';
            else html += '<i class="far fa-star" style="color:#64748b;font-size:11px;"></i>';
        }
        return html;
    }
}

// === CART MANAGER ===
class CartManager {
    constructor() {
        this.cart = this._loadCart();
    }

    _loadCart() {
        try { return JSON.parse(localStorage.getItem('vm_cart') || '[]'); }
        catch { return []; }
    }

    _saveCart() {
        localStorage.setItem('vm_cart', JSON.stringify(this.cart));
    }

    _token() {
        return localStorage.getItem('vm_token') || '';
    }

    _isLoggedIn() {
        return !!this._token();
    }

    async _apiPost(product) {
        if (!this._isLoggedIn()) return;
        try {
            await fetch(API_BASE + '/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this._token() },
                body: JSON.stringify({
                    productId: String(product.id),
                    productName: product.name,
                    price: product.price,
                    quantity: product.quantity || 1,
                    sellerName: product.seller || ''
                })
            });
        } catch {}
    }

    async _apiDelete(productId) {
        if (!this._isLoggedIn()) return;
        try {
            await fetch(API_BASE + '/cart/' + productId, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + this._token() }
            });
        } catch {}
    }

    async _apiPut(productId, quantity) {
        if (!this._isLoggedIn()) return;
        try {
            await fetch(API_BASE + '/cart/' + productId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this._token() },
                body: JSON.stringify({ quantity })
            });
        } catch {}
    }

    async _apiClear() {
        if (!this._isLoggedIn()) return;
        try {
            await fetch(API_BASE + '/cart', {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + this._token() }
            });
        } catch {}
    }

    // Charge le panier depuis l'API (priorité sur localStorage)
    async syncFromAPI() {
        if (!this._isLoggedIn()) return;
        try {
            const res = await fetch(API_BASE + '/cart', {
                headers: { 'Authorization': 'Bearer ' + this._token() }
            });
            if (!res.ok) return;
            const data = await res.json();
            this.cart = (data.items || []).map(item => ({
                id: item.productId,
                name: item.productName,
                price: item.price,
                quantity: item.quantity,
                seller: item.sellerName || 'VotreMarché'
            }));
            this._saveCart();
            this.updateCartDisplay();
        } catch {}
    }

    addToCart(product) {
        const existing = this.cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += (product.quantity || 1);
        } else {
            this.cart.push({ ...product, quantity: product.quantity || 1 });
        }
        this._saveCart();
        this.updateCartDisplay();
        this._apiPost(product);
        Utils.showNotification(`"${product.name}" ajouté au panier !`, 'success');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this._saveCart();
        this.updateCartDisplay();
        this._apiDelete(productId);
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this._saveCart();
            this.updateCartDisplay();
            this._apiPut(productId, item.quantity);
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    clearCart() {
        this.cart = [];
        this._saveCart();
        this.updateCartDisplay();
        this._apiClear();
    }

    updateCartDisplay() {
        const count = this.getItemCount();
        document.querySelectorAll('a[href="panier.html"] span, .cart-badge, .cart-count').forEach(badge => {
            badge.textContent = count;
        });
    }
}

// === AUTH MANAGER ===
class AuthManager {
    constructor() {
        this.currentUser = this._loadCurrentUser();
    }

    _loadCurrentUser() {
        try { return JSON.parse(localStorage.getItem('vm_current_user')); }
        catch { return null; }
    }

    _setCurrentUser(user, token) {
        this.currentUser = user;
        if (user) {
            localStorage.setItem('vm_current_user', JSON.stringify(user));
            if (token) localStorage.setItem('vm_token', token);
        } else {
            localStorage.removeItem('vm_current_user');
            localStorage.removeItem('vm_token');
        }
    }

    getToken() {
        return localStorage.getItem('vm_token') || '';
    }

    isLoggedIn() { return !!this.currentUser; }

    logout() {
        this._setCurrentUser(null);
    }

    init() {
        this._updateHeader();
        this._handleLoginForm();
        this._handleRegisterForm();
        this._handleRegisterSellerForm();
        this._handleLogoutLinks();
    }

    _updateHeader() {
        const user = this.currentUser;
        if (!user) return;
        const profileUrl = user.role === 'seller' ? 'profil-vendeur.html' : 'profil-utilisateur.html';
        document.querySelectorAll('a[href="connexion.html"]').forEach(link => {
            if (link.closest('header') || link.closest('.sticky-header')) {
                link.href = profileUrl;
                link.textContent = user.fullName.split(' ')[0];
                link.style.background = '#4a634e';
                link.style.color = '#fff';
            }
        });
        document.querySelectorAll('a[href="inscription.html"]').forEach(link => {
            if (link.closest('header') || link.closest('.sticky-header')) {
                link.style.display = 'none';
            }
        });
    }

    _handleLoginForm() {
        const form = document.querySelector('form[action="/login"]');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const emailPhone = (document.getElementById('email_phone')?.value || '').trim();
            const password = document.getElementById('password')?.value || '';

            if (!emailPhone || !password) {
                Utils.showNotification('Veuillez remplir tous les champs', 'error');
                return;
            }

            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Connexion...';

            try {
                const res = await fetch(API_BASE + '/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ emailOrPhone: emailPhone, password })
                });
                const data = await res.json();
                if (!res.ok) {
                    Utils.showNotification(data.error || 'Identifiants incorrects', 'error');
                    btn.disabled = false;
                    btn.textContent = originalText;
                    return;
                }
                this._setCurrentUser(data.user, data.token);
                Utils.showNotification('Connexion réussie ! Bienvenue.', 'success');
                const redirect = data.user.role === 'seller' ? 'profil-vendeur.html' : 'profil-utilisateur.html';
                setTimeout(() => window.location.href = redirect, 1000);
            } catch {
                Utils.showNotification('Impossible de joindre le serveur. Vérifiez qu\'il est démarré (npm run dev).', 'error');
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }, true);
    }

    _handleRegisterSellerForm() {
        const form = document.querySelector('form[action="/register-seller"]');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const companyName = document.getElementById('company_name')?.value.trim() || '';
            const email = document.getElementById('email')?.value.trim() || '';
            const phone = document.getElementById('phone')?.value.trim() || '';
            const password = document.getElementById('password')?.value || '';
            const confirmPassword = document.getElementById('confirm_password')?.value || '';
            const address = document.getElementById('address')?.value?.trim() || '';

            if (!companyName || !email || !phone || !password) {
                Utils.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }
            const pwdErrSeller = Utils.validatePassword(password);
            if (pwdErrSeller) { Utils.showNotification(pwdErrSeller, 'error'); return; }
            if (confirmPassword && password !== confirmPassword) {
                Utils.showNotification('Les mots de passe ne correspondent pas', 'error');
                return;
            }

            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn?.textContent;
            if (btn) { btn.disabled = true; btn.textContent = 'Création en cours...'; }

            try {
                const res = await fetch(API_BASE + '/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullName: companyName, email, phone, password, address, role: 'seller' })
                });
                const data = await res.json();
                if (!res.ok) {
                    Utils.showNotification(data.error || 'Erreur lors de l\'inscription', 'error');
                    if (btn) { btn.disabled = false; btn.textContent = originalText; }
                    return;
                }
                this._setCurrentUser(data.user, data.token);
                Utils.showNotification('Boutique créée avec succès ! Bienvenue vendeur.', 'success');
                setTimeout(() => window.location.href = 'profil-vendeur.html', 1200);
            } catch {
                Utils.showNotification('Impossible de joindre le serveur. Vérifiez qu\'il est démarré (npm run dev).', 'error');
                if (btn) { btn.disabled = false; btn.textContent = originalText; }
            }
        }, true);
    }

    _handleRegisterForm() {
        const form = document.querySelector('form[action="/register-buyer"]');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const fullName = (document.getElementById('full_name')?.value || '').trim();
            const email = (document.getElementById('email')?.value || '').trim();
            const phone = (document.getElementById('phone')?.value || '').trim();
            const password = document.getElementById('password')?.value || '';
            const confirmPassword = document.getElementById('confirm_password')?.value || '';
            const address = (document.getElementById('address')?.value || '').trim();

            if (!fullName || !email || !phone || !password) {
                Utils.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }
            if (!Utils.validateEmail(email)) {
                Utils.showNotification('Adresse email invalide', 'error');
                return;
            }
            const pwdError = Utils.validatePassword(password);
            if (pwdError) { Utils.showNotification(pwdError, 'error'); return; }
            if (password !== confirmPassword) {
                Utils.showNotification('Les mots de passe ne correspondent pas', 'error');
                return;
            }

            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Création du compte...';

            try {
                const res = await fetch(API_BASE + '/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullName, email, phone, password, address, role: 'buyer' })
                });
                const data = await res.json();
                if (!res.ok) {
                    Utils.showNotification(data.error || 'Erreur lors de l\'inscription', 'error');
                    btn.disabled = false;
                    btn.textContent = originalText;
                    return;
                }
                this._setCurrentUser(data.user, data.token);
                Utils.showNotification('Compte créé avec succès ! Bienvenue sur VotreMarché.', 'success');
                setTimeout(() => window.location.href = 'profil-utilisateur.html', 1200);
            } catch {
                Utils.showNotification('Impossible de joindre le serveur. Vérifiez qu\'il est démarré (npm run dev).', 'error');
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }, true);
    }

    _handleLogoutLinks() {
        document.querySelectorAll('a[href="deconnexion.html"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
                Utils.showNotification('Vous avez été déconnecté', 'info');
                setTimeout(() => window.location.href = 'index.html', 800);
            });
        });
    }
}

// === PRODUCTS PAGE (liste-produits.html) ===
class ProductsPage {
    constructor() {
        this.grid = document.getElementById('products-grid');
        if (!this.grid) return;

        const params = new URLSearchParams(window.location.search);
        this.cat = params.get('cat') || '';
        this.search = params.get('search') || '';
        this.sortBy = 'default';
        this.init();
    }

    _normalize(p) {
        return {
            id: String(p.id),
            name: p.name,
            cat: p.category,
            price: p.price,
            originalPrice: p.originalPrice || p.price,
            seller: p.sellerName || 'VotreMarché',
            rating: p.rating || 4.0,
            reviews: p.reviewCount || 0,
            img: p.imageUrl || '',
            stock: p.stock
        };
    }

    async fetchProducts() {
        // Mode recherche — tous les produits correspondants
        if (this.search) {
            try {
                const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(this.search)}&limit=100`);
                if (!res.ok) return [];
                const data = await res.json();
                return (data.products || []).map(p => this._normalize(p));
            } catch { return []; }
        }

        // Mode catégorie
        const cat = this.cat || 'electronique';
        const cats = CAT_PARENTS[cat] ? CAT_PARENTS[cat] : [cat];
        let all = [];
        for (const c of cats) {
            try {
                const res = await fetch(`${API_BASE}/products?category=${encodeURIComponent(c)}&limit=100`);
                if (!res.ok) continue;
                const data = await res.json();
                all = all.concat(data.products || []);
            } catch {}
        }
        return all.map(p => this._normalize(p));
    }

    _sort(products) {
        if (this.sortBy === 'price-asc') return [...products].sort((a, b) => a.price - b.price);
        if (this.sortBy === 'price-desc') return [...products].sort((a, b) => b.price - a.price);
        if (this.sortBy === 'rating') return [...products].sort((a, b) => b.rating - a.rating);
        return products;
    }

    renderCard(product) {
        const discount = product.originalPrice > product.price
            ? Math.round((1 - product.price / product.originalPrice) * 100)
            : 0;
        const catIcons = {
            smartphones: 'fa-mobile-alt', ordinateurs: 'fa-laptop', televisions: 'fa-tv',
            'fruits-legumes': 'fa-apple-alt', 'viandes-poissons': 'fa-fish', epicerie: 'fa-shopping-basket',
            hommes: 'fa-male', femmes: 'fa-female', enfants: 'fa-child',
            meubles: 'fa-couch', decorations: 'fa-paint-brush', outils: 'fa-tools'
        };
        const icon = catIcons[product.cat] || 'fa-box';
        const imgHtml = product.img
            ? `<img src="${product.img}" alt="${product.name}" class="absolute inset-0 w-full h-full object-cover" loading="lazy" onerror="this.style.display='none'">`
            : '';
        const discountBadge = discount > 0
            ? `<span class="absolute top-2 right-2 bg-vm-accent text-black text-xs font-bold px-2 py-1 rounded-full" style="z-index:1;">-${discount}%</span>`
            : '';
        const outOfStock = product.stock === 0
            ? `<span class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full" style="z-index:1;">Rupture</span>`
            : '';
        return `
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-vm-accent transition-all duration-300 hover:scale-[1.02] flex flex-col">
                <div class="relative bg-slate-700/50 h-44 flex items-center justify-center overflow-hidden">
                    <i class="fas ${icon} text-vm-accent" style="font-size:48px;opacity:0.4;"></i>
                    ${imgHtml}
                    ${discountBadge}
                    ${outOfStock}
                </div>
                <div class="p-4 flex flex-col flex-grow">
                    <h3 class="font-semibold text-white mb-1 text-sm leading-tight line-clamp-2">${product.name}</h3>
                    <p class="text-slate-400 text-xs mb-2">par ${product.seller}</p>
                    <div class="flex items-center gap-1 mb-3">
                        ${Utils.renderStars(product.rating)}
                        <span class="text-slate-400 text-xs ml-1">(${product.reviews})</span>
                    </div>
                    <div class="mt-auto">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-vm-accent font-bold">${Utils.formatCurrency(product.price)}</span>
                            ${product.originalPrice > product.price ? `<span class="text-slate-500 text-xs line-through">${Utils.formatCurrency(product.originalPrice)}</span>` : ''}
                        </div>
                        <button
                            class="w-full py-2 bg-vm-accent text-black rounded-lg text-sm font-semibold hover:scale-105 transition btn-add-to-cart"
                            data-id="${product.id}" data-name="${product.name}"
                            data-price="${product.price}" data-seller="${product.seller}"
                            ${product.stock === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                            <i class="fas fa-cart-plus mr-1"></i> ${product.stock === 0 ? 'Indisponible' : 'Ajouter au panier'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    init() {
        const catName = this.search
            ? `Résultats pour "${this.search}"`
            : (CAT_NAMES[this.cat] || this.cat || 'Produits');
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = catName;
        document.title = catName + ' - VotreMarché';

        const breadcrumbCat = document.getElementById('breadcrumb-cat');
        if (breadcrumbCat) breadcrumbCat.textContent = catName;

        const sortEl = document.getElementById('sort-select');
        if (sortEl) {
            sortEl.addEventListener('change', () => {
                this.sortBy = sortEl.value;
                this.renderProducts();
            });
        }

        this.renderProducts();
    }

    async renderProducts() {
        // Loader
        this.grid.innerHTML = `
            <div class="col-span-full text-center py-16 text-slate-400">
                <i class="fas fa-spinner fa-spin text-4xl mb-4 block text-vm-accent"></i>
                <p>Chargement des produits...</p>
            </div>`;

        const products = this._sort(await this.fetchProducts());

        const countEl = document.getElementById('product-count');
        if (countEl) countEl.textContent = `${products.length} produit${products.length !== 1 ? 's' : ''}`;

        if (products.length === 0) {
            this.grid.innerHTML = `
                <div class="col-span-full text-center py-16 text-slate-400">
                    <i class="fas fa-box-open text-5xl mb-4 block opacity-50"></i>
                    <p class="text-xl">Aucun produit dans cette catégorie pour le moment</p>
                    <p class="text-sm mt-2">Les vendeurs n'ont pas encore ajouté de produits ici.</p>
                    <a href="categories.html" class="inline-block mt-4 px-6 py-2 bg-vm-accent text-black rounded-lg font-semibold">Voir toutes les catégories</a>
                </div>`;
            return;
        }

        this.grid.innerHTML = products.map(p => this.renderCard(p)).join('');

        this.grid.querySelectorAll('.btn-add-to-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                cartManager.addToCart({
                    id: btn.dataset.id,
                    name: btn.dataset.name,
                    price: parseInt(btn.dataset.price),
                    seller: btn.dataset.seller
                });
            });
        });
    }
}

// === PANIER PAGE ===
class PanierPage {
    constructor() {
        this.container = document.querySelector('.cart-items');
        if (!this.container) return;
        this.render();
    }

    render() {
        const cart = cartManager.cart;
        if (cart.length === 0) {
            this.container.innerHTML = `
                <div style="text-align:center;padding:60px 20px;color:#94a3b8;">
                    <i class="fas fa-shopping-cart" style="font-size:64px;margin-bottom:24px;display:block;opacity:0.4;"></i>
                    <h3 style="font-size:22px;margin-bottom:12px;color:#fff;">Votre panier est vide</h3>
                    <p>Découvrez nos produits et commencez vos achats !</p>
                    <a href="categories.html" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#f2c335;color:#000;border-radius:8px;font-weight:bold;text-decoration:none;">
                        Explorer les catégories
                    </a>
                </div>`;
            this.updateTotals();
            return;
        }

        this.container.innerHTML = cart.map(item => this.renderItem(item)).join('');
        this.updateTotals();
        this.attachListeners();
    }

    renderItem(item) {
        return `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-content">
                    <div style="width:80px;height:80px;background:#334155;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-image" style="color:#64748b;font-size:24px;"></i>
                    </div>
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${item.name}</h3>
                        <p class="cart-item-vendor">Vendu par : <span style="color:#f2c335;">${item.seller || 'VotreMarché'}</span></p>
                        <div class="cart-item-actions">
                            <div class="quantity-control">
                                <label class="quantity-label">Quantité :</label>
                                <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}">
                                <button class="btn btn-outline btn-sm update-quantity-btn" data-id="${item.id}">Mettre à jour</button>
                            </div>
                            <button class="btn btn-danger btn-sm remove-item-btn" data-id="${item.id}">
                                <i class="fas fa-trash"></i> Supprimer
                            </button>
                        </div>
                    </div>
                    <div class="cart-item-price">
                        <span class="price-amount">${Utils.formatCurrency(item.price)}</span>
                        <small style="color:#94a3b8;display:block;">x${item.quantity} = ${Utils.formatCurrency(item.price * item.quantity)}</small>
                    </div>
                </div>
            </div>`;
    }

    updateTotals() {
        const subtotal = cartManager.getCartTotal();
        const shipping = cartManager.cart.length > 0 ? CONFIG.SHIPPING_COST : 0;
        const total = subtotal + shipping;

        const subtotalEl = document.querySelector('.summary-item:nth-child(1) span:last-child');
        const shippingEl = document.querySelector('.summary-item:nth-child(2) span:last-child');
        const totalEl = document.querySelector('.summary-item.summary-total span:last-child');

        if (subtotalEl) subtotalEl.textContent = Utils.formatCurrency(subtotal);
        if (shippingEl) shippingEl.textContent = cartManager.cart.length > 0 ? Utils.formatCurrency(shipping) : 'Gratuit';
        if (totalEl) totalEl.textContent = Utils.formatCurrency(total);
    }

    attachListeners() {
        this.container.querySelectorAll('.update-quantity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = this.container.querySelector(`input[data-id="${btn.dataset.id}"]`);
                const qty = parseInt(input.value);
                if (!qty || qty < 1) { input.value = 1; return; }
                cartManager.updateQuantity(btn.dataset.id, qty);
                this.updateTotals();
            });
        });

        this.container.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Supprimer cet article du panier ?')) {
                    cartManager.removeFromCart(btn.dataset.id);
                    this.render();
                }
            });
        });
    }
}

// === PROFILE PAGE ===
class ProfilePage {
    constructor() {
        const isProfilePage = window.location.pathname.includes('profil-utilisateur');
        if (!isProfilePage) return;
        this.init();
    }

    async init() {
        const user = authManager?.currentUser;
        if (!user) {
            Utils.showNotification('Veuillez vous connecter pour accéder à votre profil', 'error');
            setTimeout(() => window.location.href = 'connexion.html', 1500);
            return;
        }
        this.populateUserData(user);
        this.setupDashboardNav();
        await this.loadOrders();
        await this.loadFavorites();
        await this.loadAddresses();
    }

    populateUserData(user) {
        const fields = {
            '#username, .user-name, .profile-name, #profile-name': user.fullName,
            '.user-email, .profile-email, #profile-email': user.email,
            '.user-phone, .profile-phone, #profile-phone': user.phone || 'Non renseigné',
            '.user-address, .profile-address, #profile-address': user.address || 'Non renseigné',
            '#profile-member-since': new Date(user.createdAt).toLocaleDateString('fr-FR'),
        };
        Object.entries(fields).forEach(([sel, val]) => {
            document.querySelectorAll(sel).forEach(el => el.textContent = val);
        });
        const nameInput = document.getElementById('edit-name');
        const emailInput = document.getElementById('edit-email');
        const phoneInput = document.getElementById('edit-phone');
        if (nameInput) nameInput.value = user.fullName;
        if (emailInput) emailInput.value = user.email;
        if (phoneInput) phoneInput.value = user.phone || '';
    }

    setupDashboardNav() {
        document.querySelectorAll('.dashboard-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.dataset.target;
                document.querySelectorAll('.dashboard-link').forEach(l => l.classList.remove('active'));
                document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
                link.classList.add('active');
                const section = document.getElementById(target);
                if (section) section.classList.add('active');
            });
        });
    }

    async loadOrders() {
        const list = document.getElementById('orders-list');
        if (!list) return;
        const token = authManager.getToken();
        if (!token) return;

        list.innerHTML = '<div style="text-align:center;padding:32px;color:#64748b;"><i class="fas fa-spinner fa-spin" style="font-size:32px;"></i></div>';

        try {
            const res = await fetch(API_BASE + '/orders', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error();
            const { orders } = await res.json();

            if (!orders.length) {
                list.innerHTML = `
                    <div style="text-align:center;padding:48px 24px;color:#64748b;">
                        <i class="fas fa-shopping-bag" style="font-size:48px;margin-bottom:16px;display:block;"></i>
                        <p>Vous n'avez pas encore de commandes.</p>
                        <a href="categories.html" class="btn btn-primary" style="margin-top:12px;">
                            <i class="fas fa-store"></i> Parcourir les produits
                        </a>
                    </div>`;
                return;
            }

            const statusColors = {
                'En cours': '#f59e0b', 'Confirmée': '#3b82f6',
                'En livraison': '#8b5cf6', 'Livrée': '#22c55e', 'Annulée': '#ef4444'
            };
            const statusIcons = {
                'En cours': 'fa-clock', 'Confirmée': 'fa-check-circle',
                'En livraison': 'fa-truck', 'Livrée': 'fa-box-open', 'Annulée': 'fa-times-circle'
            };

            list.innerHTML = orders.map(order => {
                const color = statusColors[order.status] || '#64748b';
                const icon = statusIcons[order.status] || 'fa-circle';
                const itemsText = (order.items || []).map(i => `${i.productName} ×${i.quantity}`).join(', ');
                return `
                    <div style="border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:16px;background:#1e293b;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
                            <div>
                                <span style="font-weight:bold;color:#fff;">Commande #${order.id}</span>
                                <span style="color:#64748b;font-size:12px;margin-left:10px;">${new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <span style="background:${color}22;color:${color};border:1px solid ${color};padding:3px 12px;border-radius:20px;font-size:12px;font-weight:600;">
                                <i class="fas ${icon}" style="margin-right:4px;"></i>${order.status}
                            </span>
                        </div>
                        <p style="color:#94a3b8;font-size:13px;margin-bottom:10px;">${itemsText || 'Articles non disponibles'}</p>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                            <span style="color:#f2c335;font-weight:bold;">${Utils.formatCurrency(order.total)}</span>
                            <a href="${API_BASE}/orders/${order.id}/invoice?token=${authManager.getToken()}"
                               target="_blank"
                               style="font-size:12px;color:#94a3b8;text-decoration:none;padding:4px 10px;border:1px solid #334155;border-radius:6px;display:inline-flex;align-items:center;gap:4px;">
                                <i class="fas fa-file-pdf" style="color:#ef4444;"></i> Facture PDF
                            </a>
                        </div>
                    </div>`;
            }).join('');
        } catch {
            list.innerHTML = '<p style="color:#ef4444;text-align:center;padding:24px;">Erreur lors du chargement des commandes.</p>';
        }
    }

    async loadFavorites() {
        const grid = document.querySelector('.favorites-grid');
        if (!grid) return;
        const token = authManager.getToken();
        if (!token) return;

        grid.innerHTML = '<div style="text-align:center;padding:32px;color:#64748b;"><i class="fas fa-spinner fa-spin" style="font-size:32px;"></i></div>';

        try {
            const res = await fetch(API_BASE + '/favorites', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error();
            const { favorites } = await res.json();

            if (!favorites.length) {
                grid.innerHTML = `
                    <div style="text-align:center;padding:48px;color:#64748b;grid-column:1/-1;">
                        <i class="fas fa-heart" style="font-size:48px;margin-bottom:16px;display:block;opacity:0.3;"></i>
                        <p>Vous n'avez pas encore de favoris.</p>
                        <a href="categories.html" class="btn btn-primary" style="margin-top:12px;">Découvrir des produits</a>
                    </div>`;
                return;
            }

            grid.innerHTML = favorites.map(f => `
                <div style="border:1px solid #334155;border-radius:12px;overflow:hidden;background:#1e293b;">
                    <div style="height:120px;background:#0f172a;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                        ${f.imageUrl
                            ? `<img src="${f.imageUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-image\\' style=\\'color:#334155;font-size:32px;\\'></i>'">`
                            : '<i class="fas fa-image" style="color:#334155;font-size:32px;"></i>'}
                    </div>
                    <div style="padding:12px;">
                        <h3 style="font-size:13px;font-weight:600;color:#fff;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.name}</h3>
                        <p style="color:#f2c335;font-weight:bold;margin-bottom:10px;">${Utils.formatCurrency(f.price)}</p>
                        <div style="display:flex;gap:8px;">
                            <button class="btn btn-primary btn-sm fav-add-cart"
                                data-id="${f.productId}" data-name="${f.name.replace(/"/g,'&quot;')}"
                                data-price="${f.price}" data-seller="${f.sellerName || ''}">
                                <i class="fas fa-cart-plus"></i>
                            </button>
                            <button class="btn btn-danger btn-sm fav-remove-btn" data-product-id="${f.productId}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>`).join('');

            grid.querySelectorAll('.fav-add-cart').forEach(btn => {
                btn.addEventListener('click', () => {
                    cartManager.addToCart({
                        id: btn.dataset.id, name: btn.dataset.name,
                        price: parseInt(btn.dataset.price), seller: btn.dataset.seller
                    });
                });
            });
            grid.querySelectorAll('.fav-remove-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    await fetch(`${API_BASE}/favorites/${btn.dataset.productId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': 'Bearer ' + authManager.getToken() }
                    });
                    this.loadFavorites();
                });
            });
        } catch {
            grid.innerHTML = '<p style="color:#ef4444;text-align:center;padding:24px;">Erreur lors du chargement des favoris.</p>';
        }
    }

    async loadAddresses() {
        const container = document.querySelector('.addresses-list');
        if (!container) return;
        const token = authManager.getToken();
        if (!token) return;

        try {
            const res = await fetch(API_BASE + '/addresses', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) return;
            const { addresses } = await res.json();

            const addBtn = `
                <button id="add-address-btn" class="btn btn-primary" style="margin-top:16px;">
                    <i class="fas fa-plus"></i> Ajouter une adresse
                </button>
                <div id="add-address-form" style="display:none;margin-top:16px;padding:16px;border:1px solid #334155;border-radius:8px;background:#1e293b;">
                    <h4 style="margin-bottom:12px;">Nouvelle adresse</h4>
                    <div style="display:grid;gap:10px;">
                        <input id="addr-label" placeholder="Libellé (ex: Domicile)" style="padding:8px;background:#0f172a;border:1px solid #334155;border-radius:6px;color:#fff;">
                        <input id="addr-fullname" placeholder="Nom complet *" style="padding:8px;background:#0f172a;border:1px solid #334155;border-radius:6px;color:#fff;">
                        <input id="addr-phone" placeholder="Téléphone *" style="padding:8px;background:#0f172a;border:1px solid #334155;border-radius:6px;color:#fff;">
                        <input id="addr-address" placeholder="Adresse *" style="padding:8px;background:#0f172a;border:1px solid #334155;border-radius:6px;color:#fff;">
                        <select id="addr-city" style="padding:8px;background:#0f172a;border:1px solid #334155;border-radius:6px;color:#fff;">
                            <option value="">Ville *</option>
                            <option value="Brazzaville">Brazzaville</option>
                            <option value="Pointe-Noire">Pointe-Noire</option>
                            <option value="Dolisie">Dolisie</option>
                        </select>
                        <label style="display:flex;align-items:center;gap:8px;color:#94a3b8;font-size:13px;">
                            <input type="checkbox" id="addr-default"> Adresse par défaut
                        </label>
                        <div style="display:flex;gap:8px;">
                            <button id="addr-save-btn" class="btn btn-primary btn-sm">Enregistrer</button>
                            <button id="addr-cancel-btn" class="btn btn-outline btn-sm">Annuler</button>
                        </div>
                    </div>
                </div>`;

            if (!addresses.length) {
                container.innerHTML = `<p style="color:#64748b;padding:24px 0;">Aucune adresse enregistrée.</p>${addBtn}`;
            } else {
                container.innerHTML = addresses.map(a => `
                    <div style="border:1px solid ${a.isDefault ? '#4a634e' : '#334155'};border-radius:10px;padding:16px;margin-bottom:12px;background:#1e293b;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                            <div>
                                <span style="font-weight:600;color:#fff;">${a.label}</span>
                                ${a.isDefault ? '<span style="margin-left:8px;font-size:11px;background:#4a634e;color:#fff;padding:2px 8px;border-radius:10px;">Par défaut</span>' : ''}
                                <p style="color:#94a3b8;font-size:13px;margin-top:4px;">${a.fullName} — ${a.phone}</p>
                                <p style="color:#94a3b8;font-size:13px;">${a.address}, ${a.city}</p>
                            </div>
                            <button class="btn btn-danger btn-sm addr-delete-btn" data-id="${a.id}" style="flex-shrink:0;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>`).join('') + addBtn;
            }

            // Toggle formulaire
            document.getElementById('add-address-btn')?.addEventListener('click', () => {
                document.getElementById('add-address-form').style.display = 'block';
            });
            document.getElementById('addr-cancel-btn')?.addEventListener('click', () => {
                document.getElementById('add-address-form').style.display = 'none';
            });

            // Sauvegarder
            document.getElementById('addr-save-btn')?.addEventListener('click', async () => {
                const payload = {
                    label: document.getElementById('addr-label').value || 'Domicile',
                    fullName: document.getElementById('addr-fullname').value,
                    phone: document.getElementById('addr-phone').value,
                    address: document.getElementById('addr-address').value,
                    city: document.getElementById('addr-city').value,
                    isDefault: document.getElementById('addr-default').checked
                };
                if (!payload.fullName || !payload.phone || !payload.address || !payload.city) {
                    Utils.showNotification('Remplissez tous les champs obligatoires', 'error');
                    return;
                }
                const r = await fetch(API_BASE + '/addresses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authManager.getToken() },
                    body: JSON.stringify(payload)
                });
                if (r.ok) {
                    Utils.showNotification('Adresse ajoutée !', 'success');
                    this.loadAddresses();
                } else {
                    const d = await r.json();
                    Utils.showNotification(d.error || 'Erreur', 'error');
                }
            });

            // Supprimer
            container.querySelectorAll('.addr-delete-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Supprimer cette adresse ?')) return;
                    await fetch(`${API_BASE}/addresses/${btn.dataset.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': 'Bearer ' + authManager.getToken() }
                    });
                    this.loadAddresses();
                });
            });
        } catch {
            container.innerHTML = '<p style="color:#ef4444;">Erreur lors du chargement des adresses.</p>';
        }
    }
}

// === TAB MANAGER (for produits.html) ===
class TabManager {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('.tab-button[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.tab;
                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel, .tab-content > div').forEach(p => {
                    p.classList.remove('active');
                    p.style.display = 'none';
                });
                btn.classList.add('active');
                const target = document.getElementById(targetId);
                if (target) {
                    target.classList.add('active');
                    target.style.display = 'block';
                }
            });
        });

        // Activate first tab on load
        const firstBtn = document.querySelector('.tab-button');
        if (firstBtn) firstBtn.click();
    }
}

// === MOBILE NAVIGATION ===
class MobileNavigation {
    constructor() {
        this.toggle = document.querySelector('.mobile-menu-toggle');
        this.menu = document.getElementById('mobile-menu');
        this.init();
    }

    init() {
        if (!this.toggle || !this.menu) return;
        this.toggle.addEventListener('click', () => {
            const expanded = this.toggle.getAttribute('aria-expanded') === 'true';
            this.toggle.setAttribute('aria-expanded', !expanded);
            this.menu.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target) && !this.toggle.contains(e.target)) {
                this.menu.classList.remove('active');
                this.toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

// === SEARCH MANAGER ===
class SearchManager {
    constructor() {
        this.inputs = document.querySelectorAll('input[type="search"]');
        this.init();
    }

    init() {
        if (!this.inputs.length) return;
        this.inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = input.value.trim();
                    if (query.length >= 2) {
                        window.location.href = `liste-produits.html?search=${encodeURIComponent(query)}`;
                    }
                }
            });
            // Aussi sur le bouton icône loupe à côté
            const icon = input.parentElement?.querySelector('.search-icon, button[type="submit"]');
            if (icon) {
                icon.style.cursor = 'pointer';
                icon.addEventListener('click', () => {
                    const query = input.value.trim();
                    if (query.length >= 2) {
                        window.location.href = `liste-produits.html?search=${encodeURIComponent(query)}`;
                    }
                });
            }
        });

        // Pré-remplir si on arrive depuis une recherche
        const searchParam = new URLSearchParams(window.location.search).get('search');
        if (searchParam) this.inputs.forEach(i => i.value = searchParam);
    }
}

// === PRODUCT PAGE (produits.html) ===
class ProductDetailPage {
    constructor() {
        const isProductPage = document.querySelector('.add-to-cart-btn, .add-to-cart');
        if (!isProductPage) return;
        this.init();
    }

    init() {
        // Quantity +/- buttons
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = document.getElementById('quantity') || document.querySelector('.quantity-input');
                if (!input) return;
                let val = parseInt(input.value) || 1;
                if (btn.dataset.action === 'increase') val++;
                else if (btn.dataset.action === 'decrease' && val > 1) val--;
                input.value = val;
            });
        });

        // Add to cart
        document.querySelectorAll('.add-to-cart-btn, .add-to-cart, .btn-add-to-cart').forEach(btn => {
            if (btn.dataset.bound) return;
            btn.dataset.bound = '1';
            btn.addEventListener('click', () => {
                const title = document.querySelector('.product-title, h1')?.textContent || 'Produit';
                const priceText = document.querySelector('.current-price')?.textContent || '0';
                const price = parseInt(priceText.replace(/\D/g, '')) || 0;
                const qty = parseInt(document.getElementById('quantity')?.value || 1);
                cartManager.addToCart({
                    id: 'prod_' + Date.now(),
                    name: title,
                    price: price,
                    quantity: qty,
                    seller: 'VotreMarché'
                });
            });
        });

        // Image thumbnails
        const mainImage = document.querySelector('.main-product-image, .main-image');
        document.querySelectorAll('.thumbnail-image, .product-thumbnail img').forEach(thumb => {
            thumb.addEventListener('click', () => {
                if (mainImage) mainImage.src = thumb.src;
                document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
                thumb.closest('.product-thumbnail')?.classList.add('active');
            });
        });

        // Color/size options
        document.querySelectorAll('.color-option, .size-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const group = opt.parentElement;
                group.querySelectorAll('.color-option, .size-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            });
        });
    }
}

// === FAQ TOGGLE ===
class FAQManager {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const isExpanded = question.getAttribute('aria-expanded') === 'true';
                question.setAttribute('aria-expanded', !isExpanded);
                if (answer) answer.classList.toggle('active', !isExpanded);
            });
        });
    }
}

// === CHECKOUT (paiement.html) SUMMARY FILL ===
class CheckoutManager {
    constructor() {
        const isCheckout = document.querySelector('.checkout-form');
        if (!isCheckout) return;
        this.init();
    }

    init() {
        this._promoDiscount = 0;
        this._promoCode = '';
        this._fillSummary();
        this._setupStepButtons();
        this._setupPromoCode();
    }

    _setupPromoCode() {
        const btn = document.getElementById('apply-promo-btn');
        if (!btn) return;
        btn.addEventListener('click', async () => {
            const code = document.getElementById('promo-input')?.value?.trim();
            const resultEl = document.getElementById('promo-result');
            if (!code) return;
            const token = authManager?.getToken();
            if (!token) {
                resultEl.style.display = 'block';
                resultEl.style.color = '#ef4444';
                resultEl.textContent = 'Connectez-vous pour utiliser un code promo.';
                return;
            }
            btn.disabled = true;
            btn.textContent = '...';
            try {
                const subtotal = cartManager.getCartTotal();
                const res = await fetch(API_BASE + '/promos/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify({ code, orderTotal: subtotal + CONFIG.SHIPPING_COST })
                });
                const data = await res.json();
                resultEl.style.display = 'block';
                if (!res.ok) {
                    resultEl.style.color = '#ef4444';
                    resultEl.textContent = '✕ ' + data.error;
                    this._promoDiscount = 0;
                    this._promoCode = '';
                } else {
                    resultEl.style.color = '#22c55e';
                    resultEl.textContent = `✓ Code appliqué : ${data.description}`;
                    this._promoDiscount = data.discount;
                    this._promoCode = data.code;
                    const discountLine = document.getElementById('promo-discount-line');
                    const discountEl = document.getElementById('summary-discount');
                    const totalEl = document.getElementById('summary-total');
                    if (discountLine) discountLine.style.display = '';
                    if (discountEl) discountEl.textContent = Utils.formatCurrency(data.discount);
                    const subtotalVal = cartManager.getCartTotal();
                    const newTotal = Math.max(0, subtotalVal + CONFIG.SHIPPING_COST - data.discount);
                    if (totalEl) totalEl.textContent = Utils.formatCurrency(newTotal);
                }
            } catch {
                resultEl.style.display = 'block';
                resultEl.style.color = '#ef4444';
                resultEl.textContent = '✕ Erreur réseau';
            }
            btn.disabled = false;
            btn.textContent = 'Appliquer';
        });
    }

    async _submitOrder(token, orderData) {
        const btn = document.querySelector('.confirm-order-btn');
        if (btn) { btn.disabled = true; btn.textContent = 'Traitement en cours...'; }
        if (token) {
            try {
                const res = await fetch(API_BASE + '/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify({
                        ...orderData,
                        promoCode: this._promoCode,
                        discount: this._promoDiscount
                    })
                });
                if (!res.ok) {
                    const data = await res.json();
                    Utils.showNotification(data.error || 'Erreur lors de la commande', 'error');
                    if (btn) { btn.disabled = false; btn.textContent = 'Confirmer la commande et payer'; }
                    return;
                }
            } catch {
                Utils.showNotification('Erreur réseau. Réessayez.', 'error');
                if (btn) { btn.disabled = false; btn.textContent = 'Confirmer la commande et payer'; }
                return;
            }
        }
        cartManager.clearCart();
        window.location.href = 'confirmation-commande.html';
    }

    _fillSummary() {
        const summaryList = document.getElementById('summary-items-list');
        const summarySubtotal = document.getElementById('summary-subtotal');
        const summaryShipping = document.getElementById('summary-shipping');
        const summaryTotal = document.getElementById('summary-total');

        if (!summaryList) return;

        const cart = cartManager.cart;
        if (cart.length === 0) {
            summaryList.innerHTML = '<li>Aucun article</li>';
        } else {
            summaryList.innerHTML = cart.map(item =>
                `<li>${item.name} (x${item.quantity}) - ${Utils.formatCurrency(item.price * item.quantity)}</li>`
            ).join('');
        }

        const subtotal = cartManager.getCartTotal();
        const shipping = CONFIG.SHIPPING_COST;
        if (summarySubtotal) summarySubtotal.textContent = Utils.formatCurrency(subtotal);
        if (summaryShipping) summaryShipping.textContent = Utils.formatCurrency(shipping);
        if (summaryTotal) summaryTotal.textContent = Utils.formatCurrency(subtotal + shipping);

        // Fill address summary from form data
        const addressSummary = document.getElementById('summary-address');
        const paymentSummary = document.getElementById('summary-payment');
        const form = document.querySelector('.checkout-form');
        if (form && addressSummary) {
            const name = form.querySelector('#full-name')?.value;
            const phone = form.querySelector('#phone')?.value;
            const address = form.querySelector('#address')?.value;
            const city = form.querySelector('#city')?.value;
            if (name) addressSummary.textContent = `${name}, ${phone} - ${address}, ${city}`;
        }
        if (form && paymentSummary) {
            const payment = form.querySelector('input[name="payment_method"]:checked');
            if (payment) {
                const paymentLabels = {
                    mtn_mobile_money: 'MTN Mobile Money',
                    airtel_money: 'Airtel Money',
                    credit_card: 'Carte de Crédit (Visa/MasterCard)',
                    cash_on_delivery: 'Paiement à la livraison'
                };
                paymentSummary.textContent = paymentLabels[payment.value] || payment.value;
            }
        }
    }

    _setupStepButtons() {
        const formSections = document.querySelectorAll('.form-section');
        const stepIndicators = document.querySelectorAll('.checkout-steps .step');

        const showStep = (stepId) => {
            formSections.forEach(s => s.classList.remove('active'));
            stepIndicators.forEach(s => s.classList.remove('active'));
            const target = document.getElementById(stepId);
            if (target) target.classList.add('active');
            const idx = Array.from(formSections).findIndex(s => s.id === stepId);
            if (stepIndicators[idx]) stepIndicators[idx].classList.add('active');
            if (stepId === 'step-summary') this._fillSummary();
        };

        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', () => showStep(btn.dataset.nextStep));
        });
        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', () => showStep(btn.dataset.prevStep));
        });

        const form = document.querySelector('.checkout-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const token = authManager?.getToken();
                const deliveryName = form.querySelector('#full-name')?.value || '';
                const deliveryPhone = form.querySelector('#phone')?.value || '';
                const deliveryAddress = form.querySelector('#address')?.value || '';
                const deliveryCity = form.querySelector('#city')?.value || '';
                const paymentMethod = form.querySelector('input[name="payment_method"]:checked')?.value || '';
                const deliveryMethod = form.querySelector('input[name="delivery_method"]:checked')?.value || 'delivery';

                // Afficher le modal de simulation pour MTN/Airtel
                if (paymentMethod === 'mtn_mobile_money' || paymentMethod === 'airtel_money') {
                    const isMTN = paymentMethod === 'mtn_mobile_money';
                    const total = document.getElementById('summary-total')?.textContent || '';
                    document.getElementById('modal-logo').textContent = isMTN ? '🟡' : '🔴';
                    document.getElementById('modal-title').textContent = isMTN ? 'MTN Mobile Money' : 'Airtel Money';
                    document.getElementById('modal-amount').textContent = total;
                    document.getElementById('modal-instruction').textContent =
                        `Un message de confirmation sera envoyé au ${deliveryPhone || 'votre numéro'}. Approuvez le paiement sur votre téléphone.`;
                    const modal = document.getElementById('payment-modal');
                    modal.style.display = 'flex';
                    document.getElementById('modal-cancel-btn').onclick = () => { modal.style.display = 'none'; };
                    document.getElementById('modal-confirm-btn').onclick = async () => {
                        modal.style.display = 'none';
                        await this._submitOrder(token, { items: cartManager.cart, deliveryName, deliveryPhone, deliveryAddress, deliveryCity, paymentMethod, deliveryMethod });
                    };
                    return;
                }

                await this._submitOrder(token, { items: cartManager.cart, deliveryName, deliveryPhone, deliveryAddress, deliveryCity, paymentMethod, deliveryMethod });
            });
        }

        showStep('step-address');
    }
}

// === ANIMATION MANAGER ===
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('animate');
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.fade-in, .slide-up').forEach(el => observer.observe(el));

        const header = document.querySelector('header, .sticky-header');
        if (header) {
            window.addEventListener('scroll', Utils.debounce(() => {
                header.classList.toggle('scrolled', window.scrollY > 100);
            }, 10));
        }
    }
}

// === NEWSLETTER FORMS ===
function setupNewsletterForms() {
    document.querySelectorAll('.newsletter-form, footer form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            if (input && input.value) {
                Utils.showNotification('Merci ! Vous êtes inscrit à notre newsletter.', 'success');
                input.value = '';
            }
        });
    });
}

// === GLOBAL INIT ===
let cartManager;
let authManager;

document.addEventListener('DOMContentLoaded', async () => {
    cartManager = new CartManager();
    authManager = new AuthManager();

    authManager.init();
    // Synchronise le panier depuis l'API si l'utilisateur est connecté
    await cartManager.syncFromAPI();
    cartManager.updateCartDisplay();

    new MobileNavigation();
    new SearchManager();
    new AnimationManager();
    new TabManager();
    new FAQManager();
    new ProductsPage();
    new PanierPage();
    new ProfilePage();
    new ProductDetailPage();
    new CheckoutManager();

    setupNewsletterForms();

    console.log('✅ VotreMarché - Application chargée avec succès');
});

// Export for compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils, CartManager, AuthManager };
}
