import sqlite3
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv(verbose=False)

postgre_host = os.getenv("POSTGRE_HOST")
postgre_user = os.getenv("POSTGRE_USER")
postgre_port = os.getenv("POSTGRE_PORT")
postgre_db = os.getenv("POSTGRE_DATABASE")
postgre_pwd = os.getenv("POSTGRE_PASSWORD")

# Connect to SQLite database
sqlite_conn = sqlite3.connect('sqlite:///../db.db')
sqlite_cur = sqlite_conn.cursor()

# Connect to PostgreSQL database
postgre_conn = psycopg2.connect(user=postgre_user, password=postgre_pwd, host=postgre_host, port=postgre_port, database=postgre_db)
postgre_cur = postgre_conn.cursor()

# Fetch data from SQLite database
sqlite_cur.execute("SELECT * FROM category")
category_data = sqlite_cur.fetchall()

sqlite_cur.execute("SELECT * FROM image")
image_data = sqlite_cur.fetchall()

# Insert data into PostgreSQL database
for row in category_data:
    postgre_cur.execute(
        "INSERT INTO category VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
        row
    )

for row in image_data:
    postgre_cur.execute(
        "INSERT INTO image VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        row
    )

# Commit changes and close connections
postgre_conn.commit()
sqlite_conn.close()
postgre_conn.close()
