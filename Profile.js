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
    const { data: { session }, error: sessionErr } = await client.auth.getSession();
    
    // SECURITY AUTO-REDIRECT: If no session exists, kick them back to the main courts page
    if (sessionErr || !session) {
        window.location.href = "index.html";
        return;
    }
    
    currentUserSession = session.user;
    
    // Fill basic details into sidebar
    const metadataUsername = currentUserSession.user_metadata?.username || "Tennis Player";
    document.getElementById("sidebar-username").innerText = metadataUsername;
    document.getElementById("sidebar-email").innerText = currentUserSession.email;

    // Fetch existing metrics from custom 'Registration' table
    const { data: profileRow, error: dbErr } = await client
        .from("Registration")
        .select("phone, gender, usta")
        .eq("email", currentUserSession.email)
        .maybeSingle();

    if (profileRow) {
        if (profileRow.phone) document.getElementById("profile-phone").value = profileRow.phone;
        if (profileRow.gender) document.getElementById("profile-gender").value = profileRow.gender;
        if (profileRow.usta) {
            document.getElementById("profile-usta-select").value = profileRow.usta;
            document.getElementById("sidebar-usta").innerText = `USTA ${profileRow.usta}`;
        }
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
