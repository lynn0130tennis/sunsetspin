console.log("SCRIPT LOADED");

// --------------------
// SUPABASE INITIALIZATION
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
const profileLink = document.getElementById("profile-link");
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
const authWechat = document.getElementById("auth-wechat"); // WeChat Selector Added

const authSubmitBtn = document.getElementById("auth-submit-btn");
const authMessage = document.getElementById("auth-message");
const closeModal = document.getElementById("close-modal");

const regUsernameField = document.getElementById("reg-username");

let authMode = "signin";

// --------------------
// INPUT FORMATTING: US TELEPHONE MATRIX
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
// MODAL CONTROLLER INTERACTION ENGINE
// --------------------
function openModal(mode) {
    authMode = mode;
    if (!authModal) return;

    authModal.style.display = "block";
    authMessage.innerText = "";

    // Safely reset stale user entry buffers
    if (authEmail) authEmail.value = "";
    if (authPassword) authPassword.value = "";
    if (authUsername) authUsername.value = "";
    if (authPhone) authPhone.value = "";
    if (authGender) authGender.value = "";
    if (authUsta) authUsta.value = "";
    if (authWechat) authWechat.value = ""; // Clears WeChat buffer on open

    if (mode === "signup") {
        authTitle.innerText = "Create Account";
        toggleAuthFields("block");
    } else {
        authTitle.innerText = "Sign In";
        toggleAuthFields("none"); 
    }
}

function toggleAuthFields(displayStyle) {
    if (authEmail) authEmail.style.display = displayStyle;
    if (authPhone) authPhone.style.display = displayStyle;
    if (authGender) authGender.style.display = displayStyle;
    if (authUsta) authUsta.style.display = displayStyle;
    if (authWechat) authWechat.style.display = displayStyle; // Toggles WeChat Visibility
}

function closeAuthModal() {
    if (authModal) authModal.style.display = "none";
}

// --------------------
// CORE EVENT ATTACHMENTS
// --------------------
if (signupBtn) signupBtn.addEventListener("click", () => openModal("signup"));
if (signinBtn) signinBtn.addEventListener("click", () => openModal("signin"));
if (closeModal) closeModal.addEventListener("click", closeAuthModal);

window.addEventListener("click", (e) => {
    if (e.target === authModal) closeAuthModal();
});

// --------------------
// SUBMISSION LOGIC DISPATCHER
// --------------------
if (authSubmitBtn) {
    authSubmitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        authMessage.innerText = "";
        authMessage.style.color = "red";

        const username = authUsername.value.trim();
        const password = authPassword.value.trim();

        if (!username || !password) {
            authMessage.innerText = "Required login credentials missing.";
            return;
        }

        // --- SIGN UP PROCESSING LAYER ---
        if (authMode === "signup") {
            const email = authEmail.value.trim();
            const phone = authPhone.value.trim();
            const gender = authGender?.value || null;
            const usta = authUsta?.value || null;
            const wechat = authWechat?.value.trim() || null; // Capturing WeChat String Data

            if (!email || !phone) {
                authMessage.innerText = "Please complete all account fields.";
                return;
            }

            const { data, error } = await client.auth.signUp({
                email,
                password,
                options: { data: { username } }
            });

            if (error) {
                authMessage.innerText = error.message;
                return;
            }

            // Sync registration parameters to the central master registration table
            const { error: insertError } = await client
                .from("Registration")
                .insert([{
                    username,
                    email: data?.user?.email || email,
                    phone,
                    gender,
                    usta,
                    wechat, // Saving WeChat directly to your verified column 
                    created_at: new Date().toISOString()
                }]);

            if (insertError) {
                authMessage.innerText = `Auth complete, but DB save failed: ${insertError.message}`;
                return;
            }

            // Fire off Resend Edge Function
            try {
                await fetch(`${SUPABASE_URL}/functions/v1/send-welcome-email`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`
                    },
                    body: JSON.stringify({ email, username })
                });
            } catch (err) {
                console.warn("Background email execution failed:", err);
            }

            authMessage.style.color = "green";
            authMessage.innerText = "Account created successfully! 🎾";
            setTimeout(closeAuthModal, 1000);

        // --- SIGN IN PROCESSING LAYER ---
        } else {
            // Check username map to locate standard auth email row target
            const { data: profileRow, error: profileErr } = await client
                .from("Registration")
                .select("email")
                .eq("username", username)
                .maybeSingle();

            if (profileErr || !profileRow) {
                authMessage.innerText = "Username entry not verified.";
                return;
            }

            const { error: loginError } = await client.auth.signInWithPassword({
                email: profileRow.email,
                password
            });

            if (loginError) {
                authMessage.innerText = loginError.message;
                return;
            }

            authMessage.style.color = "green";
            authMessage.innerText = "Welcome back!";
            setTimeout(closeAuthModal, 600);
        }
    });
}

// --------------------
// UI LIFECYCLE RENDER SYNC
// --------------------
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await client.auth.signOut();
    });
}

async function updateUI() {
    const { data: { session } } = await client.auth.getSession();

    if (!userStatus) return;

    if (session) {
        const username = session.user.user_metadata?.username || session.user.email;
        userStatus.textContent = username; 

        if (regUsernameField) regUsernameField.value = username;

        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (signinBtn) signinBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";
        if (registrationContainer) registrationContainer.style.display = "block";
        if (loginMessage) loginMessage.style.display = "none";
    } else {
        userStatus.textContent = "";
        if (regUsernameField) regUsernameField.value = "";

        if (logoutBtn) logoutBtn.style.display = "none";
        if (signinBtn) signinBtn.style.display = "inline-block";
        if (signupBtn) signupBtn.style.display = "inline-block";
        if (registrationContainer) registrationContainer.style.display = "none";
        if (loginMessage) loginMessage.style.display = "block";
    }
}

// Initialize Application Lifecycles listeners
document.addEventListener("DOMContentLoaded", updateUI);
client.auth.onAuthStateChange(() => { updateUI(); });

// --------------------
// TOURNAMENT FORM DISPATCH LOGIC
// --------------------
const tournamentForm = document.getElementById("tournament-form");
const formMessage = document.getElementById("form-message");

if (tournamentForm) {
    tournamentForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("reg-username")?.value;
        const tournament = document.getElementById("tournament")?.value;
        const division = document.getElementById("division")?.value;
        const compete_level = document.getElementById("level")?.value;

        if (!username || !tournament || !division) {
            formMessage.style.color = "red";
            formMessage.innerText = "Please complete all registration selections.";
            return;
        }

        const { data: sessionData } = await client.auth.getSession();
        if (!sessionData?.session) {
            formMessage.style.color = "red";
            formMessage.innerText = "Active login session expired.";
            return;
        }

        const { error } = await client
            .from("tournament_regi") 
            .insert([{
                username: username,
                email: sessionData.session.user.email,
                tournament: tournament, 
                division: division,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            formMessage.style.color = "red";
            formMessage.innerText = error.message;
            return;
        }

        formMessage.style.color = "green";
        formMessage.innerText = "Registration tracking posted successfully! 🎾";
        tournamentForm.reset();
        
        if (regUsernameField) regUsernameField.value = username;
    });
}
