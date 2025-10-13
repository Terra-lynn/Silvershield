//Getting buttons
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

//Current slide
let currentSlide = 1;

//Slide function
function showSlide(slideNumber)
{
    const slides = document.querySelectorAll(".slide");
    slides.forEach(slide => slide.classList.remove("active"));
    const slide = document.getElementById(`slide${slideNumber}`);
    if (slide)
        slide.classList.add("active");
    currentSlide = slideNumber;
}

//Error function
function errorElement(input)
{
    let error = input.nextElementSibling;
    if (!error || !error.classList.contains("error-message"))
    {
        error = document.createElement("div");
        error.classList.add("error-message");
        input.insertAdjacentElement("afterend", error);
    }

    return error;
}

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

//Next button events
nextButtons.forEach(btn => {
    btn.addEventListener("click", async(e) => {
        e.preventDefault();

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

//Back button events
backButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        if(currentSlide > 1)
        {
            showSlide(currentSlide - 1);
        }
    });
});

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
    }
    else
    {
        alert("Registration failed: " + result.message);
    }
});