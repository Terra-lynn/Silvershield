from flask import Flask, render_template, request, jsonify, flash
from user_login import user_registration, verifying_login
from TWOFA import send_otp, verify_otp
import sqlite3
import json
import requests



app = Flask(__name__)

#Page routes
@app.route('/')
def index():
    return render_template("homePage.html")

@app.route('/login', methods=['GET'])
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


#Login route for credential validation and OTP verification
@app.route('/login', methods=['POST'])
def login_post():
    usernameorEmail = request.form['username'].strip()
    password = request.form['password'].strip()

    valid, phone = verifying_login(usernameorEmail, password)

    if not valid:
        return jsonify({"success": False, "message": "Invalid username or password"})

    if not phone.startswith("+"):
        phone = "+1" + phone

    try:
        send_otp(phone)
        return jsonify({"success": True, "otp_sent": True, "phone": phone})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


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


@app.route('/dashboard')
def dashboard():
    return render_template("dashboard.html")

@app.route('/logout')
def logout():
    flash('You have been logged out.', 'info')
    return render_template("loginPage.html")


@app.route('/module1')
def module1():
    return render_template("moduel1.html")


@app.route('/module2')
def module2():
    return render_template("MobilePage.html")


# connect to ollama locally
def call_ollama(prompt, model="mistral"):
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model,
                "prompt": prompt,
            },
            timeout=60
        )

        # Ollama responses by default
        if response.status_code == 200:
            data = response.json()
            return data.get("response", "")
        else:
            return f"Ollam Error: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Connection error: {str(e)}"


# Generate a scam/not scam scenario with ollama
@app.route('/api/generate_scenario', methods=['POST'])
def generate_scenario():
    data = request.get_json()
    scenario_type = data.get("type", "email")
    intent = data.get("intent", "random")  # random scenarios
    difficulty = data.get("difficulty", "easy")

    prompt = f"""
    You are a cybersecurity training assistant for elderly users.
    Generate a realistic {scenario_type} {intent} message for a training simulation.
    Difficulty: {difficulty}.
    Include short, clear content suitable for a smartphone screen. 

    Return JSON:
    {{
        "title": "string (for inbox or caller name)",
        "content": "string(actual message or dialogue)",
        "label" : "scam" or "not_scam",
        "clues" : ["list of clues for feedback"]
    }}

        """

    result = call_ollama(prompt)
    try:
        scenario = json.loads(result)
    except Exception as e:
        scenario = {"content": result}

    return jsonify(success=True, scenario=scenario)


# analyze users answers
@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    user_choice = data['user_choice']  # scam or not_scam
    message = data['message']

    prompt = f"""
You are an educational LLM helping elderly users learn to spot scams.
The user saw this message:

{message}

They said it is '{user_choice}'.

Explain if the user is correct, and provide a short educational explanation.
Return JSON:
{{
"correct": true/false,
"feedback": "brief feedback text,
"highlight_clues": ["phrases or hints to highlight"]
}}

    """

    result = call_ollama(prompt)
    try:
        feedback = json.loads(result)
    except Exception:
        feedback = {"feedback": result, "correct": None}

    return jsonify(success=True, feedback=feedback)


@app.route('/save_progress')
def save_progress():
    flash('Progress saved successfully!', 'success')
    return render_template("dashboard.html")

#Main
if __name__ == '__main__':
    app.run(debug=True)
