// Funktion för att registrera en ny admin  
function registerUser() {
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    const email = document.getElementById("registerEmail").value;

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, email })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Registreringen misslyckades.');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
        document.getElementById("registerForm").reset();
    })
    .catch(error => {
        alert(error.message);
    });
}

// logga in 
function loginUser() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Inloggningen misslyckades.');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
        localStorage.setItem('token', data.token);
        window.location.href = "undersida.html";
    })
    .catch(error => {
        alert(error.message);
    });
}


// Funktion för att hämta JWT-token från localStorage
function getToken() {
    return localStorage.getItem('token');
}



// Funktion för att kontrollera om admin är inloggad
function checkLoggedIn() {
    const token = getToken();
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "undersida.html" && !token) {
        window.location.href = "index1.html";
    } else if (token) {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const username = tokenPayload.username;
        document.getElementById("welcomeMessage").textContent = "Hej " + username + ", välkommen till din sida!";
    }
}

// Kör funktioner när sidan laddas
document.addEventListener("DOMContentLoaded", function() {

    checkLoggedIn();

});
