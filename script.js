console.log("SCRIPT LOADED");

// --------------------
// SUPABASE INITIALIZATION
// --------------------
const SUPABASE_URL = "https://uppzqygxtpoifkaddoyi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcHpxeWd4dHBvaWZrYWRkb3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTk5OTIsImV4cCI6MjA5NTEzNTk5Mn0.wfHlzl-msNvfWrcr3BaQYV4YVnoRXK7dq6MPV5VsKrM";

if (!window.supabaseClient) {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
const client = window.supabaseClient;

// Wrap EVERYTHING inside a listener that waits until HTML tags are fully built
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM FULLY PARSED - BINDING BUTTONS");

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
    const authWechat = document.getElementById("auth-wechat"); 

    const authSubmitBtn = document.getElementById("auth-submit-btn");
    const authMessage = document.getElementById("auth-message");
    const closeModal = document.getElementById("close-modal");

    const regUsernameField = document.getElementById("reg-username");
    const tournamentForm = document.getElementById("tournament-form");
    const formMessage = document.getElementById("form-message");

    let authMode = "signin";

    // US Telephone Formatting Matrix
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

    // Modal Toggle Engine
    function openModal(mode) {
        authMode = mode;
        if (!authModal) {
            console.error("Modal element (#auth-modal) not found in HTML!");
            return;
        }

        // Force visibility override to bypass strict CSS classes
        authModal.setProperty ? authModal.setProperty("display", "flex", "important") : authModal.style.setProperty("display", "flex", "important");
        
        if (authMessage) authMessage.innerText = "";

        // Reset fields safely
        if (authEmail) authEmail.value = "";
        if (authPassword) authPassword.value = "";
        if (authUsername) authUsername.value = "";
        if (authPhone) authPhone.value = "";
        if (authGender) authGender.value = "";
        if (authUsta) authUsta.value = "";
        if (authWechat) authWechat.value = ""; 

        if (mode === "signup") {
            if (authTitle) authTitle.innerText = "Create Account";
            if (authUsername) authUsername.style.setProperty("display", "block", "important");
            toggleAuthFields("block");
        } else {
            if (authTitle) authTitle.innerText = "Sign In";
            if (authUsername) authUsername.style.setProperty("display", "block", "important"); 
            toggleAuthFields("none"); 
        }
    }

    function toggleAuthFields(displayStyle) {
        const fields = [authEmail, authPhone, authGender, authUsta, authWechat];
        fields.forEach(field => {
            if (field) field.style.setProperty("display", displayStyle, "important");
        });
    }

    function closeAuthModal() {
        if (authModal) authModal.style.setProperty("display", "none", "important");
    }

    // Event Attachments with strict preventative click tracking
    if (signupBtn) {
        signupBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openModal("signup");
        });
    }
    if (signinBtn) {
        signinBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openModal("signin");
        });
    }
    if (closeModal) closeModal.addEventListener("click", closeAuthModal);

    window.addEventListener("click", (e) => {
        if (e.target === authModal) closeAuthModal();
    });

    // Authentication Submissions
    if (authSubmitBtn) {
        authSubmitBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if (!authMessage) return;
            authMessage.innerText = "";
            authMessage.style.color = "red";

            const username = authUsername ? authUsername.value.trim() : "";
            const password = authPassword ? authPassword.value.trim() : "";

            if (!username || !password) {
                authMessage.innerText = "Please fill in your username and password.";
                return;
            }

            if (authMode === "signup") {
                const email = authEmail ? authEmail.value.trim() : "";
                const phone = authPhone ? authPhone.value.trim() : "";
                const gender = authGender?.value || null;
                const usta = authUsta?.value || null;
                const wechat = authWechat?.value.trim() || null; 

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
                    authMessage.innerText = `Auth complete, profile save failed: ${insertError.message}`;
                    return;
                }

                authMessage.style.color = "green";
                authMessage.innerText = "Account created successfully! 🎾";
                setTimeout(closeAuthModal, 1000);

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
                setTimeout(closeAuthModal, 600);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            await client.auth.signOut();
        });
    }

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

    // Tournament Form Processing
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

            const selectedTournament = document.getElementById("tournament")?.value;
            const selectedDivision = document.getElementById("division")?.value;
            const selectedLevel = document.getElementById("level")?.value;
            const currentUsername = regUsernameField ? regUsernameField.value : "";

            if (!selectedTournament || !selectedDivision || !selectedLevel) {
                if (formMessage) formMessage.innerText = "Please completely fill out all options.";
                return;
            }

            const { error: registrationError } = await client
                .from("TournamentSignups")
                .insert([{
                    user_id: session.user.id,
                    username: currentUsername,
                    tournament_id: selectedTournament,
                    division: selectedDivision,
                    playing_level: selectedLevel,
                    created_at: new Date().toISOString()
                }]);

            if (registrationError) {
                if (formMessage) formMessage.innerText = `Registration failed: ${registrationError.message}`;
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

    // Initial load configurations
    updateUI();
    client.auth.onAuthStateChange(() => { updateUI(); });
});
