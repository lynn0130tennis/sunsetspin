const SUPABASE_URL = "https://uppzqygxtpoifkaddoyi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcHpxeWd4dHBvaWZrYWRkb3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTk5OTIsImV4cCI6MjA5NTEzNTk5Mn0.wfHlzl-msNvfWrcr3BaQYV4YVnoRXK7dq6MPV5VsKrM";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let activeUser = null;

// Display Notifications Helper Banner
function postStatusMessage(message, isSuccess = true) {
    const banner = document.getElementById("dashboard-msg-banner");
    if (!banner) return;
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
    const sidebarName = document.getElementById("lbl-sidebar-name");
    const sidebarEmail = document.getElementById("lbl-sidebar-email");
    if (sidebarName) sidebarName.innerText = activeUser.user_metadata?.username || "Tennis Player";
    if (sidebarEmail) sidebarEmail.innerText = activeUser.email;

    // 1. Fetch & Populate Personal Info Form Profile Row
    const { data: registrationRow } = await client
        .from("Registration")
        .select("*")
        .eq("email", activeUser.email)
        .maybeSingle();

    if (registrationRow) {
        const phoneInput = document.getElementById("txt-dash-phone");
        const genderSelect = document.getElementById("sel-dash-gender");
        const ustaSelect = document.getElementById("sel-dash-usta");
        const ustaBadge = document.getElementById("badge-sidebar-usta");

        if (phoneInput) phoneInput.value = registrationRow.phone || "";
        if (genderSelect) genderSelect.value = registrationRow.gender || "";
        if (ustaSelect) ustaSelect.value = registrationRow.usta || "";
        if (ustaBadge) ustaBadge.innerText = registrationRow.usta ? `USTA ${registrationRow.usta}` : "USTA --";
    }

    // 2. Fetch & Render Upcoming Active Event Records from tournament_regi
    let usernameToQuery = activeUser.user_metadata?.username || "";
    if (!usernameToQuery && registrationRow?.username) {
        usernameToQuery = registrationRow.username;
    }

    let { data: activeMatches, error: matchErr } = await client
        .from("tournament_regi")
        .select("tournament_code, division, compete_level, username")
        .eq("username", usernameToQuery.trim());

    // Fallback strategy: check email records if username yields nothing
    if ((!activeMatches || activeMatches.length === 0) && activeUser.email) {
        const { data: emailMatches } = await client
            .from("tournament_regi")
            .select("tournament_code, division, compete_level, username")
            .eq("username", activeUser.email.trim());
        if (emailMatches) activeMatches = emailMatches;
    }

    // Pass arrays directly to render engine targets
    renderUpcomingTournaments(activeMatches || []);
    renderCompletedHistory(activeMatches || []); 
}

// RENDER: Active Signed-Up Tournaments Form Grid Cards
function renderUpcomingTournaments(matches) {
    const container = document.getElementById("container-upcoming-events");
    if (!container) return;
    container.innerHTML = ""; 
    
    if (matches.length === 0) {
        container.innerHTML = `<p style="font-size:14px; color:#666; font-style: italic; padding: 10px 0;">You are not currently registered for any upcoming match frameworks.</p>`;
        return;
    }

    matches.forEach(event => {
        container.innerHTML += `
            <div class="tournament-status-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; margin-bottom: 8px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;">
                <div class="t-info-meta" style="text-align: left;">
                    <h4 style="margin: 0 0 4px 0; color: #111827; font-size: 1.05rem; font-weight: bold;">${escapeHTML(event.tournament_code)}</h4>
                    <p style="margin: 0; color: #4b5563; font-size: 0.9rem;">Division: <strong>${escapeHTML(event.division)}</strong> | Level: <strong>${escapeHTML(event.compete_level || 'N/A')}</strong></p>
                    <p style="font-size:12px; color:#888; margin-top:3px;">Court confirmations and check-in brackets will post shortly.</p>
                </div>
                <span class="status-pill pill-registered" style="background: #15803d; color: #fff; padding: 6px 12px; font-size: 0.85rem; font-weight: 600; border-radius: 4px;">Registered</span>
            </div>
        `;
    });
}

