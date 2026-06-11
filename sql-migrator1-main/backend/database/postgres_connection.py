'''from sqlalchemy import create_engine


def create_postgres_engine(username: str, password: str, host: str, port: str, database: str):
    """Create a SQLAlchemy engine for a PostgreSQL database using psycopg2."""
    connection_string = (
        f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{database}"
    )
    return create_engine(connection_string, pool_pre_ping=True)
'''

from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

def create_postgres_engine(
    username: str,
    password: str,
    host: str,
    port: str,
    database: str
) -> Engine:

    encoded_password = quote_plus(password)

    connection_string = (
        f"postgresql+psycopg2://"
        f"{username}:{encoded_password}@{host}:{port}/{database}"
    )

    return create_engine(
        connection_string,
        pool_pre_ping=True
    )