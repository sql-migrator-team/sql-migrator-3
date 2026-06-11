from sqlalchemy import create_engine


def create_mysql_engine(username: str, password: str, host: str, port: str, database: str):
    """Create a SQLAlchemy engine for a MySQL database using pymysql."""
    connection_string = (
        f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"
    )
    return create_engine(connection_string, pool_pre_ping=True)
