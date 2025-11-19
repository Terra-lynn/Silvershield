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

@app.route('/email')
def email():
    return render_template("email.html")

@app.route('/sms')
def sms():
    return render_template("sms.html")

@app.route('/phone')
def phone():
    return render_template("phone.html")

@app.route('/web')
def web():
    return render_template("web.html")

# connect to ollama locally
def call_ollama(prompt, model="llama3"):
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
    app_type = data.get("type", "email")
    difficulty = data.get("difficulty", "easy")

    # LLM changes depending on type
    examples = {
        "email": "Generate a realistic email scenario. It can be a scam or safe message. Include sender name, subject, and message body in JSON format with a boolean field 'is_scam'.",
        "sms": "Generate a text message(SMS). Some should be scams, some safe. Respond in JSON with 'sender_name', 'content', and 'is_scam'.",
        "call":"Generate a phone call transcript snippet that could be a scam or safe. Include caller name, short transcript, and 'is_scam' field.",
        "web":  "Generate a fake or real website scenario. Include 'website', short description, and 'is_scam'."
    }

    prompt = f"""
    You are a cybersecurity instructor teaching elders on different scams.
    Generate a realistic{app_type} scenario for training users to detect scams.
    Difficulty: {difficulty}.
    Formate the response in JSON with all required fields:

    Example formatiting for {app_type}:
    {examples[app_type]}

    Also include:
    -"label": "scam" or "not_scam"
    -"clues": [list of clues explaining why it is or is not a scam"]
    """

    result = call_ollama(prompt)
    try:
        scenario = json.loads(result)
    except Exception:
        scenario = {"content",result}

    return jsonify(success=True, scenario=scenario)



# analyze users answers
@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    user_choice = data['user_choice']  # scam or not_scam
    message = data['message']

 # Ollama will evaluate users response
    response = ollama.chat(model="llama3", messages=[
        {"role":"system", "content": "You are a cybersecurity educator. Evaluate whether users choice is correct. "},
        {"role": "user", "content": f"The user labeled this message as '{user_choice}'. The message is:\n\n{message}\n\nWas the user correct? Give concise feedback."}
    ])

    feedback=response["message"]["content"]
    return jsonify({
       "feedback":{
           "correct": "Correct" in feedback or "right" in feedback.lower(),
           "feedback": feedback
       }
   })


@app.route('/save_progress')
def save_progress():
    flash('Progress saved successfully!', 'success')
    return render_template("dashboard.html")

#Main
if __name__ == '__main__':
    app.run(debug=True)
