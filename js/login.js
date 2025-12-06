// Login Page Script
const loginForm = document.getElementById('loginForm');
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const emailInput = document.getElementById('email');

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

    // Simulate login API call
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailInput.value,
                password: passwordInput.value
            })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            window.location.href = 'dashboard.html';
        } else {
            showError(emailInput, 'Invalid email or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        // For demo purposes, allow login
        localStorage.setItem('user', JSON.stringify({
            email: emailInput.value,
            name: emailInput.value.split('@')[0]
        }));
        window.location.href = 'dashboard.html';
    }
});

// Social Login Buttons - simulated login (works immediately without backend)
function socialLogin(provider) {
    const demoUser = {
        name: provider.charAt(0).toUpperCase() + provider.slice(1) + ' User',
        email: provider.toLowerCase() + '@example.com',
        provider: provider
    };
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('token', 'demo-' + provider + '-token');
    window.location.href = 'dashboard.html';
}

const googleBtn = document.querySelector('.google-btn');
const facebookBtn = document.querySelector('.facebook-btn');
const twitterBtn = document.querySelector('.twitter-btn');

if (googleBtn) googleBtn.addEventListener('click', (e) => { e.preventDefault(); socialLogin('google'); });
if (facebookBtn) facebookBtn.addEventListener('click', (e) => { e.preventDefault(); socialLogin('facebook'); });
if (twitterBtn) twitterBtn.addEventListener('click', (e) => { e.preventDefault(); socialLogin('twitter'); });

// Forgot Password
document.querySelector('.forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Password reset link would be sent to your email');
});
