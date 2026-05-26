// Ensure these variables use your verified Supabase context settings
const SUPABASE_URL = "https://uppzqygxtpoifkaddoyi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcHpxeWd4dHBvaWZrYWRkb3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTk5OTIsImV4cCI6MjA5NTEzNTk5Mn0.wfHlzl-msNvfWrcr3BaQYV4YVnoRXK7dq6MPV5VsKrM";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Selection Parameters
const personalForm = document.getElementById("personal-info-form");
const passwordForm = document.getElementById("password-change-form");
const messageBanner = document.getElementById("profile-msg");

let currentUserSession = null;

// Display Banner Messages helper
function showBanner(text, isSuccess = true) {
    messageBanner.innerText = text;
    messageBanner.style.display = "block";
    messageBanner.style.backgroundColor = isSuccess ? "#f0fdf4" : "#fef2f2";
    messageBanner.style.color = isSuccess ? "#166534" : "#991b1b";
    messageBanner.style.border = isSuccess ? "1px solid #bbf7d0" : "1px solid #fca5a5";
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 1. Initial Load: Fetch User Metadata & Profile Values
async function loadUserProfile() {
    console.log("Profile page loading, checking session...");
    
    const { data: { session }, error: sessionErr } = await client.auth.getSession();
    
    // Security check: If no session exists, send them back to the home page
    if (sessionErr || !session) {
        console.error("No active session found:", sessionErr);
        window.location.href = "index.html";
        return;
    }
    
    currentUserSession = session.user;
    console.log("Logged in user:", currentUserSession.email);
    
    // Populate the sidebar panel immediately using auth data
    const metadataUsername = currentUserSession.user_metadata?.username || "Tennis Player";
    document.getElementById("sidebar-username").innerText = metadataUsername;
    document.getElementById("sidebar-email").innerText = currentUserSession.email;

    // FETCH REGISTERED INFO: Query the 'Registration' table matching the user's email
    const { data: profileRow, error: dbErr } = await client
        .from("Registration")
        .select("*") // Pull all rows to guarantee we hit the correct column names
        .eq("email", currentUserSession.email)
        .maybeSingle();

    if (dbErr) {
        console.error("Error fetching data from Registration table:", dbErr);
        showBanner(`Could not load profile data: ${dbErr.message}`, false);
        return;
    }

    if (profileRow) {
        console.log("Successfully retrieved registration record:", profileRow);
        
        // Populate Phone (handles standard field or custom 'phone_number' variations)
        const userPhone = profileRow.phone || profileRow.phone_number || "";
        document.getElementById("profile-phone").value = userPhone;
        
        // Populate Gender (capitalizes the check to match database inputs)
        const userGender = profileRow.gender || "";
        document.getElementById("profile-gender").value = userGender;
        
        // Populate USTA Rating dropdown & update the decorative sidebar badge
        // (Supports lowercase 'usta' or uppercase 'USTA' database keys)
        const userUsta = profileRow.usta || profileRow.USTA || "";
        if (userUsta) {
            document.getElementById("profile-usta-select").value = userUsta;
            document.getElementById("sidebar-usta").innerText = `USTA ${userUsta}`;
            document.getElementById("sidebar-usta").style.display = "inline-block";
        } else {
            document.getElementById("sidebar-usta").innerText = "USTA --";
        }
    } else {
        console.warn("No matching row found in Registration table for this email.");
    }
}

// 2. Action: Handle Personal Profile Data Database Updates
personalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const updatedPhone = document.getElementById("profile-phone").value.trim();
    const updatedGender = document.getElementById("profile-gender").value;
    const updatedUsta = document.getElementById("profile-usta-select").value;

    const { error: updateErr } = await client
        .from("Registration")
        .update({
            phone: updatedPhone,
            gender: updatedGender,
            usta: updatedUsta
        })
        .eq("email", currentUserSession.email);

    if (updateErr) {
        showBanner(`Update failed: ${updateErr.message}`, false);
    } else {
        showBanner("Personal information updated successfully! 🎾");
        document.getElementById("sidebar-usta").innerText = updatedUsta ? `USTA ${updatedUsta}` : "USTA --";
    }
});

// 3. Action: Handle Security Password Changes
passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const newPass = document.getElementById("new-password").value;
    const confirmPass = document.getElementById("confirm-password").value;

    if (newPass.length < 6) {
        showBanner("Password must be at least 6 characters long.", false);
        return;
    }

    if (newPass !== confirmPass) {
        showBanner("Passwords do not match. Please re-enter.", false);
        return;
    }

    // Call Supabase core authentication update process
    const { error: passErr } = await client.auth.updateUser({
        password: newPass
    });

    if (passErr) {
        showBanner(`Password modification failed: ${passErr.message}`, false);
    } else {
        showBanner("Password updated successfully! Your account is secure.");
        passwordForm.reset();
    }
});

// Auto phone formatting tracking input rules
const phoneInput = document.getElementById("profile-phone");
if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "").substring(0, 10);
        if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1-$2-$3");
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d{0,3})/, "$1-$2");
        }
        e.target.value = value;
    });
}

// Trigger initial fetch when DOM compiles
document.addEventListener("DOMContentLoaded", loadUserProfile);
