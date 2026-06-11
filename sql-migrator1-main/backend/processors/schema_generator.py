import os
import pandas as pd
from typing import Optional
from backend.utils.file_handler import resolve_upload_path

_TYPE_MAP = {
    "int64": "INTEGER",
    "float64": "REAL",
    "bool": "BOOLEAN",
    "datetime64[ns]": "DATETIME",
    "object": "TEXT",
}


def infer_sql_type(dtype: str) -> str:
    """Infer a SQL data type string from a pandas dtype."""
    return _TYPE_MAP.get(dtype, "TEXT")


def generate_create_table_schema(file_path: str, table_name: Optional[str] = None) -> str:
    """Generate a CREATE TABLE SQL statement from a CSV or Excel file."""
    if not table_name:
        table_name = os.path.splitext(os.path.basename(file_path))[0]

    extension = os.path.splitext(file_path)[1].lower()
    if extension == ".csv":
        data_frame = pd.read_csv(file_path)
    else:
        data_frame = pd.read_excel(file_path)

    columns = []
    for column_name, dtype in data_frame.dtypes.items():
        sql_type = infer_sql_type(str(dtype))
        columns.append(f"{column_name} {sql_type}")

    sql = f"CREATE TABLE IF NOT EXISTS {table_name} (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    "
    sql += ",\n    ".join(columns)
    sql += "\n);"
    return sql
