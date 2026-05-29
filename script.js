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
const authWechat = document.getElementById("auth-wechat"); 

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
    if (authWechat) authWechat.value = ""; 

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
    if (authWechat) authWechat.style.display = displayStyle; 
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
// SUBMISSION LOGIC DISPATCHER (SIGN UP / SIGN IN)
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

            // Creating the user master account record inside "Registration"
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
                authMessage.innerText = `Auth complete, but DB save failed: ${insertError.message}`;
                return;
            }

            // Welcome email dispatch trigger
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

    if (session) {
        // FAIL-SAFE USERNAME RESOLUTION SEQUENCE
        let displayUsername = session.user.user_metadata?.username;

        // Fallback Layer 1: Query database mapping if metadata context is blank
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

        // Fallback Layer 2: Default to cleanly splitting the login email address prefix
        if (!displayUsername) {
            displayUsername = session.user.email.split("@")[0];
        }

        // Apply string safely to text node anchors if they exist on current page
        if (userStatus) userStatus.textContent = displayUsername; 
        if (regUsernameField) regUsernameField.value = displayUsername;

        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (signinBtn) signinBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";
        if (registrationContainer) registrationContainer.style.display = "block";
        if (loginMessage) loginMessage.style.display = "none";

        // Safeguard: Wait completely for the DOM tree structure to compile before running the rendering block
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => loadRegisteredEvents(displayUsername));
        } else {
            loadRegisteredEvents(displayUsername);
        }

    } else {
        if (userStatus) userStatus.textContent = "";
        if (regUsernameField) regUsernameField.value = "";

        if (logoutBtn) logoutBtn.style.display = "none";
        if (signinBtn) signinBtn.style.display = "inline-block";
        if (signupBtn) signupBtn.style.display = "inline-block";
        if (registrationContainer) registrationContainer.style.display = "none";
        if (loginMessage) loginMessage.style.display = "block";
    }
}

// --------------------
// TOURNAMENT FORM DISPATCH LOGIC (WITH REINFORCED DUPLICATE INTERCEPTION)
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

        // LAYER 1: PROACTIVE DUPLICATE VERIFICATION QUERY
        const { data: existingReg, error: checkError } = await client
            .from("tournament_regi")
            .select("id")
            .eq("username", username)
            .eq("tournament_code", tournament)
            .maybeSingle();

        if (existingReg) {
            formMessage.style.color = "orange";
            formMessage.innerText = "You've already registered for this event!";
            return;
        }

        // LAYER 2: INSERTION WITH EXPLICIT DATABASE CONSTRAINT CATCHING
        const { error } = await client
            .from("tournament_regi") 
            .insert([{
                username: username,
                tournament_code: tournament, 
                division: division,
                compete_level: compete_level,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            if (error.message.includes("unique constraint") || error.code === "23505") {
                formMessage.style.color = "orange";
                formMessage.innerText = "You've already registered for this event!";
            } else {
                console.error("Database Write Error:", error);
                formMessage.style.color = "red";
                formMessage.innerText = error.message;
            }
            return;
        }

        formMessage.style.color = "green";
        formMessage.innerText = "Registration tracking posted successfully! 🎾";
        tournamentForm.reset();
        
        if (regUsernameField) regUsernameField.value = username;
        
        loadRegisteredEvents(username);
    });
}

// --------------------
// PROFILE DASHBOARD DATA RENDERER (ALIGNED TO LAYOUT SCHEMAS)
// --------------------
async function loadRegisteredEvents(username) {
    // If the element ID is container-upcoming-events on profile.html, pull it accurately
    const container = document.getElementById("container-upcoming-events") || document.getElementById("Your Registered Upcoming Events");
    const dynamicWrapper = document.getElementById("dynamic-events-wrapper");
    const noEventsRow = document.getElementById("no-events-row");

    // Exit cleanly if we are on an index/home layout page without a dashboard block
    if (!dynamicWrapper) return;

    // Set initial loading structural state
    dynamicWrapper.innerHTML = `
        <div class="tournament-status-row" id="loading-events-row">
            <div class="t-info-meta">
                <h4>Loading Registered Rosters...</h4>
                <p>Querying verified scheduled court allocations.</p>
            </div>
            <span class="status-pill pill-registered" style="background: #3b82f6; color: #fff;">Processing</span>
        </div>
    `;
    if (noEventsRow) noEventsRow.style.display = "none";

    // Clean up username string to ensure query safety
    const cleanUsername = username.trim();

    // Query database table records
    const { data: registrations, error } = await client
        .from("tournament_regi")
        .select("tournament_code, division, compete_level")
        .eq("username", cleanUsername);

    // Clear loading row placeholder
    dynamicWrapper.innerHTML = "";

    if (error) {
        console.error("Error retrieving tournament data:", error);
        dynamicWrapper.innerHTML = `
            <div class="tournament-status-row">
                <div class="t-info-meta">
                    <h4 style="color: red;">Failed to Load Rosters</h4>
                    <p>${error.message}</p>
                </div>
            </div>
        `;
        return;
    }

    // Fallback if records are completely clean
    if (!registrations || registrations.length === 0) {
        if (noEventsRow) noEventsRow.style.display = "flex";
        return;
    }

    // Append table items to wrapper area
    registrations.forEach(event => {
        const row = document.createElement("div");
        row.className = "tournament-status-row";

        row.innerHTML = `
            <div class="t-info-meta">
                <h4>${escapeHTML(event.tournament_code)}</h4>
                <p>Division: <strong>${escapeHTML(event.division)}</strong> | Level: <strong>${escapeHTML(event.compete_level || 'N/A')}</strong></p>
            </div>
            <span class="status-pill pill-registered">Registered</span>
        `;
        
        dynamicWrapper.appendChild(row);
    });
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// --------------------
// APPLICATION LIFE CYCLE LISTENERS
// --------------------
// Run baseline checks on execution entry
updateUI();

// Subscribe to real-time session modifications
client.auth.onAuthStateChange(() => { updateUI(); });
