from typing import Any, Dict
import os

from sqlalchemy.engine import Engine

from .mysql_connection import create_mysql_engine
from .postgres_connection import create_postgres_engine
from .sqlite_connection import create_sqlite_engine
from .oracle_connection import create_oracle_engine

# Default SQLite DB path (absolute, resolved relative to this file)
_DEFAULT_SQLITE_DB_FALLBACK = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "app_data.db")
)


def create_engine_for_config(config: Dict[str, Any]) -> Engine:
    """Create a SQLAlchemy engine based on common application configuration."""
    db_type = (config.get("db_type") or "").lower().strip()
    if db_type == "mysql":
        return create_mysql_engine(
            username=config.get("username", ""),
            password=config.get("password", ""),
            host=config.get("host", "localhost"),
            port=config.get("port", "3306"),
            database=config.get("database", ""),
        )
    if db_type in ("postgresql", "postgres"):
        return create_postgres_engine(
            username=config.get("username", ""),
            password=config.get("password", ""),
            host=config.get("host", "localhost"),
            port=config.get("port", "5432"),
            database=config.get("database", ""),
        )
    if db_type == "sqlite":
        return create_sqlite_engine(config.get("database", ":memory:"))
    if db_type == "oracle":
        return create_oracle_engine(
            username=config.get("username", ""),
            password=config.get("password", ""),
            host=config.get("host", "localhost"),
            port=config.get("port", "1521"),
            service_name=config.get("database", "XE"),
        )
    if db_type == "sqlserver":
        # SQL Server uses pyodbc or pymssql — fall back to a basic mssql URL
        user = config.get("username", "")
        pwd = config.get("password", "")
        host = config.get("host", "localhost")
        port = config.get("port", "1433")
        database = config.get("database", "")
        from sqlalchemy import create_engine
        url = f"mssql+pymssql://{user}:{pwd}@{host}:{port}/{database}"
        return create_engine(url)
    supported = ["mysql", "postgresql", "postgres", "sqlite", "oracle", "sqlserver"]
    raise ValueError(
        f"Unsupported database type: '{db_type}'. "
        f"Please select one of: {', '.join(supported)}."
    )
