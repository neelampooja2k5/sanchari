// Login Page Script
const loginForm = document.getElementById('loginForm');
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const emailInput = document.getElementById('email');

// Demo User Database - users who have registered
const registeredUsers = [
    { email: 'demo@example.com', password: 'password123', name: 'Demo User' },
    { email: 'user@sanchari.com', password: 'sanchari123', name: 'Sanchari User' },
    { email: 'test@test.com', password: 'test1234', name: 'Test Account' }
];

// Function to find user by email and password
function validateUserCredentials(email, password) {
    return registeredUsers.find(user => user.email === email && user.password === password);
}

// Toggle Password Visibility
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.querySelector('i').classList.toggle('fa-eye');
    togglePasswordBtn.querySelector('i').classList.toggle('fa-eye-slash');
});

// Form Validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function showError(input, message) {
    const errorElement = document.getElementById(input.id + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        input.style.borderColor = '#ff6b6b';
    }
}

function clearError(input) {
    const errorElement = document.getElementById(input.id + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        input.style.borderColor = '#dfe6e9';
    }
}

emailInput.addEventListener('blur', () => {
    if (emailInput.value && !validateEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email address');
    } else {
        clearError(emailInput);
    }
});

passwordInput.addEventListener('blur', () => {
    if (passwordInput.value && !validatePassword(passwordInput.value)) {
        showError(passwordInput, 'Password must be at least 6 characters');
    } else {
        clearError(passwordInput);
    }
});

// Form Submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset errors
    clearError(emailInput);
    clearError(passwordInput);

    // Validate
    let isValid = true;

    if (!emailInput.value) {
        showError(emailInput, 'Email is required');
        isValid = false;
    } else if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email');
        isValid = false;
    }

    if (!passwordInput.value) {
        showError(passwordInput, 'Password is required');
        isValid = false;
    } else if (!validatePassword(passwordInput.value)) {
        showError(passwordInput, 'Password must be at least 6 characters');
        isValid = false;
    }

    if (!isValid) return;

    // Send credentials to server
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailInput.value,
                password: passwordInput.value
            })
        });

        const data = await response.json();

        if (data.success) {
            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify({
                email: emailInput.value
            }));
            localStorage.setItem('token', 'token-' + emailInput.value);
            window.location.href = 'dashboard.html';
        } else {
            // Show error from server
            showError(emailInput, data.message || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(emailInput, 'Network error. Please try again.');
    }
});

// Social Login Buttons - Redirect to provider-specific login pages
const googleBtn = document.querySelector('.google-btn');
const facebookBtn = document.querySelector('.facebook-btn');
const twitterBtn = document.querySelector('.twitter-btn');

if (googleBtn) googleBtn.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'google_login.html'; });
if (facebookBtn) facebookBtn.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'facebook_login.html'; });
if (twitterBtn) twitterBtn.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'twitter_login.html'; });

// Forgot Password
document.querySelector('.forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Password reset link would be sent to your email');
});
