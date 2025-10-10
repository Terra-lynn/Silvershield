from flask import Flask, render_template, request, jsonify
from user_login import user_registration
import sqlite3

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("accountCreation.html")

@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    password = request.form['password']
    email = request.form['email']
    phone = request.form['phone']
    address = request.form['address']

    success, message = user_registration(username, password, email, phone, address)
    return jsonify(success=success, message=message)

@app.route('/check_username')
def check_username():
    username = request.args.get("username")

    if not username:
        return jsonify({"exists": False})

    connection = sqlite3.connect("silvershieldDatabase.db")
    cursor = connection.cursor()
    cursor.execute("SELECT 1 FROM users WHERE username = ?", (username,))
    exists = cursor.fetchone() is not None
    connection.close()

    return jsonify({"exists": exists})

@app.route('/check_email')
def check_email():
    email = request.args.get("email")

    if not email:
        return jsonify({"exists": False})

    connection = sqlite3.connect("silvershieldDatabase.db")
    cursor = connection.cursor()
    cursor.execute("SELECT 1 FROM users WHERE email = ?", (email,))
    exists = cursor.fetchone() is not None
    connection.close()

    return jsonify({"exists": exists})

if __name__ == '__main__':
    app.run(debug=True)