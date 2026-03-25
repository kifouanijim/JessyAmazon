const db = require('./database');

const products = [
    // Smartphones
    { id: 'sp1', name: 'Samsung Galaxy A54 5G', cat: 'smartphones', price: 185000, originalPrice: 220000, rating: 4.5, reviews: 234, seller: 'TechShop Congo' },
    { id: 'sp2', name: 'iPhone 14 (Reconditionné)', cat: 'smartphones', price: 350000, originalPrice: 420000, rating: 4.3, reviews: 89, seller: 'DigitalStore BZV' },
    { id: 'sp3', name: 'Tecno Camon 20 Pro', cat: 'smartphones', price: 95000, originalPrice: 110000, rating: 4.0, reviews: 312, seller: 'MobileCongo' },
    { id: 'sp4', name: 'Infinix Hot 30i', cat: 'smartphones', price: 65000, originalPrice: 78000, rating: 3.9, reviews: 445, seller: 'MobileCongo' },
    { id: 'sp5', name: 'Xiaomi Redmi Note 12', cat: 'smartphones', price: 120000, originalPrice: 145000, rating: 4.4, reviews: 178, seller: 'TechShop Congo' },
    // Ordinateurs
    { id: 'pc1', name: 'Laptop HP 15 - Core i5 8Go RAM', cat: 'ordinateurs', price: 520000, originalPrice: 600000, rating: 4.4, reviews: 67, seller: 'TechShop Congo' },
    { id: 'pc2', name: 'Lenovo IdeaPad 3 - Core i3', cat: 'ordinateurs', price: 445000, originalPrice: 500000, rating: 4.2, reviews: 45, seller: 'DigitalStore BZV' },
    { id: 'pc3', name: 'Dell Inspiron 15 - Core i7', cat: 'ordinateurs', price: 750000, originalPrice: 900000, rating: 4.6, reviews: 34, seller: 'TechShop Congo' },
    { id: 'pc4', name: 'Acer Aspire 5 - Core i5 512Go SSD', cat: 'ordinateurs', price: 485000, originalPrice: 560000, rating: 4.3, reviews: 56, seller: 'DigitalStore BZV' },
    // Télévisions
    { id: 'tv1', name: 'TV Samsung 55" 4K UHD Smart', cat: 'televisions', price: 680000, originalPrice: 800000, rating: 4.6, reviews: 156, seller: 'ElectroKongo' },
    { id: 'tv2', name: 'TV Hisense 43" Full HD', cat: 'televisions', price: 310000, originalPrice: 360000, rating: 4.1, reviews: 89, seller: 'TechShop Congo' },
    { id: 'tv3', name: 'TV TCL 32" HD Smart', cat: 'televisions', price: 185000, originalPrice: 220000, rating: 4.0, reviews: 201, seller: 'ElectroKongo' },
    // Fruits & Légumes
    { id: 'fv1', name: 'Panier Légumes Frais 5kg', cat: 'fruits-legumes', price: 5000, originalPrice: 6500, rating: 4.7, reviews: 423, seller: 'Marché Bio Congo' },
    { id: 'fv2', name: 'Régime de Bananes Locales', cat: 'fruits-legumes', price: 2500, originalPrice: 3000, rating: 4.8, reviews: 678, seller: 'Fermier Local' },
    { id: 'fv3', name: 'Tomates Fraîches 2kg', cat: 'fruits-legumes', price: 2000, originalPrice: 2500, rating: 4.6, reviews: 345, seller: 'Marché Bio Congo' },
    { id: 'fv4', name: 'Avocats du Congo (sachet 6)', cat: 'fruits-legumes', price: 3500, originalPrice: 4000, rating: 4.9, reviews: 512, seller: 'Fermier Local' },
    // Viandes & Poissons
    { id: 'vp1', name: 'Poulet Entier (1.5kg)', cat: 'viandes-poissons', price: 8500, originalPrice: 10000, rating: 4.6, reviews: 234, seller: 'Boucherie du Congo' },
    { id: 'vp2', name: 'Capitaine Fumé (500g)', cat: 'viandes-poissons', price: 6000, originalPrice: 7000, rating: 4.8, reviews: 345, seller: 'Pêcherie Nationale' },
    { id: 'vp3', name: 'Bœuf Haché Frais (1kg)', cat: 'viandes-poissons', price: 12000, originalPrice: 14000, rating: 4.5, reviews: 189, seller: 'Boucherie du Congo' },
    { id: 'vp4', name: 'Tilapia Frais (1kg)', cat: 'viandes-poissons', price: 5500, originalPrice: 6500, rating: 4.7, reviews: 267, seller: 'Pêcherie Nationale' },
    // Épicerie
    { id: 'ep1', name: 'Riz Parfumé 25kg', cat: 'epicerie', price: 18000, originalPrice: 20000, rating: 4.5, reviews: 567, seller: 'GroceryKongo' },
    { id: 'ep2', name: 'Huile de Palme 5L', cat: 'epicerie', price: 9500, originalPrice: 11000, rating: 4.3, reviews: 289, seller: 'Produits du Congo' },
    { id: 'ep3', name: 'Sucre de Canne 5kg', cat: 'epicerie', price: 4500, originalPrice: 5000, rating: 4.4, reviews: 412, seller: 'GroceryKongo' },
    { id: 'ep4', name: 'Farine de Manioc 10kg', cat: 'epicerie', price: 7500, originalPrice: 9000, rating: 4.6, reviews: 334, seller: 'Produits du Congo' },
    // Mode Hommes
    { id: 'mh1', name: 'Chemise Wax Africaine Homme', cat: 'hommes', price: 15000, originalPrice: 18000, rating: 4.4, reviews: 123, seller: 'Mode Congo' },
    { id: 'mh2', name: 'Jean Slim Homme Noir', cat: 'hommes', price: 22000, originalPrice: 25000, rating: 4.2, reviews: 89, seller: 'Fashion House BZV' },
    { id: 'mh3', name: 'Costume 2 Pièces Homme', cat: 'hommes', price: 85000, originalPrice: 100000, rating: 4.5, reviews: 56, seller: 'Élégance Congo' },
    { id: 'mh4', name: 'Boubou Traditionnel Homme', cat: 'hommes', price: 35000, originalPrice: 40000, rating: 4.7, reviews: 198, seller: 'Artisanat Congo' },
    // Mode Femmes
    { id: 'mf1', name: 'Robe Wax Africaine', cat: 'femmes', price: 25000, originalPrice: 30000, rating: 4.8, reviews: 456, seller: 'Mode Congo' },
    { id: 'mf2', name: 'Ensemble Tailleur Femme', cat: 'femmes', price: 35000, originalPrice: 42000, rating: 4.6, reviews: 234, seller: 'Élégance Congo' },
    { id: 'mf3', name: 'Sac à Main Cuir Premium', cat: 'femmes', price: 28000, originalPrice: 35000, rating: 4.4, reviews: 178, seller: 'Fashion House BZV' },
    { id: 'mf4', name: 'Pagne Tissé 6 Mètres', cat: 'femmes', price: 18000, originalPrice: 22000, rating: 4.9, reviews: 623, seller: 'Tissage Congo' },
    // Mode Enfants
    { id: 'me1', name: 'Ensemble Scolaire Enfant (6-12 ans)', cat: 'enfants', price: 12000, originalPrice: 15000, rating: 4.5, reviews: 312, seller: 'Kids Fashion' },
    { id: 'me2', name: 'Robe Wax Fille (4-8 ans)', cat: 'enfants', price: 8000, originalPrice: 10000, rating: 4.7, reviews: 267, seller: 'Kids Fashion' },
    { id: 'me3', name: 'Tenue de Sport Enfant', cat: 'enfants', price: 9500, originalPrice: 12000, rating: 4.3, reviews: 145, seller: 'SportKongo' },
    // Meubles
    { id: 'mb1', name: 'Canapé 3 Places Tissu Premium', cat: 'meubles', price: 285000, originalPrice: 320000, rating: 4.3, reviews: 67, seller: 'Mobilier Congo' },
    { id: 'mb2', name: 'Bureau en Bois Massif', cat: 'meubles', price: 125000, originalPrice: 150000, rating: 4.4, reviews: 45, seller: 'Ébénisterie Congo' },
    { id: 'mb3', name: 'Lit 2 places + Matelas inclus', cat: 'meubles', price: 320000, originalPrice: 380000, rating: 4.5, reviews: 89, seller: 'Mobilier Congo' },
    // Décorations
    { id: 'dc1', name: 'Tableau Décoratif Africain 80x60', cat: 'decorations', price: 18000, originalPrice: 22000, rating: 4.7, reviews: 189, seller: 'Art Congo' },
    { id: 'dc2', name: 'Vase en Terre Cuite Artisanal', cat: 'decorations', price: 12000, originalPrice: 15000, rating: 4.6, reviews: 134, seller: 'Artisanat Congo' },
    { id: 'dc3', name: 'Masque Traditionnel Décoratif', cat: 'decorations', price: 22000, originalPrice: 28000, rating: 4.8, reviews: 245, seller: 'Art Congo' },
    // Outils de jardin
    { id: 'ot1', name: 'Kit Outils de Jardinage 8 pièces', cat: 'outils', price: 35000, originalPrice: 42000, rating: 4.5, reviews: 78, seller: 'GardenKongo' },
    { id: 'ot2', name: 'Arrosoir Inox 10 Litres', cat: 'outils', price: 8500, originalPrice: 10000, rating: 4.3, reviews: 56, seller: 'GardenKongo' },
];

const insertAuto = db.prepare(
    'INSERT OR IGNORE INTO products (name, category, price, originalPrice, rating, reviewCount, sellerName, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);

let inserted = 0;
const existing = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (existing.count === 0) {
    for (const p of products) {
        insertAuto.run(p.name, p.cat, p.price, p.originalPrice || null, p.rating, p.reviews, p.seller, 100);
        inserted++;
    }
    console.log(`${inserted} produits insérés dans la base de données`);
} else {
    console.log(`Base déjà peuplée (${existing.count} produits existants) — seed ignoré`);
}
