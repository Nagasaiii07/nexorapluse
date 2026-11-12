-- NEXUS Logistics Intelligence Database Schema
-- Compatible with both PostgreSQL (Supabase/Neon) and SQLite

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Admin',
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platforms (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    platform TEXT NOT NULL,
    order_status TEXT NOT NULL,
    order_date TIMESTAMP NOT NULL,
    total_amount REAL NOT NULL,
    items_count INTEGER DEFAULT 1,
    state TEXT NOT NULL,
    city TEXT,
    pincode TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    sku TEXT,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    tracking_number TEXT UNIQUE NOT NULL,
    order_id TEXT NOT NULL,
    courier TEXT NOT NULL,
    shipment_status TEXT NOT NULL,
    origin_hub TEXT,
    destination_hub TEXT,
    dispatch_date TIMESTAMP,
    estimated_delivery TIMESTAMP,
    actual_delivery TIMESTAMP,
    delivery_attempts INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL,
    duration_ms REAL DEFAULT 0.0,
    source TEXT DEFAULT 'SYSTEM',
    payload_json TEXT,
    result_json TEXT,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_jobs (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    file_size INTEGER DEFAULT 0,
    records_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    status TEXT NOT NULL,
    error_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_transactions (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    platform TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    amount REAL NOT NULL,
    fee REAL NOT NULL,
    net_profit REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alert_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    operator TEXT NOT NULL,
    threshold_value REAL NOT NULL,
    severity TEXT DEFAULT 'WARNING',
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_platform ON orders(platform);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_state ON orders(state);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(shipment_status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
