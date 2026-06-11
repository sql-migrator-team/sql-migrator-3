import pandas as pd
from sqlalchemy import create_engine

df = pd.read_excel(
    "/Users/jishnu/Downloads/Stockason_10032026.xlsx",
    sheet_name="Sheet1"
)

engine = create_engine(
    "postgresql+psycopg2://jishnu@localhost:5432/migration_test"
)

df.to_sql(
    "stockason",
    engine,
    if_exists="replace",
    index=False
)

print(f"Imported {len(df)} rows successfully!")
