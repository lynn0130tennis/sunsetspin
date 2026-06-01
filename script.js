console.log("SCRIPT LAUNCHED");

// --------------------
// SUPABASE INITIALIZATION
// --------------------
const SUPABASE_URL = "https://uppzqygxtpoifkaddoyi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcHpxeWd4dHBvaWZrYWRkb3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTk5OTIsImV4cCI6MjA5NTEzNTk5Mn0.wfHlzl-msNvfWrcr3BaQYV4YVnoRXK7dq6MPV5VsKrM";

let client = null;

try {
    if (typeof supabase !== 'undefined') {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        client = window.supabaseClient;
        console.log("Supabase connected successfully.");
    } else {
        console.error("Supabase script CDN tag is missing from your HTML file.");
    }
} catch (err) {
    console.error("Supabase initialization failed, running in offline mode:", err);
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM ready. Attaching button events...");

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
    const authSubmitBtn = document.getElementById("auth-submit-btn");
    const closeModal = document.getElementById("close-modal");
    const authMessage = document.getElementById("auth-message");

    const authUsername = document.getElementById("auth-username");
    const authEmail = document.getElementById("auth-email");
    const authPassword = document.getElementById("auth-password");
    const authPhone = document.getElementById("auth-phone");
    const authGender = document.getElementById("auth-gender");
    const authUsta = document.getElementById("auth-usta");
    const authWechat = document.getElementById("auth-wechat");

    const regUsernameField = document.getElementById("reg-username");
    const tournamentForm = document.getElementById("tournament-form");
    const formMessage = document.getElementById("form-message");

    let authMode = "signin";

    // --------------------
    // PHONE FORMATTING ENGINE
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
    // MODAL WINDOW TOGGLES
    // --------------------
    function openModal(mode) {
        authMode = mode;
        if (!authModal) return;

        authModal.style.setProperty("display", "flex", "important");
        if (authMessage) authMessage.innerText = "";

        if (authEmail) authEmail.value = "";
        if (authPassword) authPassword.value = "";
        if (authUsername) authUsername.value = "";
        if (authPhone) authPhone.value = "";
        if (authGender) authGender.value = "";
        if (authUsta) authUsta.value = "";
        if (authWechat) authWechat.value = ""; 

        if (mode === "signup") {
            if (authTitle) authTitle.innerText = "Create Account";
            if (authSubmitBtn) authSubmitBtn.innerText = "Sign Up";
            if (authUsername) authUsername.style.setProperty("display", "block", "important");
            toggleMetadataFields("block");
        } else {
            if (authTitle) authTitle.innerText = "Sign In";
            if (authSubmitBtn) authSubmitBtn.innerText = "Sign In";
            if (authUsername) authUsername.style.setProperty("display", "block", "important"); 
            toggleMetadataFields("none");
        }
    }

    function toggleMetadataFields(displayStyle) {
        const standardInputs = [authEmail, authPhone, authGender, authUsta, authWechat];
        standardInputs.forEach(element => {
            if (element) element.style.setProperty("display", displayStyle, "important");
        });
    }

    function closeModalWindow() {
        if (authModal) authModal.style.setProperty("display", "none", "important");
    }

    if (signinBtn) signinBtn.addEventListener("click", (e) => { e.preventDefault(); openModal("signin"); });
    if (signupBtn) signupBtn.addEventListener("click", (e) => { e.preventDefault(); openModal("signup"); });
    if (closeModal) closeModal.addEventListener("click", (e) => { e.preventDefault(); closeModalWindow(); });

    window.addEventListener("click", (e) => {
        if (e.target === authModal) closeModalWindow();
    });

    // --------------------
    // AUTHENTICATION OPERATIONS
    // --------------------
    if (authSubmitBtn) {
        authSubmitBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if (!client) return;
            
            if (!authMessage) return;
            authMessage.innerText = "";
            authMessage.style.color = "red";

            const username = authUsername ? authUsername.value.trim() : "";
            const password = authPassword ? authPassword.value.trim() : "";

            if (!username || !password) {
                authMessage.innerText = "Please fill out both username and password fields.";
                return;
            }

            if (authMode === "signup") {
                const email = authEmail ? authEmail.value.trim() : "";
                const phone = authPhone ? authPhone.value.trim() : "";
                const gender = authGender?.value || null;
                const usta = authUsta?.value || null;
                const wechat = authWechat?.value.trim() || null; 

                if (!email || !phone) {
                    authMessage.innerText = "Please complete all account signup options.";
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

                const { error: insertError } = await client
                    .from("Registration")
                    .insert([{
                        username,
                        email: data?.user?.email || email,
                        phone,
                        gender,
                        usta,
                        wechat, 
                        created_at: new Date().toISOString()
                    }]);

                if (insertError) {
                    authMessage.innerText = `Auth clear, profile save error: ${insertError.message}`;
                    return;
                }

                authMessage.style.color = "green";
                authMessage.innerText = "Account created successfully! 🎾";
                setTimeout(closeModalWindow, 1000);

            } else {
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
                setTimeout(closeModalWindow, 600);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            await client.auth.signOut();
        });
    }

    // --------------------
    // INTERFACE RENDER COUPLING
    // --------------------
    async function updateUI() {
        const { data: { session } } = await client.auth.getSession();

        if (session) {
            let displayUsername = session.user.user_metadata?.username;

            if (!displayUsername) {
                const { data: profile } = await client
                    .from("Registration")
                    .select("username")
                    .eq("email", session.user.email)
                    .maybeSingle();
                
                if (profile?.username) {
                    displayUsername = profile.username;
                }
            }

            if (!displayUsername) {
                displayUsername = session.user.email.split("@")[0];
            }

            if (userStatus) userStatus.textContent = displayUsername; 
            if (regUsernameField) regUsernameField.value = displayUsername;

            if (logoutBtn) logoutBtn.style.setProperty("display", "inline-block", "important");
            if (signinBtn) signinBtn.style.setProperty("display", "none", "important");
            if (signupBtn) signupBtn.style.setProperty("display", "none", "important");
            if (registrationContainer) registrationContainer.style.setProperty("display", "block", "important");
            if (loginMessage) loginMessage.style.setProperty("display", "none", "important");

        } else {
            if (userStatus) userStatus.textContent = "";
            if (regUsernameField) regUsernameField.value = "";

            if (logoutBtn) logoutBtn.style.setProperty("display", "none", "important");
            if (signinBtn) signinBtn.style.setProperty("display", "inline-block", "important");
            if (signupBtn) signupBtn.style.setProperty("display", "inline-block", "important");
            if (registrationContainer) registrationContainer.style.setProperty("display", "none", "important");
            if (loginMessage) loginMessage.style.setProperty("display", "block", "important");
        }
    }

    // --------------------
    // TOURNAMENT REGISTRATION PROCESSOR
    // --------------------
    if (tournamentForm) {
        tournamentForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (formMessage) {
                formMessage.innerText = "";
                formMessage.style.color = "red";
            }

            const { data: { session } } = await client.auth.getSession();
            if (!session) {
                if (formMessage) formMessage.innerText = "Error: You must be logged in.";
                return;
            }

            const selectedTournamentCode = document.getElementById("tournament")?.value;
            const selectedDivision = document.getElementById("division")?.value;
            const selectedLevel = document.getElementById("level")?.value;
            const currentUsername = regUsernameField ? regUsernameField.value : "";

            if (!selectedTournamentCode || !selectedDivision || !selectedLevel || !currentUsername) {
                if (formMessage) formMessage.innerText = "Please select options for all tournament setup fields.";
                return;
            }

            if (formMessage) {
                formMessage.style.color = "orange";
                formMessage.innerText = "Checking verification status...";
            }

            // 1. DUPLICATE CHECK ENGINE: Target 'username' field to avoid table.id missing error
            const { data: existingReg, error: checkError } = await client
                .from("tournament_regi")
                .select("username")
                .eq("username", currentUsername)
                .eq("tournament_code", selectedTournamentCode)
                .maybeSingle();

            if (checkError) {
                if (formMessage) {
                    formMessage.style.color = "red";
                    formMessage.innerText = `Verification failed: ${checkError.message}`;
                }
                return;
            }

            // 2. CLEAR DUPLICATE WARNING BLOCK
            if (existingReg) {
                if (formMessage) {
                    formMessage.style.color = "red";
                    formMessage.innerText = "⚠️ You have registered for this event.";
                }
                return;
            }

            // 3. TARGETED TABLE INSERT DATA RECORD
            const { error: registrationError } = await client
                .from("tournament_regi")
                .insert([{
                    username: currentUsername,
                    tournament_code: selectedTournamentCode,
                    division: selectedDivision,
                    playing_level: selectedLevel,
                    created_at: new Date().toISOString()
                }]);

            if (registrationError) {
                if (formMessage) {
                    formMessage.style.color = "red";
                    formMessage.innerText = `Registration failed: ${registrationError.message}`;
                }
                return;
            }

            if (formMessage) {
                formMessage.style.color = "green";
                formMessage.innerText = "🎉 Successfully registered for the tournament!";
            }
            
            document.getElementById("tournament").value = "";
            document.getElementById("division").value = "";
            document.getElementById("level").value = "";
        });
    }

    updateUI();
    if (client) {
        client.auth.onAuthStateChange(() => { updateUI(); });
    }
});
