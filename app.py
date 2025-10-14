from flask import Flask, render_template, request, jsonify
from user_login import user_registration
from TWOFA import send_otp, verify_otp
import sqlite3

app = Flask(__name__)

#Page routes
@app.route('/')
def index():
    return render_template("homePage.html")

@app.route('/login')
def login():
    return render_template("loginPage.html")

@app.route('/account_creation')
def account_creation():
    return render_template("accountCreation.html")

#Registration route after submission
@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    password = request.form['password']
    email = request.form['email']
    phone = request.form['phone']
    address = request.form['address']

    success, message = user_registration(username, password, email, phone, address)
    return jsonify(success=success, message=message)


#Validation routes
@app.route('/check_username')
def check_username():
    username = request.args.get("username")

    if not username:
        return jsonify({"exists": False})

    with sqlite3.connect("silvershieldDatabase.db") as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM users WHERE username = ?", (username,))
        exists = cursor.fetchone() is not None

    return jsonify({"exists": exists})

@app.route('/check_email')
def check_email():
    email = request.args.get("email")

    if not email:
        return jsonify({"exists": False})

    with sqlite3.connect("silvershieldDatabase.db") as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM users WHERE email = ?", (email,))
        exists = cursor.fetchone() is not None

    return jsonify({"exists": exists})

@app.route('/send_otp', methods=['POST'])
def send_otp_route():
    phone = request.form['phone']

    if not phone.startswith("+"):
        phone = "+1" + phone

    try:
        send_otp(phone)
        return jsonify({"success": True, "message": "OTP sent"})
    except Exception as e:
        print("Error sending OTP", e)
        return jsonify({"success": False, "message": str(e)})

@app.route('/verify_otp', methods=['POST'])
def verify_otp_route():
    phone = request.form['phone']
    code = request.form['code']

    if not phone.startswith("+"):
        phone = "+1" + phone

    try:
        if verify_otp(phone, code):
            return jsonify({"success": True, "message": "OTP verified"})
        else:
            return jsonify({"success": False, "message": "OTP not verified"})
    except Exception as e:
        print("Error verifying OTP", e)
        return jsonify({"success": False, "message": str(e)})

#Main
if __name__ == '__main__':
    app.run(debug=True)