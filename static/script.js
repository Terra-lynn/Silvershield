//Console log for debugging purposes
//console.log("script.js loaded successfully");

/*************************
   Registration elements
**************************/
const nextButtons = document.querySelectorAll(".next-btn")
const backButtons = document.querySelectorAll(".back-btn")
const submit = document.getElementById("submit")

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone-number");
const streetAddressInput = document.getElementById("street-address");
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const zipCodeInput = document.getElementById("zip-code");

const sendOTPBtn = document.getElementById("send-otp-btn");
const verifyOTPBtn = document.getElementById("verify-otp-btn");
const otpSection = document.getElementById("otp-section");
const otpError = document.getElementById("otp-error");

/*************************
      Login elements
**************************/
const loginSlides = document.querySelectorAll(".login-slide")
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginOTPCodeInput = document.getElementById("login-otp-code");
const loginOtpError = document.querySelector(".login-otp-error");

//login buttons
const loginNext = document.querySelector(".login-next");
const loginVerifyOTPBtn = document.querySelector(".login-verify-otp-btn");

let currentPhoneReg = "";
let currentPhoneLogin = "";
let currentSlide = 1;

/*************************
     Slide functions
**************************/
//Slide function
function showSlide(slideNumber)
{
    const slides = document.querySelectorAll(".slide");
    slides.forEach(slide => slide.classList.remove("active"));
    const slide = document.getElementById(`slide${slideNumber}`);

    if (slide)
    {
        slide.classList.add("active");
    }

    currentSlide = slideNumber;
}

function showLoginSlide(slideNumber)
{
    loginSlides.forEach(slide => slide.classList.remove("active"));
    const slide = document.getElementById(`login-slide${slideNumber}`);

    if (slide)
    {
        slide.classList.add("active");
    }
}

//Error function
function errorElement(input)
{
    if (!input)
    {
        return null;
    }

    let error = input.nextElementSibling;

    if (!error || !error.classList.contains("error-message"))
    {
        error = document.createElement("div");
        error.classList.add("error-message");
        input.insertAdjacentElement("afterend", error);
    }

    return error;
}

/*************************
 Login Page event listeners
**************************/

//If check to ensure that there is no fails on login and account creation pages
if(loginNext)
{
    //Console log for debugging purposes
    console.log("loginNextButtons:", loginNext);
    loginNext.addEventListener("click", async () => {
        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();

        if (!username || !password)
        {
            alert ("Please fill in username and password");
            return;
        }

        const response = await fetch("/login", {
            method: "POST",
            body: new URLSearchParams({username, password})
        });

        const result = await response.json();

        if (!result.success)
        {
            alert(result.message);
            return;
        }

        if (result.otp_sent)
        {
            currentPhoneLogin = result.phone;
            showLoginSlide(2);
            loginOTPCodeInput.focus();
            loginOtpError.textContent = "OTP sent to your registered phone";
        }
    })
}

if(loginVerifyOTPBtn)
{
    console.log("loginVerifyButtons:", loginVerifyOTPBtn);
    //Verify button after user inputs OTP
    loginVerifyOTPBtn.addEventListener("click", async () => {
        const code = loginOTPCodeInput.value.trim();

        if (!code)
        {
            loginOtpError.textContent = "Please enter the OTP.";
            return;
        }

        const response = await fetch("/verify_otp", {
            method: "POST",
            body: new URLSearchParams({phone: currentPhoneLogin, code})
        });

        const result = await response.json();

        if (result.success)
        {
            alert("Login successful!");
            window.location.href = "/dashboard";
        }
        else
        {
        loginOtpError.textContent = result.message;
        }
    })
}


