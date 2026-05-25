
console.log("SCRIPT LOADED");

// --------------------
// SUPABASE
// --------------------

const SUPABASE_URL = "https://uppzqygxtpoifkaddoyi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcHpxeWd4dHBvaWZrYWRkb3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTk5OTIsImV4cCI6MjA5NTEzNTk5Mn0.wfHlzl-msNvfWrcr3BaQYV4YVnoRXK7dq6MPV5VsKrM";


const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --------------------
// DOM ELEMENTS
// --------------------

const signinBtn = document.getElementById("signin-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout-btn");

const userStatus = document.getElementById("user-status");

const registrationContainer = document.getElementById("registration-form-container");
const loginMessage = document.getElementById("login-message");

const authModal = document.getElementById("auth-modal");
const authTitle = document.getElementById("auth-title");

const authUsername = document.getElementById("auth-username");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authPhone = document.getElementById("auth-phone");
const authGender = document.getElementById("auth-gender");
const authUsta = document.getElementById("auth-usta");

const authSubmitBtn = document.getElementById("auth-submit-btn");
const authMessage = document.getElementById("auth-message");
const closeModal = document.getElementById("close-modal");

const regUsernameField = document.getElementById("reg-username");

// --------------------
// AUTH MODE
// --------------------

let authMode = "signin";

// --------------------
// PHONE FORMAT
// --------------------

if (authPhone) {
    authPhone.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "").substring(0, 10);

        if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1-$2-$3");
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d{0,3})/, "$1-$2");
        }

        e.target.value = value;
    });
}

// --------------------
// MODAL
// --------------------

function openModal(mode) {
    authMode = mode;

    authModal.style.display = "block";
    authMessage.innerText = "";

    if (authEmail) authEmail.value = "";
    if (authPassword) authPassword.value = "";
    if (authUsername) authUsername.value = "";
    if (authPhone) authPhone.value = "";
if (authGender) authGender.value = "";
if (authUsta) authUsta.value = "";

    
    if (mode === "signup") {
        authTitle.innerText = "Create Account";

        authUsername.style.display = "block";
        authPhone.style.display = "block";
        authEmail.style.display = "block";

    } else {
        authTitle.innerText = "Sign In";

        authUsername.style.display = "block";
        authPhone.style.display = "none";
        authEmail.style.display = "none";
    }
}

function closeAuthModal() {
    authModal.style.display = "none";
}

// --------------------
// BUTTON EVENTS
// --------------------

signupBtn.addEventListener("click", () => openModal("signup"));
signinBtn.addEventListener("click", () => openModal("signin"));
closeModal.addEventListener("click", closeAuthModal);

window.addEventListener("click", (e) => {
    if (e.target === authModal) closeAuthModal();
});

// --------------------
// AUTH SUBMIT
// --------------------

authSubmitBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const username = authUsername.value.trim();
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();
    const phone = authPhone.value.trim();
const gender = authGender?.value || null;
const usta = authUsta?.value || null;

    
    authMessage.style.color = "red";

    // --------------------
    // SIGN UP
    // --------------------

   // --------------------
// SIGN UP
// --------------------

if (authMode === "signup") {

    if (!username || !email || !password || !phone) {

        authMessage.innerText =
            "Please fill all fields.";

        return;
    }

    // SIGN UP AUTH
    const { data, error } =
        await client.auth.signUp({

            email,
            password,

            options: {
                data: {
                    username: username
                }
            }
        });

    // AUTH ERROR
    if (error) {

        authMessage.style.color = "red";
        authMessage.innerText = error.message;

        return;
    }

    // USER
    const user = data?.user;

    // INSERT INTO REGISTRATION TABLE
    const {
        data: insertData,
        error: insertError

    } = await client
        .from("Registration")
        .insert([
            {
                username,
                email: user?.email || email,
                phone,
                gender,
                usta,
                created_at:
                    new Date().toISOString()
            }
        ]);

    console.log(
        "INSERT RESULT:",
        insertData,
        insertError
    );

    // INSERT ERROR
    if (insertError) {

        authMessage.style.color = "red";
        authMessage.innerText =
            insertError.message;

        return;
    }
// SEND WELCOME EMAIL
try {

// Ensure SUPABASE_KEY is your public 'anon' key
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcHpxeWd4dHBvaWZrYWRkb3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTk5OTIsImV4cCI6MjA5NTEzNTk5Mn0.wfHlzl-msNvfWrcr3BaQYV4YVnoRXK7dq6MPV5VsKrM"; 

// --------------------
// SEND WELCOME EMAIL
// --------------------
try {
    // 'response' is created here, inside the try block
    const response = await fetch(
      "https://uppzqygxtpoifkaddoyi.supabase.co/functions/v1/send-welcome-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({
          email,
          username
        })
      }
    );

    // This is the ONLY place you should read or log the response
    if (response.ok) {
        const result = await response.json();
        console.log("EMAIL RESULT SUCCESS:", result);
    } else {
        // If the server returns an error code (like 400 or 500)
        console.log("SERVER ERROR STATUS:", response.status);
    }

} catch (err) {
    // CRITICAL: Do NOT reference 'response' here! 
    // It doesn't exist out here. Only log 'err'.
    console.log("NETWORK OR FETCH ERROR:", err);
}

    // Read the stream EXACTLY ONCE here
    const result = await response.json();

    // Use the variable to log, do not call response.json() again
    console.log("EMAIL RESULT:", result);

} catch (err) {
    console.log("EMAIL ERROR:", err);
}

