// This file contains the JavaScript code for handling the login functionality.
// It includes functions to validate user input and handle form submission.

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (validateInput(username, password)) {
            if (authenticate(username, password)) {
                // Simpan username ke localStorage
                localStorage.setItem('loggedInUser', username);
                // Redirect ke dashboard
                window.location.href = "dashboard.html";
            } else {
                alert('Invalid username or password.');
            }
        } else {
            alert('Please enter valid username and password.');
        }
    });

    function validateInput(username, password) {
        return username.trim() !== '' && password.trim() !== '';
    }

    function authenticate(username, password) {
        // Hardcoded credentials for testing
        return username === 'admin' && password === 'password123';
    }
});