/*************************
  Registration page event
        listeners
**************************/
if(nextButtons.length > 0)
{
    console.log("nextButtons:", nextButtons);
    //Next button events
    nextButtons.forEach(btn => {
        btn.addEventListener("click", async(e) => {
            e.preventDefault();
            console.log("➡️ Continue button clicked on slide:", currentSlide);
            //Performing validation for the current step
            let letProceed = true;

            //Switch case for each slide
            switch(currentSlide)
            {
                case 1: //Username Slide
                    let usernameValue = usernameInput.value.trim();
                    letProceed = await validateUsername(usernameValue);
                    break;
                case 2: //Password slide
                    let passwordValue = passwordInput.value.trim();
                    letProceed = await validatePassword(passwordValue);
                    break;
                case 3: //Email slide
                    let emailValue = emailInput.value.trim();
                    letProceed = await validateEmail(emailValue);
                    break;
                case 4: //Phone number slide
                    let phoneValue = phoneInput.value.trim();
                    letProceed = await validatePhone(phoneValue);

                    //Check if OTP verified
                    const otpMessage = otpError.textContent.toLowerCase();
                    if (!otpMessage.includes("verified"))
                    {
                        otpError.textContent = "Please verify your phone number before continuing.";
                        letProceed = false;
                    }
                    break;
                case 5: //Address slide
                    letProceed = await validateAddress();
                    break;
                default:
                    letProceed = true;
            }

            if (letProceed)
            {
                showSlide(currentSlide + 1);
            }
        });
    });
}

if(backButtons.length > 0)
{
    console.log("backButtons:", backButtons);
    //Back button events
    backButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if(currentSlide > 1)
            {
                showSlide(currentSlide - 1);
            }
        });
    })
}

if(verifyOTPBtn)
{
    console.log("verifyOTPBtn:", verifyOTPBtn);
    verifyOTPBtn.addEventListener("click", async () => {
        const phone = phoneInput.value.trim();
        const code = document.getElementById("otp-code").value.trim();

        const response = await fetch("/verify_otp", {
            method: "POST",
            body: new URLSearchParams({ phone, code })
        });

        const result = await response.json();
        if (result.success) {
            alert("Phone verified!");
            otpError.textContent = "Phone verified!";
            otpSection.style.display = "none";
            document.querySelector("#slide4 .next-btn").disabled = false;
        }
        else
        {
            otpError.textContent = result.message;
        }
    });
}

