console.log("SCRIPT LOADED");
const SUPABASE_URL = "https://uppzqygxtpoifkaddoyi.supabase.co";
const SUPABASE_KEY = "sb_publishable_RXBO8ICJ7jGQFKYh2wDaig_7CqDU9fe";

const client = supabase.createClient(
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
    document.getElementById(
        "registration-form-container"
    );

const loginMessage =
    document.getElementById(
        "login-message"
    );

const authModal =
    document.getElementById("auth-modal");

const authTitle =
    document.getElementById("auth-title");

const authEmail =
    document.getElementById("auth-email");

const authPassword =
    document.getElementById("auth-password");

const authSubmitBtn =
    document.getElementById(
        "auth-submit-btn"
    );

const authMessage =
    document.getElementById("auth-message");

const closeModal =
    document.getElementById("close-modal");

let authMode = "signin";

// --------------------
// MODAL FUNCTIONS
// --------------------

function openModal(mode) {

    authMode = mode;

    authModal.style.display = "flex";

    authMessage.innerText = "";

    authEmail.value = "";
    authPassword.value = "";

    authTitle.innerText =
        mode === "signup"
            ? "Create Account"
            : "Sign In";
}

function closeAuthModal() {

    authModal.style.display = "none";
}

// --------------------
// BUTTON EVENTS
// --------------------

signupBtn.addEventListener(
    "click",
    () => openModal("signup")
);

signinBtn.addEventListener(
    "click",
    () => openModal("signin")
);

closeModal.addEventListener(
    "click",
    closeAuthModal
);

window.addEventListener(
    "click",
    (e) => {

        if (e.target === authModal) {

            closeAuthModal();
        }
    }
);

// --------------------
// AUTH SUBMIT
// --------------------

authSubmitBtn.addEventListener(
    "click",
    async () => {

        const email =
            authEmail.value.trim();

        const password =
            authPassword.value.trim();

        if (!email || !password) {

            authMessage.style.color =
                "red";

            authMessage.innerText =
                "Please enter email and password.";

            return;
        }

        let result;

        // --------------------
        // SIGN UP
        // --------------------

        if (authMode === "signup") {

            result =
                await client.auth.signUp({
                    email,
                    password
                });

            if (result.error) {

                authMessage.style.color =
                    "red";

                authMessage.innerText =
                    result.error.message;

                return;
            }

            // Save user to Registration table

            const user =
                result.data.user;

            if (user) {

                const insertResult =
                    await client
                        .from("Registration")
                        .insert([
                            {
                                User_id: user.id,
                                Email: user.email
                            }
                        ]);

                console.log(
                    "Insert Result:",
                    insertResult
                );

onsole.log(insertResult);

if (insertResult.error) {

    console.error(
        "Insert Error:",
        insertResult.error
    );

} else {

    console.log(
        "Insert Success"
    );
}
                
            }

            authMessage.style.color =
                "green";

            authMessage.innerText =
                "Account created successfully!";

        }

        // --------------------
        // SIGN IN
        // --------------------

        else {

            result =
                await client.auth
                    .signInWithPassword({
                        email,
                        password
                    });

            if (result.error) {

                authMessage.style.color =
                    "red";

                authMessage.innerText =
                    result.error.message;

                return;
            }

            closeAuthModal();

            updateUI();
        }
    }
);

// --------------------
// LOGOUT
// --------------------

logoutBtn.addEventListener(
    "click",
    async () => {

        await client.auth.signOut();

        updateUI();
    }
);

// --------------------
// UPDATE UI
// --------------------

async function updateUI() {

    const {
        data: { session }
    } =
        await client.auth.getSession();

    if (session) {

        userStatus.innerText =
            `Signed in as ${session.user.email}`;

        signinBtn.style.display =
            "none";

        signupBtn.style.display =
            "none";

        logoutBtn.style.display =
            "inline-block";

        registrationContainer.style.display =
            "block";

        loginMessage.style.display =
            "none";

    } else {

        userStatus.innerText =
            "Not signed in";

        signinBtn.style.display =
            "inline-block";

        signupBtn.style.display =
            "inline-block";

        logoutBtn.style.display =
            "none";

        registrationContainer.style.display =
            "none";

        loginMessage.style.display =
            "block";
    }
}

// --------------------
// AUTO SESSION CHECK
// --------------------

client.auth.onAuthStateChange(
    () => {

        updateUI();
    }
);

// Initial load

updateUI();
