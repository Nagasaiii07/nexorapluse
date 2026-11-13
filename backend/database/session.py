"""
NEXUS Database Session & Connection Management.
Provides high-performance connectivity with support for PostgreSQL (Neon/Supabase)
and SQLite (local / fallback).
"""
import os
import sqlite3
import json
from pathlib import Path
from contextlib import contextmanager
from typing import Generator, Any, Dict, List, Optional
from core.config import DATABASE_URL, DB_PATH, IS_VERCEL

SCHEMA_SQL = """
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

CREATE INDEX IF NOT EXISTS idx_orders_platform ON orders(platform);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_state ON orders(state);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(shipment_status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
"""

# Check for SQLAlchemy availability
HAS_SQLALCHEMY = False
try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker, declarative_base
    HAS_SQLALCHEMY = True
except ImportError:
    pass

Base = None
engine = None
SessionLocal = None

if HAS_SQLALCHEMY and DATABASE_URL and ("postgresql" in DATABASE_URL or "sqlite" in DATABASE_URL):
    try:
        connect_args = {}
        if DATABASE_URL.startswith("sqlite"):
            connect_args = {"check_same_thread": False}
        elif DATABASE_URL.startswith("postgres://"):
            # Vercel / Neon / Supabase compatibility fix
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

        engine = create_engine(
            DATABASE_URL,
            connect_args=connect_args,
            pool_pre_ping=True
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base = declarative_base()
    except Exception as e:
        print(f"[Warning] Failed to initialize SQLAlchemy engine: {e}")
        engine = None
        SessionLocal = None


class DatabaseConnection:
    """Thread-safe SQLite connection pool & query executor."""

    _is_ready = False
    _is_initializing = False

    @staticmethod
    def _create_raw_connection() -> sqlite3.Connection:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(DB_PATH), timeout=30.0)
        conn.row_factory = sqlite3.Row
        if IS_VERCEL:
            try:
                conn.execute("PRAGMA journal_mode=MEMORY;")
                conn.execute("PRAGMA synchronous=OFF;")
            except Exception:
                pass
        else:
            try:
                conn.execute("PRAGMA journal_mode=WAL;")
            except Exception:
                try:
                    conn.execute("PRAGMA journal_mode=DELETE;")
                except Exception:
                    pass
        return conn

    @classmethod
    def ensure_database_ready(cls):
        """Ensures database schema and calibrated seed data are present (vital for serverless cold-starts)."""
        if cls._is_ready or cls._is_initializing:
            return
        cls._is_initializing = True
        try:
            with cls._create_raw_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='orders';")
                table_exists = cursor.fetchone()

                needs_seed = False
                if not table_exists:
                    cls.init_db()
                    needs_seed = True
                else:
                    cursor.execute("SELECT COUNT(*) FROM orders;")
                    cnt = cursor.fetchone()[0]
                    if cnt == 0:
                        needs_seed = True

                if needs_seed:
                    from database.seed_data import seed_database
                    seed_database(force=False)
            cls._is_ready = True
        except Exception as e:
            print(f"[DatabaseConnection] Warning during ensure_database_ready: {e}")
        finally:
            cls._is_initializing = False

    @classmethod
    def get_raw_connection(cls) -> sqlite3.Connection:
        cls.ensure_database_ready()
        return cls._create_raw_connection()

    @classmethod
    def execute_query(cls, sql: str, params: tuple = ()) -> List[Dict[str, Any]]:
        with cls.get_raw_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, params)
            return [dict(row) for row in cursor.fetchall()]

    @classmethod
    def execute_non_query(cls, sql: str, params: tuple = ()) -> int:
        with cls.get_raw_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, params)
            conn.commit()
            return cursor.rowcount

    @classmethod
    def execute_many(cls, sql: str, seq_of_params: list) -> int:
        with cls.get_raw_connection() as conn:
            cursor = conn.cursor()
            cursor.executemany(sql, seq_of_params)
            conn.commit()
            return cursor.rowcount

    @classmethod
    def init_db(cls):
        """Initializes tables and indexes from schema.sql or embedded SCHEMA_SQL."""
        sql = SCHEMA_SQL
        schema_file = Path(__file__).resolve().parent / "schema.sql"
        if schema_file.exists():
            try:
                with open(schema_file, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        sql = content
            except Exception:
                pass
        with cls._create_raw_connection() as conn:
            conn.executescript(sql)
            conn.commit()


@contextmanager
def get_db():
    """Dependency for API routes that yields a DB session or raw connection."""
    if SessionLocal:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    else:
        conn = DatabaseConnection.get_raw_connection()
        try:
            yield conn
        finally:
            conn.close()
