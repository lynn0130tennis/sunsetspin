console.log("SCRIPT LOADED")
alert("script loaded");

const SUPABASE_URL = "https://wcaoltfalhstnvjhcxbi.supabase.co/rest/v1/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjYW9sdGZhbGhzdG52amhjeGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjQzNTcsImV4cCI6MjA5NTE0MDM1N30.qqoegdtiXp5Xnfoa-TASwJT2S_InYfkJyfaAO9hviys";



const client = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

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

function openModal(mode) {

    authMode = mode;

    authModal.style.display = "flex";

    authMessage.innerText = "";

    authEmail.value = "";
    authPassword.value = "";

    if (mode === "signup") {

        authTitle.innerText =
            "Create Account";

    } else {

        authTitle.innerText =
            "Sign In";
    }
}

function closeAuthModal() {

    authModal.style.display = "none";
}

signupBtn.addEventListener("click", () => {

    openModal("signup");
});

signinBtn.addEventListener("click", () => {

    openModal("signin");
});

closeModal.addEventListener("click", () => {

    closeAuthModal();
});

window.addEventListener("click", (e) => {

    if (e.target === authModal) {

        closeAuthModal();
    }
});

authSubmitBtn.addEventListener(
    "click",
    async () => {

        const email = authEmail.value;

        const password =
            authPassword.value;

        let result;

        if (authMode === "signup") {

            result =
                await client.auth.signUp({
                    email,
                    password
                });

        } else {

            result =
                await client.auth
                .signInWithPassword({
                    email,
                    password
                });
        }

        if (result.error) {

            authMessage.style.color =
                "red";

            authMessage.innerText =
                result.error.message;

        } else {

            if (authMode === "signup") {

                authMessage.style.color =
                    "green";

                authMessage.innerText =
                    "Account created! Check email.";

            } else {

                closeAuthModal();

                updateUI();
            }
        }
    }
);

logoutBtn.addEventListener(
    "click",
    async () => {

        await client.auth.signOut();

        updateUI();
    }
);

async function updateUI() {

    const {
        data: { session }
    } = await client.auth.getSession();

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

updateUI();
