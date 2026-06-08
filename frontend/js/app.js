const urlBase = 'https://cis4004chase.xyz/contacts/api'; // Make sure this points exactly to where your PHP files live
const extension = 'php';

// ==========================================
// 1. AUTHENTICATION (Login, Register, Logout)
// ==========================================

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

        // Save session locally using localStorage
        localStorage.setItem("userId", jsonObject.user_id);
        localStorage.setItem("username", jsonObject.username);
        
        // Redirect to dashboard on success
        window.location.href = "dashboard.html";
    } catch (err) {
        document.getElementById("loginResult").innerHTML = "Network Error: " + err.message;
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

        // Show success message and flip back to login screen
        let resultSpan = document.getElementById("registerResult");
        resultSpan.style.color = "#00ffcc"; // Greenish success color
        resultSpan.innerHTML = "Success! Please sign in.";
        setTimeout(switchToLogin, 1500); // Wait 1.5 seconds, then toggle to login
        
    } catch (err) {
        document.getElementById("registerResult").innerHTML = "Network Error: " + err.message;
    }
}

function doLogout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "index.html"; // Kick them back to the login page
}

// ==========================================
// 2. CONTACT MANAGEMENT (Dashboard)
// ==========================================

let editingContactId = 0; // 0 = Adding a new contact, anything else = Editing existing

// Run this immediately when dashboard.html loads
function loadDashboard() {
    let userId = localStorage.getItem("userId");
    // Security check: if not logged in, boot them out
    if(!userId || userId < 1) {
        window.location.href = "index.html"; 
        return;
    }
    
    document.getElementById("userGreeting").innerHTML = "Welcome, " + localStorage.getItem("username");
    searchContacts(); // Load all contacts initially
}

// Opens the modal for ADDING a contact
function triggerAddModal() {
    editingContactId = 0; // Reset ID to 0 so the app knows we are adding
    document.getElementById("modalTitle").innerHTML = "Add New Contact";
    document.getElementById('contactForm').reset();
    document.getElementById('contactModal').style.display = 'flex';
}

// Opens the modal for EDITING a contact and auto-fills their data
function openEditModal(id, name, phone, email) {
    editingContactId = id; // Save the ID of the specific contact
    document.getElementById("modalTitle").innerHTML = "Edit Contact";
    
    // Auto-fill the text boxes
    document.getElementById("c_name").value = name;
    document.getElementById("phone").value = phone;
    document.getElementById("email").value = email;
    
    document.getElementById('contactModal').style.display = 'flex';
}

// Triggered when you click "Save Contact" in the modal
async function submitContactForm() {
    if (editingContactId === 0) {
        await addContact(); // We are adding
    } else {
        await updateContact(); // We are editing
    }
}

// Fetches contacts based on the search bar (or grabs all if empty)
async function searchContacts() {
    let userId = localStorage.getItem("userId");
    let searchInput = document.getElementById("searchInput");
    let searchVal = searchInput ? searchInput.value : "";
    
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
            contactsGrid.innerHTML = "<p style='grid-column: 1 / -1; text-align: center;'>No contacts found.</p>";
            return;
        }

        // Loop through the results and build the HTML cards
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
                        <button class="action-btn edit-btn" onclick="openEditModal(${contact.contact_id}, '${contact.c_name}', '${contact.phone}', '${contact.email}')">Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteContact(${contact.contact_id})">Delete</button>
                    </div>
                </div>
            `;
        }
    } catch (err) {
        console.log("Search Error: ", err.message);
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
            closeModal(); // Call the HTML function to hide the box
            searchContacts(); // Refresh the grid
        } else {
            alert("API Error: " + jsonObject.error);
        }
    } catch (err) {
        alert("Network Error: " + err.message);
    }
}

async function updateContact() {
    let userId = localStorage.getItem("userId");
    let c_name = document.getElementById("c_name").value;
    let phone = document.getElementById("phone").value;
    let email = document.getElementById("email").value;

    let tmp = { contact_id: editingContactId, c_name: c_name, phone: phone, email: email, reference_id: userId };
    
    try {
        const response = await fetch(`${urlBase}/updateContact.${extension}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tmp)
        });
        const jsonObject = await response.json();

        if (jsonObject.error === "") {
            closeModal(); 
            searchContacts(); 
        } else {
            alert("API Error: " + jsonObject.error);
        }
    } catch (err) {
        alert("Network Error: " + err.message);
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
            searchContacts(); 
        } else {
            alert("API Error: " + jsonObject.error);
        }
    } catch (err) {
        alert("Network Error: " + err.message);
    }
}
