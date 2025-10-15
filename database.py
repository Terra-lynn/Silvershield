import sqlite3

connect = sqlite3.connect('silvershieldDatabase.db')
cursor = connect.cursor()
cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT UNIQUE NOT NULL,
                address TEXT NOT NULL,
                password_hash TEXT NOT NULL )
''')
connect.commit()
connect.close()