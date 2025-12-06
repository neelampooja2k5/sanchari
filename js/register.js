// Registration Page Script
const registerForm = document.getElementById('registerForm');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('regEmail');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('regPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const countryInput = document.getElementById('country');
const termsCheckbox = document.getElementById('termsCheck');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    
    return strength;
}

// Password strength indicator
passwordInput.addEventListener('input', () => {
    const strength = checkPasswordStrength(passwordInput.value);
    
    strengthBar.className = 'strength-bar';
    
    if (passwordInput.value.length === 0) {
        strengthBar.className = 'strength-bar';
        strengthText.textContent = '';
    } else if (strength < 2) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Weak';
        strengthText.style.color = '#ff6b6b';
    } else if (strength < 3) {
        strengthBar.classList.add('medium');
        strengthText.textContent = 'Medium';
        strengthText.style.color = '#ffa502';
    } else {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Strong';
        strengthText.style.color = '#00d084';
    }
});

// Show/Clear error messages
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

// Real-time validation
firstNameInput.addEventListener('blur', () => {
    if (firstNameInput.value && firstNameInput.value.length < 2) {
        showError(firstNameInput, 'First name must be at least 2 characters');
    } else {
        clearError(firstNameInput);
    }
});

lastNameInput.addEventListener('blur', () => {
    if (lastNameInput.value && lastNameInput.value.length < 2) {
        showError(lastNameInput, 'Last name must be at least 2 characters');
    } else {
        clearError(lastNameInput);
    }
});

emailInput.addEventListener('blur', () => {
    if (emailInput.value && !validateEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email address');
    } else {
        clearError(emailInput);
    }
});

phoneInput.addEventListener('blur', () => {
    if (phoneInput.value && !validatePhone(phoneInput.value)) {
        showError(phoneInput, 'Please enter a valid phone number');
    } else {
        clearError(phoneInput);
    }
});

confirmPasswordInput.addEventListener('blur', () => {
    if (confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value) {
        showError(confirmPasswordInput, 'Passwords do not match');
    } else {
        clearError(confirmPasswordInput);
    }
});

// Form Submit
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset all errors
    [firstNameInput, lastNameInput, emailInput, phoneInput, passwordInput, confirmPasswordInput, countryInput, termsCheckbox]
        .forEach(input => clearError(input));

    // Validate form
    let isValid = true;

    if (!firstNameInput.value) {
        showError(firstNameInput, 'First name is required');
        isValid = false;
    } else if (firstNameInput.value.length < 2) {
        showError(firstNameInput, 'First name must be at least 2 characters');
        isValid = false;
    }

    if (!lastNameInput.value) {
        showError(lastNameInput, 'Last name is required');
        isValid = false;
    } else if (lastNameInput.value.length < 2) {
        showError(lastNameInput, 'Last name must be at least 2 characters');
        isValid = false;
    }

    if (!emailInput.value) {
        showError(emailInput, 'Email is required');
        isValid = false;
    } else if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email');
        isValid = false;
    }

    if (!phoneInput.value) {
        showError(phoneInput, 'Phone number is required');
        isValid = false;
    } else if (!validatePhone(phoneInput.value)) {
        showError(phoneInput, 'Please enter a valid phone number');
        isValid = false;
    }

    if (!passwordInput.value) {
        showError(passwordInput, 'Password is required');
        isValid = false;
    } else if (passwordInput.value.length < 6) {
        showError(passwordInput, 'Password must be at least 6 characters');
        isValid = false;
    }

    if (!confirmPasswordInput.value) {
        showError(confirmPasswordInput, 'Please confirm your password');
        isValid = false;
    } else if (confirmPasswordInput.value !== passwordInput.value) {
        showError(confirmPasswordInput, 'Passwords do not match');
        isValid = false;
    }

    if (!countryInput.value) {
        showError(countryInput, 'Country is required');
        isValid = false;
    }

    if (!termsCheckbox.checked) {
        const termsError = document.getElementById('termsError');
        termsError.textContent = 'You must agree to the terms and conditions';
        termsError.classList.add('show');
        isValid = false;
    }

    if (!isValid) return;

    // Get selected interests
    const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
        .map(checkbox => checkbox.value);

    // Prepare user data
    const userData = {
        fullName: firstNameInput.value + ' ' + lastNameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        confirmPassword: confirmPasswordInput.value
    };

    // Send registration request
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('user', JSON.stringify({
                email: emailInput.value,
                name: firstNameInput.value + ' ' + lastNameInput.value
            }));
            localStorage.setItem('token', 'token-' + emailInput.value);
            window.location.href = 'dashboard.html';
        } else {
            if (data.message.includes('email')) {
                showError(emailInput, data.message);
            } else {
                alert('Registration failed: ' + data.message);
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Error during registration. Please try again.');
    }
});
