const SUPABASE_URL = "https://wcaoltfalhstnvjhcxbi.supabase.co/rest/v1/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjYW9sdGZhbGhzdG52amhjeGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjQzNTcsImV4cCI6MjA5NTE0MDM1N30.qqoegdtiXp5Xnfoa-TASwJT2S_InYfkJyfaAO9hviys";

const client = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const signinBtn = document.getElementById("signin-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout-btn");

const userStatus = document.getElementById("user-status");

const registrationContainer =
    document.getElementById("registration-form-container");

const loginMessage =
    document.getElementById("login-message");

async function updateUI() {

    const {
        data: { session }
    } = await client.auth.getSession();

    if (session) {

        userStatus.innerText =
            `Signed in as ${session.user.email}`;

        logoutBtn.style.display = "inline-block";

        signinBtn.style.display = "none";
        signupBtn.style.display = "none";

        registrationContainer.style.display = "block";

        loginMessage.style.display = "none";

    } else {

        userStatus.innerText = "Not signed in";

        logoutBtn.style.display = "none";

        signinBtn.style.display = "inline-block";
        signupBtn.style.display = "inline-block";

        registrationContainer.style.display = "none";

        loginMessage.style.display = "block";
    }
}

signupBtn.addEventListener("click", async () => {

    const email = prompt("Enter email");
    const password = prompt("Enter password");

    const { error } = await client.auth.signUp({
        email,
        password
    });

    if (error) {
        alert(error.message);
    } else {
        alert(
            "Signup successful! Check your email for confirmation."
        );
    }

    updateUI();
});

signinBtn.addEventListener("click", async () => {

    const email = prompt("Enter email");
    const password = prompt("Enter password");

    const { error } =
        await client.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        alert(error.message);
    } else {
        alert("Signed in successfully!");
    }

    updateUI();
});

logoutBtn.addEventListener("click", async () => {

    await client.auth.signOut();

    updateUI();
});

updateUI();
