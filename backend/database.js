const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'votremarche.db'));

// Performance et intégrité
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Création des tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName   TEXT    NOT NULL,
    email      TEXT    UNIQUE NOT NULL,
    phone      TEXT    UNIQUE NOT NULL,
    password   TEXT    NOT NULL,
    address    TEXT    DEFAULT '',
    role       TEXT    DEFAULT 'buyer',
    createdAt  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    description  TEXT    DEFAULT '',
    price        INTEGER NOT NULL,
    originalPrice INTEGER,
    category     TEXT    NOT NULL,
    sellerId     INTEGER,
    sellerName   TEXT    DEFAULT 'VotreMarché',
    stock        INTEGER DEFAULT 100,
    rating       REAL    DEFAULT 4.0,
    reviewCount  INTEGER DEFAULT 0,
    imageUrl     TEXT    DEFAULT '',
    createdAt    TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (sellerId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    userId      INTEGER NOT NULL,
    productId   TEXT    NOT NULL,
    productName TEXT    NOT NULL,
    price       INTEGER NOT NULL,
    quantity    INTEGER DEFAULT 1,
    sellerName  TEXT    DEFAULT '',
    FOREIGN KEY (userId) REFERENCES users(id),
    UNIQUE(userId, productId)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    userId          INTEGER NOT NULL,
    subtotal        INTEGER NOT NULL,
    shippingCost    INTEGER DEFAULT 2500,
    total           INTEGER NOT NULL,
    status          TEXT    DEFAULT 'En cours',
    deliveryName    TEXT,
    deliveryPhone   TEXT,
    deliveryAddress TEXT,
    deliveryCity    TEXT,
    paymentMethod   TEXT,
    deliveryMethod  TEXT,
    notes           TEXT    DEFAULT '',
    discount        INTEGER DEFAULT 0,
    promoCode       TEXT    DEFAULT '',
    createdAt       TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId     INTEGER NOT NULL,
    productId   TEXT,
    productName TEXT    NOT NULL,
    price       INTEGER NOT NULL,
    quantity    INTEGER NOT NULL,
    sellerName  TEXT    DEFAULT '',
    FOREIGN KEY (orderId) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    productId   INTEGER NOT NULL,
    userId      INTEGER NOT NULL,
    rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment     TEXT    DEFAULT '',
    createdAt   TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (productId) REFERENCES products(id),
    FOREIGN KEY (userId) REFERENCES users(id),
    UNIQUE(productId, userId)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    userId    INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    addedAt   TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (productId) REFERENCES products(id),
    UNIQUE(userId, productId)
  );

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    userId    INTEGER NOT NULL,
    token     TEXT    NOT NULL UNIQUE,
    expiresAt TEXT    NOT NULL,
    used      INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS promo_codes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    code        TEXT    NOT NULL UNIQUE,
    type        TEXT    NOT NULL DEFAULT 'percent',
    value       INTEGER NOT NULL,
    minOrder    INTEGER DEFAULT 0,
    maxUses     INTEGER DEFAULT 100,
    usedCount   INTEGER DEFAULT 0,
    expiresAt   TEXT,
    active      INTEGER DEFAULT 1,
    createdAt   TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_addresses (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    userId    INTEGER NOT NULL,
    label     TEXT    DEFAULT 'Domicile',
    fullName  TEXT    NOT NULL,
    phone     TEXT    NOT NULL,
    address   TEXT    NOT NULL,
    city      TEXT    NOT NULL,
    isDefault INTEGER DEFAULT 0,
    createdAt TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

// Promo de démo
const hasPromo = db.prepare("SELECT id FROM promo_codes WHERE code = 'BIENVENUE20'").get();
if (!hasPromo) {
    db.prepare("INSERT INTO promo_codes (code, type, value, minOrder) VALUES ('BIENVENUE20', 'percent', 20, 5000)").run();
    db.prepare("INSERT INTO promo_codes (code, type, value, minOrder) VALUES ('LIVRAISON', 'fixed', 2500, 0)").run();
}

module.exports = db;
