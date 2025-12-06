// Dashboard Script
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotModal = document.getElementById('chatbotModal');
const closeChatbot = document.getElementById('closeChatbot');
const logoutBtn = document.querySelector('.logout-btn');

let map = null;

// Sample data for search
const searchableData = [
    { title: 'Taj Mahal', description: 'Monument', type: 'attraction' },
    { title: 'Maldives', description: 'Beach Paradise', type: 'destination' },
    { title: 'Swiss Alps', description: 'Mountain Adventure', type: 'destination' },
    { title: 'Luxury Hotel & Spa', description: 'Downtown', type: 'hotel' },
    { title: 'Boutique Hotel', description: 'City Center', type: 'hotel' },
    { title: 'Historical Monument', description: '2.5 km away', type: 'attraction' },
    { title: 'Nature Park', description: 'Hiking trails', type: 'attraction' },
    { title: 'Beach Paradise', description: 'Water sports', type: 'attraction' }
];

// Initialize Dashboard
function initDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Set user info
    document.getElementById('userName').textContent = user.name || user.email;
    document.getElementById('welcomeName').textContent = user.name?.split(' ')[0] || 'Traveler';
    document.getElementById('profileName').textContent = user.name || user.email;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profilePhone').textContent = user.phone || '+1234567890';
    document.getElementById('profileCountry').textContent = user.country || 'Not specified';
}

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active from all items
        navItems.forEach(nav => nav.classList.remove('active'));
        // Add active to clicked item
        item.classList.add('active');

        // Hide all sections
        contentSections.forEach(section => section.classList.remove('active'));
        
        // Show selected section
        const sectionId = item.getAttribute('data-section') + 'Section';
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
        }

        // Initialize map if needed
        if (item.getAttribute('data-section') === 'map' && !map) {
            initializeMap();
        }
    });
});

// Chatbot Toggle
chatbotToggle.addEventListener('click', () => {
    chatbotModal.classList.toggle('active');
});

closeChatbot.addEventListener('click', () => {
    chatbotModal.classList.remove('active');
});

// Logout
logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
});

// Initialize Map (using Leaflet)
function initializeMap() {
    if (map) return;

    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Initialize map with default location (India)
    map = L.map('map').setView([20.5937, 78.9629], 5);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add some sample tourist spots and hotels
    const spots = [
        {
            name: 'Taj Mahal',
            lat: 27.1751,
            lng: 78.0421,
            type: 'monument',
            icon: '🏛️'
        },
        {
            name: 'Maldives',
            lat: 4.2105,
            lng: 73.5087,
            type: 'beach',
            icon: '🏖️'
        },
        {
            name: 'Luxury Hotel',
            lat: 28.7041,
            lng: 77.1025,
            type: 'hotel',
            icon: '🏨'
        },
        {
            name: 'Lake Palace',
            lat: 25.2408,
            lng: 73.1305,
            type: 'hotel',
            icon: '🏨'
        }
    ];

    // Add markers
    spots.forEach(spot => {
        L.marker([spot.lat, spot.lng], {
            title: spot.name
        }).bindPopup(`<strong>${spot.name}</strong><br>${spot.type}`)
         .addTo(map);
    });

    // Current location button
    document.getElementById('currentLocation').addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                map.setView([lat, lng], 13);
                L.marker([lat, lng], { title: 'Your Location' })
                    .bindPopup('You are here!')
                    .addTo(map);
                showToast('Location updated!');
            });
        } else {
            showToast('Geolocation not supported', 'error');
        }
    });

    // Offline mode button
    document.getElementById('toggleOffline').addEventListener('click', () => {
        showToast('Offline mode would download map tiles for offline access');
    });
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Book Now Buttons
document.querySelectorAll('.btn-small').forEach(btn => {
    if (btn.textContent.includes('Book Now')) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Booking feature coming soon!');
        });
    }
});

