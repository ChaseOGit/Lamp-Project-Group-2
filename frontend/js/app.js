const urlBase = '../api';
const extension = 'php';


async function doLogin() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;
    let tmp = { username: user, passwords: pass };
    
    try {
        const response = await fetch(`${urlBase}/login.${extension}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tmp)
        });
        const jsonObject = await response.json();

        if (jsonObject.error !== "") {
            document.getElementById("loginResult").innerHTML = jsonObject.error;
            return;
        }

        // Save session locally
        localStorage.setItem("userId", jsonObject.user_id);
        localStorage.setItem("username", jsonObject.username);
        
        window.location.href = "dashboard.html";
    } catch (err) {
        document.getElementById("loginResult").innerHTML = err.message;
    }
}

async function doRegister() {
    let user = document.getElementById("regUsername").value;
    let pass = document.getElementById("regPassword").value;
    let tmp = { username: user, passwords: pass };
    
    try {
        const response = await fetch(`${urlBase}/register.${extension}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tmp)
        });
        const jsonObject = await response.json();

        if (jsonObject.error !== "") {
            document.getElementById("registerResult").innerHTML = jsonObject.error;
            return;
        }

        document.getElementById("registerResult").style.color = "green";
        document.getElementById("registerResult").innerHTML = "Success! Please sign in.";
        setTimeout(toggleForms, 1500); // Send them back to login page
    } catch (err) {
        document.getElementById("registerResult").innerHTML = err.message;
    }
}

function doLogout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "index.html";
}


function loadDashboard() {
    let userId = localStorage.getItem("userId");
    if(!userId || userId < 1) {
        window.location.href = "index.html"; // Kick them out if not logged in
        return;
    }
    
    document.getElementById("userGreeting").innerHTML = "Welcome, " + localStorage.getItem("username");
    searchContacts(); // Load all contacts initially (empty search grabs all)
}

async function searchContacts() {
    let userId = localStorage.getItem("userId");
    // Grab the text from the search bar (or an empty string to load all)
    let searchVal = document.getElementById("searchInput") ? document.getElementById("searchInput").value : "";
    
    let tmp = { search: searchVal, reference_id: userId };
    
    try {
        const response = await fetch(`${urlBase}/searchContacts.${extension}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tmp)
        });
        const jsonObject = await response.json();
        
        let contactsGrid = document.getElementById("contactsGrid");
        contactsGrid.innerHTML = ""; // Clear existing grid

        if (jsonObject.error === "No Records Found") {
            contactsGrid.innerHTML = "<p>No contacts found.</p>";
            return;
        }

        // Loop through results and build the HTML cards dynamically
        for(let i = 0; i < jsonObject.results.length; i++) {
            let contact = jsonObject.results[i];
            contactsGrid.innerHTML += `
                <div class="contact-card">
                    <div class="contact-info">
                        <h3>${contact.c_name}</h3>
                        <p class="contact-detail">📞 ${contact.phone}</p>
                        <p class="contact-detail">✉️ ${contact.email}</p>
                    </div>
                    <div class="contact-actions">
                        <!-- We pass the contact_id into the delete function -->
                        <button class="action-btn delete-btn" onclick="deleteContact(${contact.contact_id})">Delete</button>
                    </div>
                </div>
            `;
        }
    } catch (err) {
        console.log(err.message);
    }
}

async function addContact() {
    let userId = localStorage.getItem("userId");
    let c_name = document.getElementById("c_name").value;
    let phone = document.getElementById("phone").value;
    let email = document.getElementById("email").value;

    let tmp = { reference_id: userId, c_name: c_name, phone: phone, email: email };
    
    try {
        const response = await fetch(`${urlBase}/addContact.${extension}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tmp)
        });
        const jsonObject = await response.json();

        if (jsonObject.error === "") {
            // Close modal , clear form, and reload contacts
            closeModal();
            document.getElementById("contactForm").reset();
            // document.getElementById("contactModal").style.display = "none"; // Hide modal
            searchContacts(); 
        } else {
            alert(jsonObject.error);
        }
    } catch (err) {
        console.log(err.message);
    }
}

async function deleteContact(contactId) {
    if(!confirm("Are you sure you want to delete this contact?")) return;

    let userId = localStorage.getItem("userId");
    let tmp = { contact_id: contactId, reference_id: userId };

    try {
        const response = await fetch(`${urlBase}/deleteContact.${extension}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tmp)
        });
        const jsonObject = await response.json();

        if (jsonObject.error === "") {
            searchContacts(); // Reload grid after successful delete
        } else {
            alert(jsonObject.error);
        }
    } catch (err) {
        console.log(err.message);
    }
}
