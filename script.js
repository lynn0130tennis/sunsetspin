
console.log("SCRIPT LOADED");

// --------------------
// SUPABASE
// --------------------

const SUPABASE_URL = "https://uppzqygxtpoifkaddoyi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcHpxeWd4dHBvaWZrYWRkb3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTk5OTIsImV4cCI6MjA5NTEzNTk5Mn0.wfHlzl-msNvfWrcr3BaQYV4YVnoRXK7dq6MPV5VsKrM";


console.log("SCRIPT LOADED");


const client =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

// --------------------
// DOM ELEMENTS
// --------------------

const signinBtn =
    document.getElementById("signin-btn");

const signupBtn =
    document.getElementById("signup-btn");

const logoutBtn =
    document.getElementById("logout-btn");

const userStatus =
    document.getElementById("user-status");

const registrationContainer =
    document.getElementById("registration-form-container");

const loginMessage =
    document.getElementById("login-message");

const authModal =
    document.getElementById("auth-modal");

const authTitle =
    document.getElementById("auth-title");

const authUsername =
    document.getElementById("auth-username");

const authEmail =
    document.getElementById("auth-email");

const authPassword =
    document.getElementById("auth-password");

const authPhone =
    document.getElementById("auth-phone");
// 👇 ADD THIS RIGHT HERE
if (authPhone) {

    authPhone.addEventListener("input", (e) => {

        let value = e.target.value;

        // remove non-digits
        value = value.replace(/\D/g, "");

        // limit to 10 digits
        value = value.substring(0, 10);

        // format XXX-XXX-XXXX
        if (value.length > 6) {
            value = value.replace(
                /(\d{3})(\d{3})(\d{0,4})/,
                "$1-$2-$3"
            );
        } else if (value.length > 3) {
            value = value.replace(
                /(\d{3})(\d{0,3})/,
                "$1-$2"
            );
        }

        e.target.value = value;
    });
}

const authSubmitBtn =
    document.getElementById("auth-submit-btn");

const authMessage =
    document.getElementById("auth-message");

const closeModal =
    document.getElementById("close-modal");

// --------------------
// AUTH MODE
// --------------------

let authMode = "signin";

// --------------------
// MODAL
// --------------------

function openModal(mode) {

    authMode = mode;

    authModal.style.display = "block";

    authMessage.innerText = "";

    authEmail.value = "";
    authPassword.value = "";

    if (authUsername) authUsername.value = "";
    if (authPhone) authPhone.value = "";

    if (mode === "signup") {

        authTitle.innerText =
            "Create Account";

        if (authUsername)
            authUsername.style.display = "block";

        if (authPhone)
            authPhone.style.display = "block";

    } else {

        authTitle.innerText =
            "Sign In";

        if (authUsername)
            authUsername.style.display = "none";

        if (authPhone)
            authPhone.style.display = "none";
    }
}

function closeAuthModal() {
    authModal.style.display = "none";
}

// --------------------
// BUTTON EVENTS
// --------------------

signupBtn.addEventListener("click", () =>
    openModal("signup")
);

signinBtn.addEventListener("click", () =>
    openModal("signin")
);

closeModal.addEventListener("click", closeAuthModal);

window.addEventListener("click", (e) => {
    if (e.target === authModal) closeAuthModal();
});

// --------------------
// AUTH SUBMIT
// --------------------

authSubmitBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    const email =
        authEmail.value.trim();

    const password =
        authPassword.value.trim();

    const username =
        authUsername
            ? authUsername.value.trim()
            : "";

    const phone =
        authPhone
            ? authPhone.value.trim()
            : "";

    // --------------------
    // VALIDATION
    // --------------------

    if (!email || !password) {
        authMessage.style.color = "red";
        authMessage.innerText =
            "Please enter email and password.";
        return;
    }

    if (authMode === "signup") {
       const phonePattern = /^\+?[1-9]\d{1,14}$/; 
        if (!username) {
            authMessage.style.color = "red";
            authMessage.innerText =
                "Please enter a username.";
            return;
        }

        if (!phone) {
            authMessage.style.color = "red";
            authMessage.innerText =
                "Please enter a phone number.";
            return;
        }
        
         if (!phonePattern.test(phone)) {
        authMessage.style.color = "red";
        authMessage.innerText =
            "Enter a valid phone number (numbers only, optional +country code).";
        return;
    }

    let result;
    }
    // --------------------
    // SIGN UP
    // --------------------

    if (authMode === "signup") {

        result = await client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    phone
                }
            }
        });

        console.log("SIGNUP RESULT:", result);

        if (result.error) {
            authMessage.style.color = "red";
            authMessage.innerText = result.error.message;
            return;
        }

        const user = result.data.user;

        const insertResult =
            await client
                .from("Registration")
                .insert([
                    {
                        Username: username,
                        Email: user.email || email,
                        phone: phone,
                        Created_At: new Date().toISOString()
                    }
                ]);

        console.log("INSERT RESULT:", insertResult);

        if (insertResult.error) {
            authMessage.style.color = "red";
            authMessage.innerText = insertResult.error.message;
            return;
        }

        authMessage.style.color = "green";
        authMessage.innerText =
            "Account created successfully!";

        setTimeout(() => {
            closeAuthModal();
            updateUI();
        }, 800);
    }

    // --------------------
    // SIGN IN
    // --------------------

    else {

        result =
            await client.auth.signInWithPassword({
                email,
                password
            });

        console.log("SIGNIN RESULT:", result);

        if (result.error) {
            authMessage.style.color = "red";
            authMessage.innerText = result.error.message;
            return;
        }

        authMessage.style.color = "green";
        authMessage.innerText =
            "Signed in successfully!";

        setTimeout(() => {
            closeAuthModal();
            updateUI();
        }, 500);
    }
});

// --------------------
// LOGOUT
// --------------------

logoutBtn.addEventListener("click", async () => {
    await client.auth.signOut();
    updateUI();
});

// --------------------
// UI UPDATE
// --------------------

async function updateUI() {

    const {
        data: { session }
    } = await client.auth.getSession();

    if (session) {

        const username =
            session.user.user_metadata?.username ||
            session.user.email;

        userStatus.innerText =
            `Signed in as ${username}`;

        signinBtn.style.display = "none";
        signupBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";

        registrationContainer.style.display = "block";
        loginMessage.style.display = "none";

    } else {

        userStatus.innerText = "Not signed in";

        signinBtn.style.display = "inline-block";
        signupBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";

        registrationContainer.style.display = "none";
        loginMessage.style.display = "block";
    }
}

// --------------------
// SESSION LISTENER
// --------------------

client.auth.onAuthStateChange(() => {
    updateUI();
});

// INIT
updateUI();
