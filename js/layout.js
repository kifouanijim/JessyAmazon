// Layout partagé — injecte header + footer sur toutes les pages
(function () {
    const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001/api'
        : 'https://jessyamazon.onrender.com/api';

    const STYLES = `
        <style id="layout-styles">
            *{box-sizing:border-box;margin:0;padding:0;}
            body{background:#0f172a;color:#fff;font-family:sans-serif;}
            .vm-header{position:sticky;top:0;z-index:50;background:rgba(15,23,42,.96);backdrop-filter:blur(8px);border-bottom:1px solid #1e293b;}
            .vm-header-top{max-width:1280px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;gap:12px;}
            .vm-logo{display:flex;align-items:center;gap:8px;text-decoration:none;flex-shrink:0;}
            .vm-logo img{height:36px;width:36px;border-radius:50%;}
            .vm-logo span{font-weight:700;font-size:18px;color:#f2c335;}
            .vm-search{flex:1;max-width:560px;display:flex;align-items:center;background:#1e293b;border:1px solid #334155;border-radius:24px;padding:8px 14px;gap:8px;}
            .vm-search input{flex:1;background:transparent;border:none;outline:none;color:#fff;font-size:14px;}
            .vm-search i{color:#64748b;font-size:13px;}
            .vm-header-actions{display:flex;align-items:center;gap:10px;flex-shrink:0;}
            .vm-auth-btn{font-size:13px;padding:6px 14px;border:1px solid #475569;border-radius:20px;color:#cbd5e1;text-decoration:none;transition:all .2s;white-space:nowrap;}
            .vm-auth-btn:hover,.vm-auth-btn.active{background:#4a634e;border-color:#4a634e;color:#fff;}
            .vm-auth-btn.accent{background:#f2c335;border-color:#f2c335;color:#000;font-weight:600;}
            .vm-cart-btn{position:relative;color:#cbd5e1;text-decoration:none;}
            .vm-cart-btn i{font-size:20px;}
            .vm-cart-count{position:absolute;top:-6px;right:-6px;background:#f2c335;color:#000;font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
            .vm-nav{max-width:1280px;margin:0 auto;padding:0 16px 8px;display:flex;gap:16px;overflow-x:auto;scrollbar-width:none;}
            .vm-nav::-webkit-scrollbar{display:none;}
            .vm-nav a{font-size:12px;color:#94a3b8;text-decoration:none;white-space:nowrap;transition:color .2s;}
            .vm-nav a:hover,.vm-nav a.active{color:#f2c335;}
            .vm-footer{background:#0f172a;border-top:1px solid #1e293b;color:#64748b;font-size:13px;margin-top:64px;}
            .vm-footer-grid{max-width:1280px;margin:0 auto;padding:32px 16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:24px;}
            .vm-footer h4{color:#fff;font-weight:600;margin-bottom:12px;font-size:14px;}
            .vm-footer ul{list-style:none;}
            .vm-footer ul li{margin-bottom:8px;}
            .vm-footer a{color:#64748b;text-decoration:none;transition:color .2s;}
            .vm-footer a:hover{color:#fff;}
            .vm-footer-bottom{text-align:center;padding:16px;border-top:1px solid #1e293b;font-size:12px;}
            .vm-payment-icons{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:4px;}
            .vm-payment-icons img{height:28px;}
            .vm-social{display:flex;gap:14px;margin-top:4px;}
            .vm-social a{color:#64748b;font-size:16px;}
            .vm-social a:hover{color:#fff;}
        </style>`;

    const HEADER_HTML = `
        <header class="vm-header">
            <div class="vm-header-top">
                <a href="index.html" class="vm-logo">
                    <img src="src/img/logo.jpg" alt="VotreMarché" onerror="this.style.display='none'">
                    <span>VotreMarché</span>
                </a>
                <div class="vm-search">
                    <i class="fas fa-search"></i>
                    <input type="text" id="vm-search-input" placeholder="Rechercher un produit...">
                </div>
                <div class="vm-header-actions">
                    <a href="connexion.html" id="vm-auth-btn" class="vm-auth-btn">Connexion</a>
                    <a href="panier.html" class="vm-cart-btn">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="vm-cart-count" id="vm-cart-count">0</span>
                    </a>
                </div>
            </div>
            <nav class="vm-nav">
                <a href="categories.html">Catégories</a>
                <a href="liste-produits.html?cat=smartphones">Smartphones</a>
                <a href="liste-produits.html?cat=ordinateurs">Ordinateurs</a>
                <a href="liste-produits.html?cat=televisions">TV</a>
                <a href="liste-produits.html?cat=fruits-legumes">Fruits & Légumes</a>
                <a href="liste-produits.html?cat=viandes-poissons">Viandes & Poissons</a>
                <a href="liste-produits.html?cat=epicerie">Épicerie</a>
                <a href="liste-produits.html?cat=hommes">Hommes</a>
                <a href="liste-produits.html?cat=femmes">Femmes</a>
                <a href="liste-produits.html?cat=enfants">Enfants</a>
                <a href="liste-produits.html?cat=meubles">Meubles</a>
                <a href="liste-produits.html?cat=decorations">Décorations</a>
                <a href="vendre.html">Vendre</a>
                <a href="aide.html">Aide</a>
            </nav>
        </header>`;

    const FOOTER_HTML = `
        <footer class="vm-footer">
            <div class="vm-footer-grid">
                <div>
                    <h4>VotreMarché</h4>
                    <ul>
                        <li><a href="a-propos.html">À propos de nous</a></li>
                        <li><a href="vendre.html">Devenir Vendeur</a></li>
                        <li><a href="faq.html">FAQ</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Aide & Support</h4>
                    <ul>
                        <li><a href="contact.html">Nous contacter</a></li>
                        <li><a href="conditions.html">Conditions générales</a></li>
                        <li><a href="confidentialite.html">Confidentialité</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Paiements</h4>
                    <div class="vm-payment-icons">
                        <img src="src/img/airtel.png" alt="Airtel Money">
                        <img src="src/img/mtn.png" alt="MTN Mobile Money">
                        <img src="src/img/visa.png" alt="Visa">
                    </div>
                </div>
                <div>
                    <h4>Suivez-nous</h4>
                    <div class="vm-social">
                        <a href="#"><i class="fab fa-facebook-f"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                    </div>
                </div>
            </div>
            <div class="vm-footer-bottom">© 2025 VotreMarché — Congo-Brazzaville. Tous droits réservés.</div>
        </footer>`;

    function inject() {
        // Styles
        if (!document.getElementById('layout-styles')) {
            document.head.insertAdjacentHTML('beforeend', STYLES);
        }

        // Header — insérer avant le premier élément du body si pas de header existant
        const existingHeader = document.querySelector('header.vm-header');
        if (!existingHeader) {
            document.body.insertAdjacentHTML('afterbegin', HEADER_HTML);
        }

        // Footer
        const existingFooter = document.querySelector('footer.vm-footer');
        if (!existingFooter) {
            document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);
        }

        // Marquer le lien nav actif
        const path = window.location.pathname.split('/').pop();
        document.querySelectorAll('.vm-nav a').forEach(a => {
            const href = a.getAttribute('href');
            if (href === path || (path === '' && href === 'index.html')) {
                a.classList.add('active');
            }
        });

        // Auth
        updateAuthUI();

        // Panier
        updateCartCount();

        // Recherche
        const searchInput = document.getElementById('vm-search-input');
        if (searchInput) {
            searchInput.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    const q = e.target.value.trim();
                    if (q) window.location.href = 'liste-produits.html?search=' + encodeURIComponent(q);
                }
            });
        }
    }

    function updateAuthUI() {
        const user = (() => { try { return JSON.parse(localStorage.getItem('vm_current_user')); } catch { return null; } })();
        const btn = document.getElementById('vm-auth-btn');
        if (!btn) return;
        if (user) {
            btn.textContent = user.fullName.split(' ')[0];
            btn.href = user.role === 'seller' ? 'profil-vendeur.html' : 'profil-utilisateur.html';
            btn.classList.add('active');
        }
    }

    function updateCartCount() {
        try {
            const cart = JSON.parse(localStorage.getItem('vm_cart') || '[]');
            const total = cart.reduce((s, i) => s + (i.quantity || 1), 0);
            const el = document.getElementById('vm-cart-count');
            if (el) el.textContent = total;
        } catch {}
    }

    // Injecter après chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }

    // API exposée
    window.vmLayout = { updateCartCount, updateAuthUI, API };
})();
