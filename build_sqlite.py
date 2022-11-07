import sys
import json
import sqlite3


def open_db(name):
    connection = sqlite3.connect(name)
    cursor = connection.cursor()
    return connection, cursor


def ensure_table(cursor, table, columns):
    cursor.execute(
        f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
    if cursor.fetchone() is None:
        cursor.execute(f"CREATE TABLE {table} ({', '.join(columns)})")


def create_or_open(name):
    connection, cursor = open_db(name)
    cursor.row_factory = sqlite3.Row
    columns = [
        "id TEXT PRIMARY KEY",
        "p text",
        "se integer",
        "c integer",
        "st integer",
        "sa text",
    ]
    ensure_table(cursor, "dreams", columns)
    return connection, cursor


def add_fts(cursor, connection):
    cursor.execute("CREATE VIRTUAL TABLE dreams_fts USING fts5 (p, content=dreams, tokenize = 'porter ascii')")
    cursor.execute("INSERT INTO dreams_fts (p) SELECT (p) FROM dreams")
    connection.commit()

def main(db_filename, json_files):
    connection, cursor = create_or_open(db_filename)
    for json_file in json_files:
        with open(json_file) as f:
            dreams = json.load(f)
            for png in dreams.keys():
                id = png.split(".")[0]
                data = dreams[png]
                cursor.execute(
                    "insert or replace into dreams (id, p, se, c, st, sa) values (?, ?, ?, ?, ?, ?)",
                    ( id, data["p"], data["se"], data["c"], data["st"], data["sa"]))
    connection.commit()
    add_fts(cursor, connection)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
