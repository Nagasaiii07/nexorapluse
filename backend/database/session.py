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
from core.config import DATABASE_URL, DB_PATH

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
        # Enable WAL mode where supported, fallback to DELETE in serverless environments
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
        """Initializes tables and indexes from schema.sql."""
        schema_file = Path(__file__).resolve().parent / "schema.sql"
        if schema_file.exists():
            with open(schema_file, "r", encoding="utf-8") as f:
                schema_sql = f.read()
            with cls._create_raw_connection() as conn:
                conn.executescript(schema_sql)
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