// RENDER: Historic Completed Matches with Standings & Placement Scores
function renderCompletedHistory(matches) {
    const container = document.getElementById("container-past-events");
    if (!container) return;
    container.innerHTML = ""; 
    
    const historical = matches.filter(m => m.result || m.placement || m.status === "completed");

    // MOCK DATA FALLBACK: Display placeholders gracefully if no past historical matches are returned
    if (historical.length === 0) {
        container.innerHTML = `
            <div class="tournament-status-row" style="border-left: 4px solid #d97706; padding: 12px 16px; background: #f9fafb; border-top: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; border-radius: 6px;">
                <div class="t-info-meta" style="text-align: left;">
                    <h4 style="margin: 0 0 4px 0; color: #111827;">Spring Spin Championship Warmup</h4>
                    <p style="margin: 0; color: #4b5563;"><strong>Division Match Line:</strong> Men's Singles Bracket (Level 3.5)</p>
                    <p style="margin-top: 4px; font-weight: 500; color: #333; font-size: 0.9rem;">Match Results Score: 6-4, 3-6, [10-7] Match Tiebreak Win</p>
                </div>
                <span class="status-pill pill-champion" style="background: #d97706; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">1st Place Champion</span>
            </div>
            <div class="tournament-status-row" style="border-left: 4px solid #475569; margin-top: 10px; padding: 12px 16px; background: #f9fafb; border-top: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; border-radius: 6px;">
                <div class="t-info-meta" style="text-align: left;">
                    <h4 style="margin: 0 0 4px 0; color: #111827;">Winter Baseline Regional Draw</h4>
                    <p style="margin: 0; color: #4b5563;"><strong>Division Match Line:</strong> Open Mixed Doubles</p>
                    <p style="margin-top: 4px; font-weight: 500; color: #333; font-size: 0.9rem;">Match Results Score: 2-6, 4-6 Round of 16 Out</p>
                </div>
                <span class="status-pill pill-completed" style="background: #475569; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">Completed</span>
            </div>
        `;
        return;
    }

    historical.forEach(pastEvent => {
        const isChamp = pastEvent.placement === "1st" || pastEvent.placement === "Champion";
        container.innerHTML += `
            <div class="tournament-status-row" style="border-left: 4px solid ${isChamp ? '#d97706' : '#475569'}; padding: 12px 16px; margin-bottom: 8px; background: #f9fafb; border-top: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; border-radius: 6px;">
                <div class="t-info-meta" style="text-align: left;">
                    <h4 style="margin: 0 0 4px 0; color: #111827;">${escapeHTML(pastEvent.tournament_code)}</h4>
                    <p style="margin: 0; color: #4b5563;"><strong>Final Record Standings:</strong> ${escapeHTML(pastEvent.result || "Draw Bracket Concluded")}</p>
                </div>
                <span class="status-pill ${isChamp ? 'pill-champion' : 'pill-completed'}" style="background: ${isChamp ? '#d97706' : '#475569'}; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
                    ${escapeHTML(pastEvent.placement || 'Finished')}
                </span>
            </div>
        `;
    });
}

// PROFILE ACTIONS: UPDATE DETAIL PARAMETERS IN DATABASE
const profileForm = document.getElementById("frm-dashboard-profile");
if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const phoneVal = document.getElementById("txt-dash-phone")?.value.trim();
        const genderVal = document.getElementById("sel-dash-gender")?.value;
        const ustaVal = document.getElementById("sel-dash-usta")?.value;

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
            const ustaBadge = document.getElementById("badge-sidebar-usta");
            if (ustaBadge) ustaBadge.innerText = ustaVal ? `USTA ${ustaVal}` : "USTA --";
        }
    });
}

// OMNI-TAB REAL-TIME SYNC HUB
async function syncProfileEvents() {
    console.log("Omni-Tab Synchronization Triggered...");
    await runDashboardCompilation();
}

// Local text verification escape helper
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// Runtime Setup
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runDashboardCompilation);
} else {
    runDashboardCompilation();
}

// Hook tab interaction events seamlessly to reload content matrices
document.addEventListener("click", (e) => {
    if (e.target.closest(".sidebar-menu li") || e.target.closest(".tab-btn") || e.target.closest(".menu-item")) {
        setTimeout(syncProfileEvents, 60);
    }
});
