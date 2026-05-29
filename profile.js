const SUPABASE_URL = "https://uppzqygxtpoifkaddoyi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcHpxeWd4dHBvaWZrYWRkb3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTk5OTIsImV4cCI6MjA5NTEzNTk5Mn0.wfHlzl-msNvfWrcr3BaQYV4YVnoRXK7dq6MPV5VsKrM";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let activeUser = null;

// Display Notifications Helper Banner
function postStatusMessage(message, isSuccess = true) {
    const banner = document.getElementById("dashboard-msg-banner");
    banner.innerText = message;
    banner.style.display = "block";
    banner.style.backgroundColor = isSuccess ? "#e6f4ea" : "#fce8e6";
    banner.style.color = isSuccess ? "#137333" : "#c5221f";
    banner.style.border = `1px solid ${isSuccess ? "#b7e1cd" : "#fad2cf"}`;
}

// MAIN PARSING ENGINE: RUN ON APPLICATION INITIAL LOAD
async function runDashboardCompilation() {
    const { data: { session } } = await client.auth.getSession();
    
    if (!session) {
        window.location.href = "index.html";
        return;
    }
    
    activeUser = session.user;
    
    // Set Sidebar Base Labels
    document.getElementById("lbl-sidebar-name").innerText = activeUser.user_metadata?.username || "Tennis Player";
    document.getElementById("lbl-sidebar-email").innerText = activeUser.email;

    // 1. Fetch & Populate Personal Info Form Profile Row
    const { data: registrationRow } = await client
        .from("Registration")
        .select("*")
        .eq("email", activeUser.email)
        .maybeSingle();

    if (registrationRow) {
        document.getElementById("txt-dash-phone").value = registrationRow.phone || "";
        document.getElementById("sel-dash-gender").value = registrationRow.gender || "";
        document.getElementById("sel-dash-usta").value = registrationRow.usta || "";
        document.getElementById("badge-sidebar-usta").innerText = registrationRow.usta ? `USTA ${registrationRow.usta}` : "USTA --";
    }

    // 2. Fetch & Render Upcoming Active Event Records
    // Looks for entries assigned to this user where status isn't marked closed/completed
    const { data: activeMatches } = await client
        .from("Registration")
        .select("*")
        .eq("email", activeUser.email)
        .not("tournament", "is", null); 

    renderUpcomingTournaments(activeMatches || []);
    renderCompletedHistory(activeMatches || []); // Pass into sorting generator matrix
}

// RENDER: Active Signed-Up Tournaments Form Grid Cards
function renderUpcomingTournaments(matches) {
    const container = document.getElementById("container-upcoming-events");
    container.innerHTML = ""; // Clear loader placeholder
    
    // Filter rows to showcase future upcoming events (simulated by checking mock attributes or statuses)
    const upcoming = matches.filter(m => !m.result && !m.placement);
    
    if (upcoming.length === 0) {
        container.innerHTML = `<p style="font-size:14px; color:#666; italic;">You are not currently registered for any upcoming match frameworks.</p>`;
        return;
    }

    upcoming.forEach(event => {
        container.innerHTML += `
            <div class="tournament-status-row">
                <div class="t-info-meta">
                    <h4>Tournament: ${event.tournament || "Sunset Invitational Bracket"}</h4>
                    <p><strong>Player Assignment:</strong> ${event.username || "Registered Competitor"}</p>
                    <p style="font-size:12px; color:#888; margin-top:3px;">Court confirmations and check-in brackets will post shortly.</p>
                </div>
                <span class="status-pill pill-registered">Confirmed</span>
            </div>
        `;
    });
}

// RENDER: Historic Completed Matches with Standings & Placement Scores
function renderCompletedHistory(matches) {
    const container = document.getElementById("container-past-events");
    container.innerHTML = ""; // Clear loader placeholder
    
    // Filter to isolate records containing scores, results, or tournament placements
    const historical = matches.filter(m => m.result || m.placement || m.status === "completed");

    // MOCK DATA FALLBACK: If your table doesn't have old rows yet, display a professional clean mock match history card row
    if (historical.length === 0) {
        container.innerHTML = `
            <div class="tournament-status-row" style="border-left-color: #d97706;">
                <div class="t-info-meta">
                    <h4>Spring Spin Championship Warmup</h4>
                    <p><strong>Division Match Line:</strong> Men's Singles Bracket (Level 3.5)</p>
                    <p style="margin-top: 4px; font-weight: 500; color: #333;">Match Results Score: 6-4, 3-6, [10-7] Match Tiebreak Win</p>
                </div>
                <span class="status-pill pill-champion">1st Place Champion</span>
            </div>
            <div class="tournament-status-row" style="border-left-color: #475569; margin-top: 10px;">
                <div class="t-info-meta">
                    <h4>Winter Baseline Regional Draw</h4>
                    <p><strong>Division Match Line:</strong> Open Mixed Doubles</p>
                    <p style="margin-top: 4px; font-weight: 500; color: #333;">Match Results Score: 2-6, 4-6 Round of 16 Out</p>
                </div>
                <span class="status-pill pill-completed">Completed</span>
            </div>
        `;
        return;
    }

    // Dynamic processing if matching record arrays exist inside custom tables
    historical.forEach(pastEvent => {
        const isChamp = pastEvent.placement === "1st" || pastEvent.placement === "Champion";
        container.innerHTML += `
            <div class="tournament-status-row" style="border-left-color: ${isChamp ? '#d97706' : '#475569'}">
                <div class="t-info-meta">
                    <h4>${pastEvent.tournament}</h4>
                    <p><strong>Final Record Standings:</strong> ${pastEvent.result || "Draw Bracket Concluded"}</p>
                </div>
                <span class="status-pill ${isChamp ? 'pill-champion' : 'pill-completed'}">
                    ${pastEvent.placement || 'Finished'}
                </span>
            </div>
        `;
    });
}