const data = await response.json();
console.log(data);

    const result = await response.json();

    console.log("EMAIL RESULT:", result);

} catch (err) {

    console.log("EMAIL ERROR:", err);

}

    // SUCCESS
    authMessage.style.color = "green";

    authMessage.innerText =
        "Account created successfully! 🎾";

    setTimeout(() => {

        closeAuthModal();

        updateUI();

    }, 800);
}

    // --------------------
    // SIGN IN
    // --------------------

    else {

        if (!username || !password) {
            authMessage.innerText = "Enter username and password.";
            return;
        }

        const { data, error } = await client
            .from("Registration")
            .select("email")
            .eq("username", username)
            .single();

        if (error || !data) {
            authMessage.innerText = "Username not found.";
            return;
        }

        const { error: loginError } =
            await client.auth.signInWithPassword({
                email: data.email,
                password
            });

        if (loginError) {
            authMessage.innerText = loginError.message;
            return;
        }

        authMessage.style.color = "green";
        authMessage.innerText = "Signed in!";

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
// UI UPDATE (FIXED AUTO-FILL)
// --------------------

async function updateUI() {

    const { data: { session } } =
        await client.auth.getSession();

    const regUsernameField = document.getElementById("reg-username");

    if (session) {

        const username =
            session.user.user_metadata?.username ||
            session.user.email;

        // HEADER
        userStatus.textContent = username;

        // AUTO FILL FORM (FIXED)
        if (regUsernameField) {
            regUsernameField.value = username;
        }

        signinBtn.style.display = "none";
        signupBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";

        registrationContainer.style.display = "block";
        loginMessage.style.display = "none";

    } else {

        userStatus.textContent = "";

        if (regUsernameField) {
            regUsernameField.value = "";
        }

        signinBtn.style.display = "inline-block";
        signupBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";

        registrationContainer.style.display = "none";
        loginMessage.style.display = "block";
    }
}

// --------------------
// SAFE INIT (IMPORTANT FIX)
// --------------------

document.addEventListener("DOMContentLoaded", () => {
    updateUI();
});

// --------------------
// SESSION LISTENER
// --------------------

client.auth.onAuthStateChange(() => {
    updateUI();
});


// --------------------
// TOURNAMENT FORM SUBMIT
// --------------------

const tournamentForm = document.getElementById("tournament-form");
const formMessage = document.getElementById("form-message");

if (tournamentForm) {
    tournamentForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("reg-username").value;
        const tournament = document.getElementById("tournament").value;
        const division = document.getElementById("division").value;
 const compete_level = document.getElementById("level").value;
        

        if (!username || !tournament || !division) {
            formMessage.style.color = "red";
            formMessage.innerText = "Please complete all fields.";
            return;
        }

        const { data: sessionData } = await client.auth.getSession();

        if (!sessionData.session) {
            formMessage.style.color = "red";
            formMessage.innerText = "You must be signed in.";
            return;
        }

        const { error } = await client
            .from("tournament_regi")
            .insert([
                {
                    username: username,
                    tournament_code: tournament,
                    division: division,
                      compete_level: compete_level,
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) {
            console.log(error);
            formMessage.style.color = "red";
            formMessage.innerText = error.message;
            return;
        }

        formMessage.style.color = "green";
        formMessage.innerText = "Registration successful! 🎾";

        tournamentForm.reset();

        // keep username auto-filled again
        const session = sessionData.session;
        const name =
            session.user.user_metadata?.username ||
            session.user.email;

        document.getElementById("reg-username").value = name;
    });
}
