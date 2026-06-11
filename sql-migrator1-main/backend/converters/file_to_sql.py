import os
import pandas as pd
from typing import Dict, Any
from backend.database.connection_manager import create_engine_for_config
from backend.processors.csv_processor import read_csv_file
from backend.processors.excel_processor import read_excel_file
from backend.processors.schema_generator import generate_create_table_schema
from backend.utils.file_handler import resolve_upload_path


def import_file_to_sql(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Import a CSV or Excel file into a SQL database table."""
    file_path = payload.get("file_path")
    if file_path is None:
        raise ValueError("File path is required for import.")

    _, extension = os.path.splitext(file_path)
    if extension.lower() in [".csv"]:
        data_frame = read_csv_file(file_path)
    else:
        data_frame = read_excel_file(file_path)

    target_config = {
        "db_type": payload.get("target_db_type", "sqlite"),
        "username": payload.get("target_username", ""),
        "password": payload.get("target_password", ""),
        "host": payload.get("target_host", "localhost"),
        "port": payload.get("target_port", ""),
        "database": payload.get("target_database", "./backend/database/app_data.db"),
    }
    target_engine = create_engine_for_config(target_config)
    table_name = payload.get("target_table") or os.path.splitext(os.path.basename(file_path))[0]

    data_frame.to_sql(table_name, target_engine, if_exists=payload.get("if_exists", "append"), index=False)

    schema_sql = generate_create_table_schema(file_path, table_name)
    return {
        "table_name": table_name,
        "rows_imported": int(data_frame.shape[0]),
        "schema_sql": schema_sql,
        "target_database": target_config.get("database"),
    }