// Get Directions Buttons
document.querySelectorAll('.btn-small').forEach(btn => {
    if (btn.textContent.includes('Get Directions')) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=tourist_spot`;
                    window.open(url, '_blank');
                });
            }
        });
    }
});

// Save Buttons
document.querySelectorAll('.btn-small.secondary').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        btn.innerHTML = '<i class="fas fa-check"></i> Saved';
        btn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        btn.style.color = 'white';
        showToast('Attraction saved to your itinerary!');
    });
});

// Edit Profile Button
const editProfileBtn = document.querySelector('.btn-primary');
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Edit profile modal would open here');
    });
}

// Search functionality
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length > 0) {
            const results = searchableData.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
            console.log('Search Results:', results);
            if (results.length > 0) {
                showToast(`Found ${results.length} results for "${query}"`);
            } else {
                showToast('No results found');
            }
        }
    });

    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.toLowerCase();
            const results = searchableData.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
            if (results.length === 0) {
                showToast('No destinations found. Try another search!', 'warning');
            }
        }
    });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initBudgetTracker();
    initTripPlanner();
    initTranslator();
});

// ===== BUDGET TRACKER =====
function initBudgetTracker() {
    const expenseForm = document.getElementById('expenseForm');
    if (!expenseForm) return;

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = expenseForm.querySelectorAll('input, select');
        const description = inputs[0].value;
        const amount = inputs[1].value;
        const category = inputs[2].value;

        if (description && amount && category) {
            showToast(`✓ Expense added: ${description} - $${amount}`);
            expenseForm.reset();
        }
    });
}

// ===== TRIP PLANNER =====
function initTripPlanner() {
    const tripForm = document.getElementById('tripForm');
    if (!tripForm) return;

    tripForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = tripForm.querySelectorAll('input');
        const destination = inputs[0].value;
        const startDate = inputs[1].value;
        const endDate = inputs[2].value;
        const budget = inputs[3].value;

        if (destination && startDate && endDate && budget) {
            showToast(`✓ Trip created: ${destination} (Budget: $${budget})`);
            tripForm.reset();
        }
    });
}

// ===== TRANSLATOR =====
function initTranslator() {
    const translateBtn = document.getElementById('translateBtn');
    const textToTranslate = document.getElementById('textToTranslate');
    const translatedText = document.getElementById('translatedText');
    const copyBtn = document.getElementById('copyBtn');

    if (!translateBtn) return;

    // Try using LibreTranslate API for full language support; fallback to simple mapping on error
    const simpleTranslations = {
        'hello': 'नमस्ते',
        'thank you': 'धन्यवाद',
        'where': 'कहाँ',
        'help': 'मदद',
        'water': 'पानी',
        'food': 'खाना',
        'hotel': 'होटल',
        'emergency': 'आपातकाल'
    };

    translateBtn.addEventListener('click', async () => {
        const text = (textToTranslate.value || '').trim();
        if (!text) {
            showToast('Please enter text to translate', 'warning');
            return;
        }

        const fromLangEl = document.getElementById('fromLang');
        const toLangEl = document.getElementById('toLang');
        const source = fromLangEl ? fromLangEl.value : 'en';
        const target = toLangEl ? toLangEl.value : 'hi';

        translateBtn.disabled = true;
        translateBtn.textContent = 'Translating...';

        // Attempt network translate via LibreTranslate
        try {
            const resp = await fetch('https://libretranslate.de/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: text, source: source, target: target, format: 'text' })
            });

            if (!resp.ok) throw new Error('Translation API error');
            const data = await resp.json();
            if (data && data.translatedText) {
                translatedText.textContent = data.translatedText;
                showToast('✓ Text translated!');
            } else {
                throw new Error('Invalid translation response');
            }
        } catch (err) {
            // Fallback: basic word replacement mapping (works for simple phrases only)
            let translation = text;
            for (let word in simpleTranslations) {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                translation = translation.replace(regex, simpleTranslations[word]);
            }
            translatedText.textContent = translation;
            showToast('Translation (fallback) shown — network unavailable', 'warning');
        } finally {
            translateBtn.disabled = false;
            translateBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Translate';
        }
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = translatedText.textContent;
            if (text && text !== 'Translation will appear here...') {
                navigator.clipboard.writeText(text);
                showToast('✓ Translation copied to clipboard!');
            }
        });
    }

    // Swap language buttons
    const swapBtn = document.querySelector('.swap-btn');
    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            const fromLang = document.getElementById('fromLang');
            const toLang = document.getElementById('toLang');
            const temp = fromLang.value;
            fromLang.value = toLang.value;
            toLang.value = temp;
            showToast('✓ Languages swapped!');
        });
    }
}

