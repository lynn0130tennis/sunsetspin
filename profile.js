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
