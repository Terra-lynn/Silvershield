from flask import Flask, render_template, request, jsonify, flash, session
from user_login import user_registration, verifying_login
from TWOFA import send_otp, verify_otp
from config.GROQKEY import GROQ_KEY
import sqlite3
import json
import requests

app = Flask(__name__)

app.secret_key = "SECRET KEY"


#================================
# Loading difficulty from
#       the database
#================================
def get_difficulty():
    username = session.get('username')
    if not username:
        return 1

    with sqlite3.connect('silvershieldDatabase.db') as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT difficulty FROM users WHERE username = ?', (username,))
        row = cursor.fetchone()

    if row is None:
        return 1

    return row[0]

#================================
# Saving difficulty to the
#        database
#================================
def set_difficulty(level):
    #1 - easy, 2 - medium, 3 - hard, 4 - very hard
    level = max(1, min(4, level))
    session["difficulty"] = level

    username = session.get('username')
    if not username:
        return

    with sqlite3.connect('silvershieldDatabase.db') as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE users SET difficulty = ? WHERE username = ?', (level, username))
        conn.commit()

#================================
#
#         Page routes
#
#================================
@app.route('/')
def index():
    return render_template("homePage.html")

@app.route('/login', methods=['GET'])
def login():
    return render_template("loginPage.html")

@app.route('/account_creation')
def account_creation():
    return render_template("accountCreation.html")

@app.route('/dashboard')
def dashboard():
    return render_template("dashboard.html")

@app.route('/module1')
def module1():
    return render_template("desktopPage.html")


@app.route('/module2')
def module2():
    return render_template("MobilePage.html")

@app.route('/logout')
def logout():
    flash('You have been logged out.', 'info')
    return render_template("loginPage.html")

@app.route('/save_progress')
def save_progress():
    flash('Progress saved successfully!', 'success')
    return render_template("dashboard.html")

#================================
#
#      Registration route
#
#================================
@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    password = request.form['password']
    email = request.form['email']
    phone = request.form['phone']
    address = request.form['address']

    success, message = user_registration(username, password, email, phone, address)
    return jsonify(success=success, message=message)

#================================
#
#      Logging in route
#
#================================
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

    #Storing logged in user for session
    session["username"] = usernameorEmail

    #Loading difficulty from database into session
    session["difficulty"] = get_difficulty()

    try:
        send_otp(phone)
        return jsonify({"success": True, "otp_sent": True, "phone": phone})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

#================================
#
#       Validation route
#
#================================
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

#================================
#
#         Email AI
#
#================================
@app.route("/generate-email", methods=['POST'])
def generate_email():
    difficulty = get_difficulty()

    difficulty_text = {
        1: "Write a very obvious scam email. Make it easy to identify.",
        2: "Write a moderately subtle scam email. Some clues remain.",
        3: "Write a difficult scam email. Only minor clues should reveal it.",
        4: "Write an extremely convincing scam email. Only trained users could spot it.",
    }[difficulty]

    theme = request.json.get("theme", "General Scam Training Email")

    prompt = f"""
You are generating a training email for a cybersecurity simulation.

### IMPORTANT RULES ###
- Output **ONLY** valid HTML.
- Do NOT write any explanations.
- Do NOT say phrases like "Here is the email", "Below is", or similar.
- Do NOT use markdown.
- The response must begin immediately with: <b>From:</b>
- Nothing is allowed before the HTML. No sentences. No descriptions.

### TASK ###
Create a safe but realistic scam-training email in HTML format.
DIFFICULTY LEVEL: {difficulty}
{difficulty_text}

Follow this structure EXACTLY:

<b>From:</b> Fake Security Alert &lt;no-reply@alert-center-security.com&gt;<br>
<b>To:</b> user@example.com<br>
<b>Subject:</b> (Generate subject)<br>
<b>Date:</b> (Generate timestamp)<br><br>

<hr>

<div style="margin-top: 12px; font-size: 15px;">
(Generate 2–4 paragraphs appropriate for difficulty level.)
<br><br>

Include one suspicious-looking link:
<i>https://secure-update-center-check.net/login</i>
<br><br>

Best regards,<br>
Security Operations Team<br>
alert-center-security.com
</div>

RULES:
- MUST output pure HTML.
- DO NOT use real companies.
- Email must be fake but realistic for the difficulty level.
"""
    headers = {
        "Authorization": f"Bearer {GROQ_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json=payload
    )

    data = response.json()

    print("GROQ RAW RESPONSE:", data)

    #If Groq returns any error
    if "error" in data:
        return jsonify({
            "success": False,
            "error": data["error"]["message"]
        }), 500

    #If "choices" is missing
    if "choices" not in data or len(data["choices"]) == 0:
        return jsonify({
            "success": False,
            "error": "Groq API returned no choices. Possibly rate-limited or wrong model."
        }), 500

    #Normal successful response
    email_text = data["choices"][0]["message"]["content"]
    return jsonify({"success": True, "email": email_text})

@app.route("/api/analyze", methods=["POST"])
def analyze_email():
    data = request.get_json()

    user_choice = data.get("user_choice")
    message = data.get("message")

    if not user_choice or not message:
        return jsonify({"success": False, "error": "Missing fields"}), 400

    difficulty = get_difficulty()

    prompt = f"""
You are a cybersecurity training AI.

The trainee read this email:

--- EMAIL START ---
{message}
--- EMAIL END ---

They selected: '{user_choice.upper()}'.

Your job: evaluate whether their choice is correct.

###STRICT RULES ###
- Respond with **ONLY** valid JSON.
- NO code fences.
- NO markdown.
- NO explanation outside the JSON.
- ONLY the JSON object.
- Use double quotes everywhere.

###JSON FORMAT (required):
{{
  "correct": true or false,
  "feedback": "A short explanation.",
  "clues": ["2-4 clues showing why"]
}}
"""

    headers = {
        "Authorization": f"Bearer {GROQ_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "user", "content": prompt}]
    }

    groq_resp = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json=payload
    )

    data = groq_resp.json()

    if "choices" not in data:
        return jsonify({"success": False, "error": "Groq API error"}), 500

    raw = data["choices"][0]["message"]["content"].strip()

    print("\n\n===== RAW MODEL OUTPUT =====")
    print(raw)
    print("============================\n\n")

    #Strip markdown fences if Groq adds them
    if raw.startswith("```"):
        raw = raw.replace("```json", "").replace("```", "").strip()

    #Safely attempt to parse
    try:
        parsed = json.loads(raw)
    except Exception as e:
        print("JSON PARSE ERROR:", e)
        return jsonify({
            "success": True,
            "feedback": {
                "correct": False,
                "feedback": "AI could not parse the response.",
                "clues": []
            },
            "difficulty_now": difficulty
        })

    #Update difficulty
    if parsed.get("correct"):
        set_difficulty(difficulty + 1)
    else:
        set_difficulty(1)

    return jsonify({
        "success": True,
        "feedback": parsed,
        "difficulty_now": get_difficulty()
    })

#Main
if __name__ == '__main__':
    app.run(debug=True)