if(submit)
{
    console.log("submitButtons:", submit);
    //Submit button events
    submit.addEventListener("click", async (e) => {
        e.preventDefault();

        //Validating all fields before submission
        const usernameValid = await validateUsername(usernameInput.value.trim());
        const passwordValid = await validatePassword(passwordInput.value.trim());
        const emailValid = await validateEmail(emailInput.value.trim());
        const phoneValid = await validatePhone(phoneInput.value.trim());
        const addressValid =await validateAddress();

        if (!usernameValid || !passwordValid || !emailValid || !phoneValid || !addressValid)
        {
            return;
        }

        //Form submission if all inputs are valid
        const formData = new FormData(document.getElementById("signupForm"));

        const response = await fetch("/register", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if(result.success)
        {
            alert("Registration successful");
            window.location.href = "/";
        }
        else
        {
            alert("Registration failed: " + result.message);
        }
    });
}

/*************************
   Validation functions
**************************/
async function validateUsername(usernameValue)
{
    const usernameError = errorElement(usernameInput);
    const alphaReg = /^[a-zA-Z0-9]+$/;
    const minLength = 5;
    const maxLength = 15;

    if (usernameValue === '')
    {
        usernameError.textContent = 'Username cannot be blank.';
        usernameInput.classList.add('error');
        return false;
    }
    else if (!alphaReg.test(usernameValue))
    {
        usernameError.textContent = 'Username can only contain letters and numbers';
        usernameInput.classList.add('error');
        return false;
    }
    else if (usernameValue.length < minLength || usernameValue.length > maxLength)
    {
        usernameError.textContent = `Username must be a minimum of ${minLength} characters or maximum of ${maxLength} characters long.`;
        usernameInput.classList.add('error');
        return false;
    }

    //Checking with backend to see if username already exists
    try
    {
        const response = await fetch(`/check_username?username=${encodeURIComponent(usernameValue)}`);
        const data = await response.json();

        if (data.exists)
        {
            usernameError.textContent = 'Username already exists.';
            usernameInput.classList.add('error');
            return false;
        }
    }
    catch (error)
    {
        console.error("Error checking username: ", error);
        usernameError.textContent = 'Could not verify username. Please try again';
        usernameInput.classList.add('error');
        return false;
    }

    usernameError.textContent = '';
    usernameInput.classList.remove('error');
    return true;
}

async function validatePassword(passwordValue)
{
    const passwordError = errorElement(passwordInput);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>/?`~]/;
    const hasUppercase = /[A-Z]/;
    const hasLowercase = /[a-z]/;
    const hasNumber = /[\d]/;
    const minLength = 8;
    const maxLength = 15;

    if (passwordValue === '')
    {
        passwordError.textContent = 'Password cannot be blank.';
        passwordInput.classList.add('error');
        return false;
    }
    else if (passwordValue.length < minLength || passwordValue.length > maxLength)
    {
        passwordError.textContent = `Password must be a minimum of ${minLength} characters or maximum of ${maxLength} characters long`;
        passwordInput.classList.add('error');
        return false;
    }
    else if (!hasUppercase.test(passwordValue))
    {
        passwordError.textContent = 'Password must have at least one capital letter';
        passwordInput.classList.add('error');
        return false;
    }
    else if (!hasLowercase.test(passwordValue))
    {
        passwordError.textContent = 'Password must have at least one lowercase letter';
        passwordInput.classList.add('error');
        return false;
    }
    else if (!hasNumber.test(passwordValue))
    {
        passwordError.textContent = 'Password must contain at least one numbers';
        passwordInput.classList.add('error');
        return false;
    }
    else if (!hasSpecial.test(passwordValue))
    {
        passwordError.textContent = 'Password must have at least one special character';
        passwordInput.classList.add('error');
        return false;
    }

    passwordError.textContent = '';
    passwordInput.classList.remove('error');
    return true;
}

async function validateEmail(emailValue)
{
    const emailError = errorElement(emailInput);
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const minLength = 5
    const maxLength = 50;

    if (emailValue === '')
    {
        emailError.textContent = 'Email cannot be blank.';
        emailInput.classList.add('error');
        return false;
    }
    else if (emailValue.length < minLength || emailValue.length > maxLength)
    {
        emailError.textContent = `Email must be a minimum of ${minLength} characters or maximum of ${maxLength} characters long`;
        emailInput.classList.add('error');
        return false;
    }
    else if (!emailReg.test(emailValue))
    {
        emailError.textContent = 'Please enter a valid email';
        emailInput.classList.add('error');
        return false;
    }
    try
    {
        const response = await fetch(`/check_email?email=${encodeURIComponent(emailValue)}`);
        const data = await response.json();

        if (data.exists)
        {
            emailError.textContent = 'Email already exists.';
            emailInput.classList.add('error');
            return false;
        }
        else
        {
            emailError.textContent = '';
            emailInput.classList.remove('error');
            return true;
        }
    }
    catch (error)
    {
        console.error("Error checking email: ", error);
        emailError.textContent = 'Could not verify email. Please try again';
        emailInput.classList.add('error');
        return false;
    }

    emailError.textContent = '';
    emailInput.classList.remove('error');
    return true;
}

async function validatePhone(phoneValue)
{
    const phoneError = errorElement(phoneInput);
    const phoneReg = /^(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/;

    if (phoneValue === '')
    {
        phoneError.textContent = 'Phone number cannot be blank';
        phoneInput.classList.add('error');
        return false;
    }
    else if (!phoneReg.test(phoneValue))
    {
        phoneError.textContent = 'Please enter a valid phone number';
        phoneInput.classList.add('error');
        return false;
    }

    phoneError.textContent = '';
    phoneInput.classList.remove('error');
    return true;
}

function validateStreet(streetValue)
{
    const streetAddressInputError = errorElement(streetAddressInput);
    const streetReg = /^\d+\s+[A-Za-z0-9\s.'-]+$/;

    if (streetValue === '')
    {
        streetAddressInputError.textContent = 'Street cannot be blank.';
        streetAddressInput.classList.add('error');
        return false;
    }
    else if (!streetReg.test(streetValue))
    {
        streetAddressInputError.textContent = 'Please enter a valid street address';
        streetAddressInput.classList.add('error');
        return false;
    }

    streetAddressInputError.textContent = '';
    streetAddressInput.classList.remove('error');
    return true;
}

function validateCity(cityValue)
{
    const cityError = errorElement(cityInput);
    const cityReg = /^[A-Za-z]+(?:[\s-'][A-Za-z]+)*$/;

    if (cityValue === '')
    {
        cityError.textContent = 'City cannot be blank.';
        cityInput.classList.add('error');
        return false;
    }
    else if (!cityReg.test(cityValue))
    {
        cityError.textContent = 'Please enter a valid city';
        cityInput.classList.add('error');
        return false;
    }

    cityError.textContent = '';
    cityInput.classList.remove('error');
    return true;
}

document.addEventListener("DOMContentLoaded", () => {
    const states = [
    ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
    ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
    ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"],
    ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"],
    ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"],
    ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
    ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"],
    ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"],
    ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"],
    ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"],
    ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
    ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"],
    ["WI", "Wisconsin"], ["WY", "Wyoming"]
  ];

    const stateSelect = document.getElementById("state");

    states.forEach (([abbr, name]) => {
        const option = document.createElement("option");
        option.value = abbr;
        option.textContent = name;
        stateSelect.appendChild(option);
    });
});

async function validateState(stateValue)
{
    if(!stateValue)
    {
        const stateError = errorElement(stateInput);
        stateError.textContent = "Please select a state";
        stateInput.classList.add("error");
        return false;
    }

    stateInput.classList.remove("error");
    return true;
}

function validateZip(zipValue)
{
    const zipCodeInputError = errorElement(zipCodeInput);
    const zipReg = /^\d{5}(-\d{4})?$/;

    if (zipValue === '')
    {
        zipCodeInputError.textContent = 'Zip code cannot be blank.';
        zipCodeInput.classList.add('error');
        return false;
    }
    else if (!zipReg.test(zipValue))
    {
        zipCodeInputError.textContent = 'Please enter a valid zip code';
        zipCodeInput.classList.add('error');
        return false;
    }

    zipCodeInputError.textContent = '';
    zipCodeInput.classList.remove('error');
    return true;
}

async function validateAddress()
{
    const streetValid = validateStreet(streetAddressInput.value);
    const cityValid = validateCity(cityInput.value);
    const stateValid = await validateState(stateInput.value);
    const zipValid = validateZip(zipCodeInput.value);

    return streetValid && cityValid && stateValid && zipValid;
}

console.log("sendOTPBtn:", sendOTPBtn);
sendOTPBtn.addEventListener("click", async () => {
    const phone = phoneInput.value.trim();

    if(!phone)
        {
            return;
        }

    const response = await fetch("/send_otp", {
        method: "POST",
        body: new URLSearchParams({phone})
    });

    const result = await response.json();
    if(result.success)
    {
        otpSection.style.display = "block";
        otpError.textContent = "OTP sent to your phone";
        currentPhoneReg = phone;
    }
    else
    {
        otpError.textContent = result.message;
    }
})



let currentMessage ="";
let currentType ="";


// loader for each module template
async function loadScenario(appType) {
    currentType = appType;
    const scenarioBody = document.getElementById("scenarioBody");

    //Hide apps
    document.querySelector(".apps").style.display="none";
    scenarioBody.innerHTML = '<p class="loading">Loading ${appType}...</p>';

    try {

        //load apps
        const resp = await fetch(`/static/snippets/${appType}.html`);
        const respApp = await resp.text();
        scenarioBody.innerHTML = respApp;

        // fetch scenario from API
        const res = await fetch("/api/generate_scenario", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({type:appType})
        });

        const data = await res.json();
        const sc = data.scenario || {};

        //Save message text to analyze
        currentMessage = sc.content || sc.message || sc.transcript || sc.text || "";

        //add listeners to buttons
        const scamBtn = document.getElementById("markScam");
        const safeBtn = document.getElementById("markSafe")
        if(scamBtn) scamBtn.onclick = () => markAs("scam");
        if(safeBtn) safeBtn.onclick = () => markAs("not_scam");

    } catch (err) {
        console.error("Error loading scenario", err);
        scenarioBody.innerHTML = `<p class="error">Failed to load ${appType}. Try again.</p>`;
    }
}

//scenarios for each application
function scenario(appType, scenario) {
   if(appType === "email"){
       document.querySelector(".sender-name").innerText = escapeHTML(scenario.sender_name || scenario.from || "Unknown Sender");
       document.querySelector(".sender-address").innerText = escapeHTML(scenario.sender_email || "");
       document.querySelector(".email-subject").innerText = escapeHTML(scenario.subject || scenario.title || "");
       document.querySelector(".email-body").innerText = escapeHTML(scenario.content || scenario.message || "");
    } else if (appType === "sms") {
       document.querySelector(".sms-header strong").innerText = escapeHTML(scenario.sender || scenario.from || "Unknown");
       document.querySelector(".sms-number").innerText = escapeHTML(scenario.number || "");
       document.querySelector(".sms-bubble").innerText = escapeHTML(scenario.message || scenario.content || "");
    } else if (appType === "call") {
       document.querySelector(".call-caller strong").innerText = escapeHTML(scenario.caller || "Unknown");
       document.querySelector(".call-number").innerText = escapeHTML(scenario.number || "");
       document.querySelector(".call-transcript").innerText = escapeHTML(scenario.transcript || scenario.content || "");
    } else if (appType === "web") {
       document.querySelector(".web-header strong").innerText = escapeHTML(scenario.site || scenario.title || "Website");
       document.querySelector(".web-text").innerText = escapeHTML(scenario.content || scenario.text || "");
       const imgTag = document.querySelector(".web-screenshot");
       if (imgTag && scenario.screenshot) imgTag.src = `/static/images/${scenario.screenshot}`;
    }
   }

   //Analyze users choice of scam or not scam
async function markAs(choice) {
    try{
        const res = await fetch("/api/analyze", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                user_choice: choice,
                message: currentMessage,
                type: currentType
            })
        });

        const data = await res.json();
        const fb = data.feedback || {};
        const correct = fb.correct === true || fb.correct === "true";
        const text = fb.feedback || fb.text || "";

        const feedbackDiv = document.getElementById("feedback");
        if (feedbackDiv) {
            feedbackDiv.innerText = (correct ? "✅ Correct. " : "❌ Incorrect. ") + text;
            feedbackDiv.style.color = correct ? "green" : "crimson";
        }

    } catch (err) {
        console.error("Error analyzing:", err);
        const feedbackDiv = document.getElementById("feedback");
        if (feedbackDiv) {
            feedbackDiv.innerText = "Error analyzing. Try again.";
            feedbackDiv.style.color = "crimson";
        }
    }
}

// Escape HTML to prevent injection
function escapeHTML(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
        .replaceAll("\n", "<br>");
}

// Go back to app grid
function backToApps() {
    document.getElementById("scenarioBody").innerHTML = "";
    document.querySelector(".apps").style.display = "grid";
}

//analyze users choice and give feedback
async function analyze(choice) {
    try {
        const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_choice: choice,
                message: currentMessage,
                type: currentType
            })
        });
        const data = await res.json();
        const fd = data.feedback || data;
        const text = fb.feeback || fb.text || '';
        const correct = fb.correct === true || fb.correct === "true";
        feedback(currentType, (correct ? "✅ Correct. " : "❌ Incorrect. ") + (text || ''), correct);
    } catch (err) {
        console.error('analyze error', err);
        feedback(currentType, 'Error analyzing. Try again.');
    }
}

