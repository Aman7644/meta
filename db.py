"""
db.py — EchoTwins AI database connection layer (Supabase PostgreSQL / SQLite)

Fails loudly if DATABASE_URL fails to connect unless ALLOW_SQLITE=true is set in .env.
Supports Supabase PostgreSQL via connection pooling (port 6543) with verified SSL.
"""

import os
import sys
import ssl
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

raw_url = os.environ.get("DATABASE_URL", "").strip()
allow_sqlite = os.environ.get("ALLOW_SQLITE", "false").strip().lower() in ("true", "1", "yes")

# Check if URL is unconfigured / placeholder
is_placeholder = (
    not raw_url
    or "YOURREF" in raw_url
    or "YOURPASSWORD" in raw_url
    or "YOUR_PASSWORD" in raw_url
    or "YOUR-PASSWORD" in raw_url
    or "[YOUR-PASSWORD]" in raw_url
    or "xxxxxxxxxxxx" in raw_url
)


def _build_engine():
    if is_placeholder:
        if allow_sqlite:
            print("  [db] Using local SQLite (echotwins.db) because ALLOW_SQLITE=true.")
            return create_engine("sqlite:///echotwins.db")
        else:
            sys.stderr.write("\n[FATAL DATABASE ERROR] DATABASE_URL contains placeholder values (e.g. [YOUR-PASSWORD]), and ALLOW_SQLITE is not set to true.\n")
            sys.stderr.write("To use PostgreSQL, replace [YOUR-PASSWORD] with your actual Supabase database password in .env.\n\n")
            sys.exit(1)

    url = raw_url

    # Resolve CA certificate path (configurable via SSL_CA_FILE, defaults to supabase-ca.crt)
    ca_filename = os.environ.get("SSL_CA_FILE", "supabase-ca.crt").strip()
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ca_file_path = ca_filename if os.path.isabs(ca_filename) else os.path.join(base_dir, ca_filename)

    # If postgresql URL without explicit driver, select driver
    if url.startswith("postgresql://") or url.startswith("postgres://"):
        try:
            import psycopg  # noqa: F401
            url = url.replace("postgres://", "postgresql://", 1)
            connect_args = {
                "options": "-c statement_timeout=10000",
                "sslmode": "verify-full",
                "sslrootcert": ca_file_path,
            }
        except ImportError:
            # Fall back to pure-python pg8000 driver
            url = url.replace("postgresql://", "postgresql+pg8000://", 1)
            url = url.replace("postgres://", "postgresql+pg8000://", 1)

            # Verified SSL context with loaded CA certificate
            if os.path.exists(ca_file_path):
                ssl_ctx = ssl.create_default_context(cafile=ca_file_path)
            else:
                ssl_ctx = ssl.create_default_context()
            ssl_ctx.check_hostname = True
            ssl_ctx.verify_mode = ssl.CERT_REQUIRED
            connect_args = {"ssl_context": ssl_ctx, "timeout": 10}

    try:
        if "sqlite" in url:
            if not allow_sqlite:
                sys.stderr.write("\n[FATAL DATABASE ERROR] SQLite URL provided but ALLOW_SQLITE is not true in .env.\n\n")
                sys.exit(1)
            return create_engine(url)

        engine = create_engine(
            url,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args=connect_args,
            execution_options={"no_parameters": False},
        )
        # Verify connection immediately
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("  [db] Connected to PostgreSQL (Supabase) successfully with verified SSL.")
        return engine

    except Exception as err:
        if allow_sqlite:
            print(f"  [db] WARNING: Failed to connect to remote database: {err}. Falling back to SQLite because ALLOW_SQLITE=true.")
            return create_engine("sqlite:///echotwins.db")
        else:
            err_type = type(err).__name__
            sys.stderr.write(f"\n[FATAL DATABASE ERROR] Failed to connect to database at DATABASE_URL ({err_type}): {err}\n\n")
            sys.exit(1)


_engine = _build_engine()


def get_conn():
    """Return a connection from the pool (use as context manager)."""
    return _engine.connect()


def init_db():
    """
    Create tables if they do not exist yet.
    Compatible with both PostgreSQL and SQLite.
    """
    is_sqlite = _engine.dialect.name == "sqlite"
    id_col = "INTEGER PRIMARY KEY AUTOINCREMENT" if is_sqlite else "SERIAL PRIMARY KEY"
    time_col = "TIMESTAMP" if is_sqlite else "TIMESTAMPTZ"

    with _engine.connect() as conn:
        conn.execute(text(f"""
            CREATE TABLE IF NOT EXISTS students (
                id            {id_col},
                name          TEXT        NOT NULL,
                email         TEXT UNIQUE NOT NULL,
                password_hash TEXT        NOT NULL,
                role          TEXT        NOT NULL DEFAULT 'student',
                created_at    {time_col}  NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text(f"""
            CREATE TABLE IF NOT EXISTS questions (
                id          {id_col},
                student_id  INTEGER     NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                question    TEXT        NOT NULL,
                approaches  TEXT,
                answer      TEXT,
                created_at  {time_col}  NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_questions_student_created
                ON questions (student_id, created_at DESC)
        """))

        if not is_sqlite:
            conn.execute(text("ALTER TABLE students ENABLE ROW LEVEL SECURITY;"))
            conn.execute(text("ALTER TABLE questions ENABLE ROW LEVEL SECURITY;"))

        conn.commit()
