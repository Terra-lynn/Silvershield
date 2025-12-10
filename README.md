Silvershield - Cybersecurity Training Simulator

Silvershield is an education web app that simulates phishing, scam SMS, scam call, and malicious site scenarios to help older users learn to spot cyber threats. The platform provides fake but realistic phishing emails, scam calls, scam text messages, and fake websites, and lets users guess whether something is a scam or safe. The system will provide feedback and adjust the difficulty of each simulation as needed.

⭐ Features
- Generate realistic phishing or legitimate content for:
  - Email (Mobile & Desktop)
  - SMS (Mobile)
  - Phone Calls (Mobile)
  - Web/Search Results (Mobile & Desktop)
- Interactive UI simulating a mobil phone for SMS/Call/Web scenarios
- Session-based user login/registration and two factor authentication
- Difficulty tracking per user and per content type
- Feedback system as user marks a scenario as "real" or "fake"
- SQLite database for user data and difficulty settings

⭐ Getting Started - Local setup
Prerequisies:
  - Python 3.8
  - pip for python packages
  - (Optional) Virtual Environment

Installation & Run
# Clone the repo
git clone https://github.com/Terra-lynn/Silvershield.git
cd Silvershield

# (Recommended) create virtualenv
python -m venv venv
source venv/bin/activate  # (on Windows: venv\Scripts\activate)

# Install dependencies
pip install -r requirements.txt   # or manually install Flask, requests, etc.

# Create `.env` or config file for API keys
# Example: config/GROQKEY.py containing GROQ_KEY = "<your_key>"
# And config/TWILIOKEY.py if using Twilio for OTP

# Run the server
python app.py

NOTE: You will need to create a GROQ and Twilio account to generate the neccessary keys for this project to work.
