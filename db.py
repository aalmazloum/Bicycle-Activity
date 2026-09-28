import sqlite3
DATABASE = 'drawings.db'

def get_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    with open('schema.sql') as f:
        conn.executescript(f.read())
    conn.close()

def save_submission(name, tsn, drawing):
    conn = get_connection()
    conn.execute(
        'INSERT INTO submissions (name, tsn, drawing) VALUES (?, ?, ?)',
        (name, tsn, drawing),
    )
    conn.commit()
    conn.close()

def get_submissions():
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, name, tsn, drawing, datetime(created_at, 'localtime') AS submitted_at "
        "FROM submissions "
        "ORDER BY name COLLATE NOCASE, id"
    ).fetchall()
    conn.close()
    return rows
