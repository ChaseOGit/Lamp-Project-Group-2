const urlBase = 'https://cis4004chase.xyz/api';
const extension = 'php';

// Add event listener to the form in index.html
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if(loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault(); // Stop page from reloading
            doLogin();
        });
    }
});

async function doLogin() {
    
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    // Create JSON payload matching what login.php expects
    let tmp = { username: user, passwords: pass };
    
    try {
        // Send POST request to API
        const response = await fetch(`${urlBase}/login.${extension}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tmp)
        });

        const jsonObject = await response.json();

        // Handle response
        if (jsonObject.error !== "") {
            alert("Error: " + jsonObject.error); // Show error to user
            return;
        }

        // Save User ID to localStorage
        localStorage.setItem("userId", jsonObject.user_id);
        localStorage.setItem("username", jsonObject.username);
        
        // Redirect to dashboard
        window.location.href = "dashboard.html";

    } catch (err) {
        console.error("Network error: ", err);
    }
}