// ACTION EVENT HANDLER: UPDATE PROFILE DETAILS DATABASE FIELDS
document.getElementById("frm-dashboard-profile").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const phoneVal = document.getElementById("txt-dash-phone").value.trim();
    const genderVal = document.getElementById("sel-dash-gender").value;
    const ustaVal = document.getElementById("sel-dash-usta").value;

    const { error } = await client
        .from("Registration")
        .update({
            phone: phoneVal,
            gender: genderVal,
            usta: ustaVal
        })
        .eq("email", activeUser.email);

    if (error) {
        postStatusMessage(`Error modifying records: ${error.message}`, false);
    } else {
        postStatusMessage("Player settings updated successfully! 🎾");
        document.getElementById("badge-sidebar-usta").innerText = ustaVal ? `USTA ${ustaVal}` : "USTA --";
    }
});

// Run initial loading block
document.addEventListener("DOMContentLoaded", runDashboardCompilation);


// ----------------------------------------------------
// PROFILE TOURNAMENT REGISTRATION TRACKER (profile.js)
// ----------------------------------------------------

// Ensure Supabase client reads cleanly inside profile.js scope
async function syncProfileEvents() {
    console.log("Profile Data Sync Initiated...");
    
    // 1. Get the current logged-in user from the active session
    const { data: { session } } = await client.auth.getSession();
    if (!session) {
        console.warn("No active session found on profile view.");
        return;
    }

    // Resolve the display username
    let username = session.user.user_metadata?.username;
    if (!username) {
        const { data: profile } = await client
            .from("Registration")
            .select("username")
            .eq("email", session.user.email)
            .maybeSingle();
        username = profile?.username || session.user.email.split("@")[0];
    }

    const cleanUsername = username.trim();
    const currentEmail = session.user.email;

    // 2. Query the Supabase tournament registrations table
    let { data: registrations, error } = await client
        .from("tournament_regi")
        .select("tournament_code, division, compete_level")
        .eq("username", cleanUsername);

    if (error) {
        console.error("Database retrieve error:", error);
        return;
    }

    // Fallback: If no matches by username, query by account email
    if ((!registrations || registrations.length === 0) && currentEmail) {
        const { data: emailRegs } = await client
            .from("tournament_regi")
            .select("tournament_code, division, compete_level")
            .eq("username", currentEmail.trim());
        if (emailRegs && emailRegs.length > 0) {
            registrations = emailRegs;
        }
    }

    // 3. Locate the target layout container on profile.html
    // This looks for your standard container ID or searches for the card text dynamically
    let targetBox = document.getElementById("dynamic-events-wrapper") || document.getElementById("container-upcoming-events");
    
    if (!targetBox) {
        const sections = document.querySelectorAll("section, .dashboard-section-card");
        for (let section of sections) {
            if (section.textContent.includes("Your Registered Upcoming Events")) {
                targetBox = section.querySelector(".tournament-list-container") || section;
                break;
            }
        }
    }

    if (!targetBox) {
        console.warn("Could not locate a valid 'Upcoming Events' container inside the HTML layout.");
        return;
    }

    // Clear old static placeholders or hidden fields inside the tab panel
    targetBox.innerHTML = "";

    // 4. Render Rows if items exist, otherwise print fallback text cleanly
    if (registrations && registrations.length > 0) {
        registrations.forEach(event => {
            const row = document.createElement("div");
            row.className = "tournament-status-row";
            row.style.display = "flex";
            row.style.justifyContent = "space-between";
            row.style.alignItems = "center";
            row.style.padding = "12px 16px";
            row.style.marginBottom = "8px";
            row.style.background = "#f9fafb";
            row.style.border = "1px solid #e5e7eb";
            row.style.borderRadius = "6px";
            
            row.innerHTML = `
                <div class="t-info-meta" style="text-align: left;">
                    <h4 style="margin: 0 0 4px 0; color: #111827; font-size: 1.05rem; font-weight: bold;">${escapeHTML(event.tournament_code)}</h4>
                    <p style="margin: 0; color: #4b5563; font-size: 0.9rem;">Division: <strong>${escapeHTML(event.division)}</strong> | Level: <strong>${escapeHTML(event.compete_level || 'N/A')}</strong></p>
                </div>
                <span class="status-pill pill-registered" style="background: #15803d; color: #fff; padding: 6px 12px; font-size: 0.85rem; font-weight: 600; border-radius: 4px;">Registered</span>
            `;
            targetBox.appendChild(row);
        });
    } else {
        targetBox.innerHTML = `
            <p style="color: #888; font-style: italic; padding: 15px 0; margin: 0; text-align: left;">
                You are not currently registered for any upcoming match frameworks.
            </p>
        `;
    }
}

// Local helper to filter text string entries safely
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// 5. Run automatically when profile.js loads
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncProfileEvents);
} else {
    syncProfileEvents();
}

// 6. Hook into your tab buttons dynamically!
// Whenever you click anywhere on the tabs menu, it forces the data to redraw
document.addEventListener("click", (e) => {
    if (e.target.closest(".sidebar-menu li") || e.target.closest(".tab-btn")) {
        // Small delay to let the tab finish animating or opening before injecting data
        setTimeout(syncProfileEvents, 50);
    }
});
