import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv
import os

load_dotenv()

db_config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "database": os.getenv("DB_NAME", "biometric_attendance"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "ssl_ca": os.getenv("DB_SSL_CA", "aiven-ca.pem"),
}

connection_pool = pooling.MySQLConnectionPool(
    pool_name="biometric_pool",
    pool_size=10,
    **db_config
)


def get_connection():
    """Get a connection from the pool."""
    return connection_pool.get_connection()


def execute_query(query: str, params: tuple = (), fetch: bool = True):
    """Execute a query and optionally return results."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params)
        if fetch:
            result = cursor.fetchall()
            return result
        else:
            conn.commit()
            return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()


def execute_one(query: str, params: tuple = ()):
    """Execute a query and return a single row."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params)
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()
