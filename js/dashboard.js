// Dashboard Script
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotModal = document.getElementById('chatbotModal');
const closeChatbot = document.getElementById('closeChatbot');
const logoutBtn = document.querySelector('.logout-btn');

let map = null;

// Search functionality - searches across all places
let allPlacesData = {
    hotels: [],
    restaurants: [],
    attractions: [],
    activities: [],
    saved: []
};

function initSearch() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length > 0) {
            performSearch(query);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim().toLowerCase();
            if (query.length > 0) {
                performSearch(query);
            }
        }
    });
}

function performSearch(query) {
    const results = [];
    
    // Search in hotels
    allPlacesData.hotels.forEach(item => {
        if (item.name.toLowerCase().includes(query)) {
            results.push({ ...item, type: 'hotel', searchType: 'Hotels' });
        }
    });
    
    // Search in restaurants
    allPlacesData.restaurants.forEach(item => {
        if (item.name.toLowerCase().includes(query)) {
            results.push({ ...item, type: 'restaurant', searchType: 'Restaurants' });
        }
    });
    
    // Search in attractions
    allPlacesData.attractions.forEach(item => {
        if (item.name.toLowerCase().includes(query)) {
            results.push({ ...item, type: 'attraction', searchType: 'Attractions' });
        }
    });
    
    // Search in activities
    allPlacesData.activities.forEach(item => {
        if (item.name.toLowerCase().includes(query)) {
            results.push({ ...item, type: 'activity', searchType: 'Activities' });
        }
    });
    
    // Search in saved places
    const saved = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
    saved.forEach(item => {
        if (item.name.toLowerCase().includes(query)) {
            results.push({ ...item, searchType: 'Saved Places' });
        }
    });
    
    if (results.length > 0) {
        showSearchResults(results, query);
    } else {
        showToast(`No results found for "${query}"`, 'warning');
    }
}

function showSearchResults(results, query) {
    const message = `Found ${results.length} result${results.length > 1 ? 's' : ''} for "${query}"`;
    showToast(message, 'success');
    
    // Store results for display
    localStorage.setItem('searchResults', JSON.stringify(results));
    
    // If on trip planner section, highlight results
    const currentSection = document.querySelector('.content-section.active');
    if (currentSection && currentSection.id === 'plannerSection') {
        highlightSearchResults(results);
    }
}

function highlightSearchResults(results) {
    // Highlight matching cards
    results.forEach(result => {
        const cards = document.querySelectorAll('.trip-card');
        cards.forEach(card => {
            const title = card.querySelector('.trip-card-title');
            if (title && title.textContent === result.name) {
                card.style.border = '3px solid var(--primary-color)';
                card.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.4)';
                setTimeout(() => {
                    card.style.border = '';
                    card.style.boxShadow = '';
                }, 3000);
            }
        });
    });
}

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
    
    // Initialize dynamic sections
    updateHomeStats();
    loadRecentVisits();
    initHotelsSection();
    initAttractionsSection();
    initBookingsSection();
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
        
        // Refresh bookings when bookings section is accessed
        if (item.getAttribute('data-section') === 'bookings') {
            renderBookings();
            updateHomeStats();
        }
        
        // Refresh home stats when home section is accessed
        if (item.getAttribute('data-section') === 'home') {
            updateHomeStats();
            loadRecentVisits();
        }
        
        // Load safety alerts when safety section is accessed
        if (item.getAttribute('data-section') === 'safety') {
            if (!safetyLocation) {
                getUserLocationForSafety();
            } else {
                fetchWeatherData();
                fetchTrafficData();
            }
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

// ===== HOME SECTION - DYNAMIC STATS =====
function updateHomeStats() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
    const visitedPlaces = JSON.parse(localStorage.getItem('visitedPlaces') || '[]');
    
    // Count unique destinations
    const destinations = new Set();
    savedPlaces.forEach(p => {
        if (p.location) destinations.add(p.location);
    });
    visitedPlaces.forEach(p => {
        if (p.location) destinations.add(p.location);
    });
    
    // Count hotels stayed
    const hotelsStayed = bookings.filter(b => b.type === 'hotel').length;
    
    // Count attractions visited
    const attractionsVisited = visitedPlaces.filter(p => p.type === 'attraction' || p.type === 'activity').length;
    
    // Update stats
    const destinationsEl = document.getElementById('destinationsCount');
    const hotelsEl = document.getElementById('hotelsStayedCount');
    const attractionsEl = document.getElementById('attractionsVisitedCount');
    const bookingsEl = document.getElementById('totalBookingsCount');
    
    if (destinationsEl) destinationsEl.textContent = destinations.size;
    if (hotelsEl) hotelsEl.textContent = hotelsStayed;
    if (attractionsEl) attractionsEl.textContent = attractionsVisited;
    if (bookingsEl) bookingsEl.textContent = bookings.length;
}

function loadRecentVisits() {
    const container = document.getElementById('recentVisitsContainer');
    if (!container) return;
    
    const savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
    const visitedPlaces = JSON.parse(localStorage.getItem('visitedPlaces') || '[]');
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Combine and sort by date
    const allPlaces = [
        ...savedPlaces.map(p => ({ ...p, date: new Date(p.date), source: 'saved' })),
        ...visitedPlaces.map(p => ({ ...p, date: new Date(p.date || Date.now()), source: 'visited' })),
        ...bookings.map(b => ({ 
            name: b.name, 
            type: b.type, 
            date: new Date(b.bookingDate || b.date), 
            source: 'booking',
            location: b.location 
        }))
    ].sort((a, b) => b.date - a.date).slice(0, 6);
    
    if (allPlaces.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-light);">
                <i class="fas fa-map-marker-alt" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>No recent visits yet. Start exploring and saving places!</p>
            </div>
        `;
        return;
    }
    
    const typeIcons = {
        hotel: '🏨',
        restaurant: '🍽️',
        attraction: '🏛️',
        activity: '🌳'
    };
    
    const typeColors = {
        hotel: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        restaurant: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        attraction: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        activity: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    };
    
    container.innerHTML = allPlaces.map(place => `
        <div class="destination-card">
            <div class="card-image" style="background: ${typeColors[place.type] || typeColors.hotel};">
                <span class="badge">${place.source === 'booking' ? 'Booked' : place.source === 'visited' ? 'Visited' : 'Saved'}</span>
            </div>
            <div class="card-content">
                <h4>${place.name}</h4>
                <p>${place.type ? place.type.charAt(0).toUpperCase() + place.type.slice(1) : 'Place'}</p>
                <div class="card-footer">
                    <span class="rating"><i class="fas fa-calendar"></i> ${place.date.toLocaleDateString()}</span>
                    <button class="btn-small" onclick="viewPlaceDetails('${escapeHtmlAttribute(place.name)}', '${place.type}')">View Details</button>
                </div>
            </div>
        </div>
    `).join('');
}

function viewPlaceDetails(name, type) {
    showToast(`Viewing details for ${name}...`);
    // Navigate to appropriate section
    const navItem = document.querySelector(`[data-section="${type === 'hotel' ? 'hotels' : 'attractions'}"]`);
    if (navItem) navItem.click();
}

// ===== HOTELS SECTION - LOCATION BASED =====
let hotelsLocation = null;

function initHotelsSection() {
    // Get user location when hotels section is accessed
    const hotelsNav = document.querySelector('[data-section="hotels"]');
    if (hotelsNav) {
        hotelsNav.addEventListener('click', () => {
            if (!hotelsLocation) {
                getUserLocationForHotels();
            }
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('hotelSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterHotels(e.target.value);
        });
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('hotelSortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortHotels(e.target.value);
        });
    }
}

function getUserLocationForHotels() {
    const container = document.getElementById('hotelsGridContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-light);">
            <i class="fas fa-spinner fa-spin" style="font-size: 40px; margin-bottom: 15px; color: var(--primary-color);"></i>
            <p>Getting your location...</p>
        </div>
    `;
    
    if (!navigator.geolocation) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-light);">
                <i class="fas fa-exclamation-circle" style="font-size: 50px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>Geolocation not supported. Please enable location access.</p>
            </div>
        `;
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            hotelsLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            fetchHotelsForSection();
        },
        () => {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-light);">
                    <i class="fas fa-exclamation-circle" style="font-size: 50px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Location access denied. Please enable location to see nearby hotels.</p>
                </div>
            `;
        }
    );
}

function fetchHotelsForSection() {
    if (!hotelsLocation) return;
    
    const container = document.getElementById('hotelsGridContainer');
    if (!container) return;
    
    const bbox = getBBox(hotelsLocation.lat, hotelsLocation.lng, 0.1);
    const query = `[bbox:${bbox}];(node["tourism"="hotel"];way["tourism"="hotel"];);out center;`;
    
    fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query))
        .then(r => r.json())
        .then(data => {
            if (data.elements && data.elements.length > 0) {
                const hotels = data.elements.map(el => ({
                    name: el.tags?.name || 'Hotel',
                    lat: el.lat || el.center?.lat,
                    lng: el.lon || el.center?.lon,
                    rating: (4 + Math.random()).toFixed(1),
                    price: Math.round(50 + Math.random() * 150),
                    distance: calcDistanceFromLocation({ lat: el.lat || el.center?.lat, lng: el.lon || el.center?.lon })
                })).filter(h => h.lat && h.lng).slice(0, 12);
                
                displayHotels(hotels);
            } else {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-light);">
                        <i class="fas fa-hotel" style="font-size: 50px; margin-bottom: 15px; opacity: 0.5;"></i>
                        <p>No hotels found in your area.</p>
                    </div>
                `;
            }
        })
        .catch(() => {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-light);">
                    <i class="fas fa-exclamation-circle" style="font-size: 50px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Unable to fetch hotels. Please check your connection.</p>
                </div>
            `;
        });
}

let allHotels = [];

function displayHotels(hotels) {
    allHotels = hotels;
    const container = document.getElementById('hotelsGridContainer');
    if (!container) return;
    
    hotels.sort((a, b) => a.distance - b.distance);
    
    container.innerHTML = hotels.map(hotel => `
        <div class="hotel-card">
            <div class="hotel-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <span style="font-size: 50px;">🏨</span>
            </div>
            <div class="hotel-content">
                <h4>${hotel.name}</h4>
                <div class="hotel-rating">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(hotel.rating))}
                    <span>${hotel.rating} (${Math.floor(Math.random() * 200 + 50)} reviews)</span>
                </div>
                <p class="hotel-location"><i class="fas fa-location-dot"></i> ${hotel.distance.toFixed(1)} km away</p>
                <div class="hotel-features">
                    <span><i class="fas fa-wifi"></i> Free WiFi</span>
                    <span><i class="fas fa-utensils"></i> Restaurant</span>
                    <span><i class="fas fa-parking"></i> Parking</span>
                </div>
                <div class="hotel-footer">
                    <span class="price">$${hotel.price}/night</span>
                    <button class="btn-small" onclick="bookPlace('${escapeHtmlAttribute(hotel.name)}', 'hotel', ${hotel.price}, ${hotel.lat}, ${hotel.lng})">Book Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

function calcDistanceFromLocation(item) {
    if (!hotelsLocation) return 0;
    const R = 6371;
    const lat1 = hotelsLocation.lat * Math.PI / 180;
    const lat2 = item.lat * Math.PI / 180;
    const dlat = (item.lat - hotelsLocation.lat) * Math.PI / 180;
    const dlng = (item.lng - hotelsLocation.lng) * Math.PI / 180;
    const a = Math.sin(dlat/2) * Math.sin(dlat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlng/2) * Math.sin(dlng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function filterHotels(query) {
    if (!query) {
        displayHotels(allHotels);
        return;
    }
    const filtered = allHotels.filter(h => h.name.toLowerCase().includes(query.toLowerCase()));
    displayHotels(filtered);
}

function sortHotels(sortBy) {
    let sorted = [...allHotels];
    switch(sortBy) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        default:
            sorted.sort((a, b) => a.distance - b.distance);
    }
    displayHotels(sorted);
}

// ===== ATTRACTIONS SECTION - LOCATION BASED =====
let attractionsLocation = null;

function initAttractionsSection() {
    const attractionsNav = document.querySelector('[data-section="attractions"]');
    if (attractionsNav) {
        attractionsNav.addEventListener('click', () => {
            if (!attractionsLocation) {
                getUserLocationForAttractions();
            }
        });
    }
}

function getUserLocationForAttractions() {
    const container = document.getElementById('attractionsGridContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-light);">
            <i class="fas fa-spinner fa-spin" style="font-size: 40px; margin-bottom: 15px; color: var(--primary-color);"></i>
            <p>Getting your location...</p>
        </div>
    `;
    
    if (!navigator.geolocation) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-light);">
                <i class="fas fa-exclamation-circle" style="font-size: 50px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>Geolocation not supported. Please enable location access.</p>
            </div>
        `;
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            attractionsLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            fetchAttractionsForSection();
        },
        () => {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-light);">
                    <i class="fas fa-exclamation-circle" style="font-size: 50px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Location access denied. Please enable location to see nearby attractions.</p>
                </div>
            `;
        }
    );
}

function fetchAttractionsForSection() {
    if (!attractionsLocation) return;
    
    const container = document.getElementById('attractionsGridContainer');
    if (!container) return;
    
    const bbox = getBBox(attractionsLocation.lat, attractionsLocation.lng, 0.1);
    const query = `[bbox:${bbox}];(node["tourism"~"museum|monument|castle|viewpoint|attraction"];way["tourism"~"museum|monument|castle|viewpoint|attraction"];);out center;`;
    
    fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query))
        .then(r => r.json())
        .then(data => {
            if (data.elements && data.elements.length > 0) {
                const attractions = data.elements.map(el => ({
                    name: el.tags?.name || 'Attraction',
                    lat: el.lat || el.center?.lat,
                    lng: el.lon || el.center?.lon,
                    rating: (4 + Math.random()).toFixed(1),
                    distance: calcAttractionDistance({ lat: el.lat || el.center?.lat, lng: el.lon || el.center?.lon })
                })).filter(a => a.lat && a.lng).slice(0, 12);
                
                displayAttractions(attractions);
            } else {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-light);">
                        <i class="fas fa-landmark" style="font-size: 50px; margin-bottom: 15px; opacity: 0.5;"></i>
                        <p>No attractions found in your area.</p>
                    </div>
                `;
            }
        })
        .catch(() => {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-light);">
                    <i class="fas fa-exclamation-circle" style="font-size: 50px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Unable to fetch attractions. Please check your connection.</p>
                </div>
            `;
        });
}

function calcAttractionDistance(item) {
    if (!attractionsLocation) return 0;
    const R = 6371;
    const lat1 = attractionsLocation.lat * Math.PI / 180;
    const lat2 = item.lat * Math.PI / 180;
    const dlat = (item.lat - attractionsLocation.lat) * Math.PI / 180;
    const dlng = (item.lng - attractionsLocation.lng) * Math.PI / 180;
    const a = Math.sin(dlat/2) * Math.sin(dlat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlng/2) * Math.sin(dlng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function displayAttractions(attractions) {
    const container = document.getElementById('attractionsGridContainer');
    if (!container) return;
    
    attractions.sort((a, b) => a.distance - b.distance);
    
    container.innerHTML = attractions.map(attraction => `
        <div class="attraction-card">
            <div class="attraction-image" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <span style="font-size: 50px;">🏛️</span>
            </div>
            <div class="attraction-content">
                <h4>${attraction.name}</h4>
                <div class="attraction-rating">
                    <i class="fas fa-star"></i> ${attraction.rating} (${Math.floor(Math.random() * 500 + 100)} reviews)
                </div>
                <p><i class="fas fa-location-dot"></i> ${attraction.distance.toFixed(1)} km away</p>
                <p>Discover this amazing attraction near you.</p>
                <div class="attraction-footer">
                    <button class="btn-small" onclick="openInMaps(${attraction.lat}, ${attraction.lng}, '${escapeHtmlAttribute(attraction.name)}')">Get Directions</button>
                    <button class="btn-small secondary" onclick="markAsVisited('${escapeHtmlAttribute(attraction.name)}', 'attraction', ${attraction.lat}, ${attraction.lng})">Mark Visited</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== BOOKINGS SECTION =====
function initBookingsSection() {
    renderBookings();
}

function renderBookings() {
    const container = document.getElementById('bookingsListContainer');
    if (!container) return;
    
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-light);">
                <i class="fas fa-ticket-alt" style="font-size: 50px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>No bookings yet. Start booking hotels, restaurants, and attractions!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = bookings.slice().reverse().map(booking => `
        <div class="booking-card" style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: var(--shadow);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div>
                    <h3 style="margin-bottom: 5px; color: var(--text-dark);">${booking.name}</h3>
                    <p style="color: var(--text-light); font-size: 14px;">
                        <span class="category-badge" style="margin-right: 10px;">${booking.type}</span>
                        ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
                <div style="text-align: right;">
                    <p style="font-size: 20px; font-weight: bold; color: var(--primary-color);">$${booking.price || booking.amount || 0}</p>
                    <p style="color: var(--text-light); font-size: 12px;">${booking.status || 'Confirmed'}</p>
                </div>
            </div>
            ${booking.location ? `<p style="color: var(--text-light); margin-bottom: 10px;"><i class="fas fa-map-marker-alt"></i> ${booking.location}</p>` : ''}
            <div style="display: flex; gap: 10px;">
                <button class="btn-small" onclick="viewBookingDetails('${booking.id}')">View Details</button>
                <button class="btn-small secondary" onclick="cancelBooking('${booking.id}')">Cancel</button>
            </div>
        </div>
    `).join('');
}

function bookPlace(name, type, price, lat, lng) {
    const booking = {
        id: Date.now(),
        name,
        type,
        price,
        lat,
        lng,
        bookingDate: new Date().toISOString(),
        status: 'Confirmed'
    };
    
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    showToast(`✓ ${name} booked successfully!`, 'success');
    updateHomeStats();
    renderBookings();
}

function markAsVisited(name, type, lat, lng) {
    const visited = {
        name,
        type,
        lat,
        lng,
        date: new Date().toISOString()
    };
    
    const visitedPlaces = JSON.parse(localStorage.getItem('visitedPlaces') || '[]');
    if (!visitedPlaces.some(p => p.name === name)) {
        visitedPlaces.push(visited);
        localStorage.setItem('visitedPlaces', JSON.stringify(visitedPlaces));
        showToast(`✓ ${name} marked as visited!`, 'success');
        updateHomeStats();
        loadRecentVisits();
    } else {
        showToast(`${name} already marked as visited`);
    }
}

function viewBookingDetails(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        showToast(`Booking: ${booking.name} - $${booking.price || booking.amount}`, 'info');
    }
}

function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const filtered = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem('bookings', JSON.stringify(filtered));
        showToast('Booking cancelled', 'info');
        renderBookings();
        updateHomeStats();
    }
}

// ===== SAFETY ALERTS - WEATHER & TRAFFIC =====
let safetyLocation = null;

function initSafetyAlerts() {
    const refreshBtn = document.getElementById('refreshSafetyLocation');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            safetyLocation = null;
            getUserLocationForSafety();
        });
    }

    // Auto-load when safety section is accessed
    const safetyNav = document.querySelector('[data-section="safety"]');
    if (safetyNav) {
        safetyNav.addEventListener('click', () => {
            if (!safetyLocation) {
                getUserLocationForSafety();
            } else {
                // Refresh data if location already exists
                fetchWeatherData();
                fetchTrafficData();
            }
        });
    }
}

function getUserLocationForSafety() {
    const statusIndicator = document.getElementById('safetyLocationStatus');
    if (!statusIndicator) return;

    statusIndicator.className = 'status-indicator';
    statusIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Getting your location...</span>';

    if (!navigator.geolocation) {
        updateSafetyLocationStatus('Geolocation not supported', 'error');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            safetyLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            updateSafetyLocationStatus(`Location: ${safetyLocation.lat.toFixed(4)}, ${safetyLocation.lng.toFixed(4)}`, 'success');
            fetchWeatherData();
            fetchTrafficData();
        },
        (error) => {
            console.log('Geolocation error:', error);
            updateSafetyLocationStatus('Location access denied', 'error');
        }
    );
}

function updateSafetyLocationStatus(message, status) {
    const statusIndicator = document.getElementById('safetyLocationStatus');
    if (!statusIndicator) return;

    statusIndicator.className = `status-indicator ${status}`;
    statusIndicator.innerHTML = status === 'success'
        ? `<i class="fas fa-map-marker-alt"></i><span>${message}</span>`
        : `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
}

function fetchWeatherData() {
    if (!safetyLocation) {
        document.getElementById('weatherContainer').innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-light);">
                <i class="fas fa-exclamation-circle" style="font-size: 50px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>Enable location access to see weather data.</p>
            </div>
        `;
        return;
    }

    const container = document.getElementById('weatherContainer');
    if (!container) return;

    // Using OpenWeatherMap API (free tier)
    // Note: In production, you'd need an API key. For demo, using a public endpoint or fallback
    const apiKey = 'demo'; // Replace with actual API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${safetyLocation.lat}&lon=${safetyLocation.lng}&units=metric&appid=${apiKey}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather API error');
            }
            return response.json();
        })
        .then(data => {
            displayWeatherData(data);
            generateWeatherAlerts(data);
        })
        .catch(error => {
            console.log('Weather API error, using fallback:', error);
            // Fallback: Generate sample weather data
            const fallbackData = generateFallbackWeather();
            displayWeatherData(fallbackData);
            generateWeatherAlerts(fallbackData);
        });
}

function generateFallbackWeather() {
    // Generate realistic weather data based on location
    const conditions = ['Clear', 'Clouds', 'Rain', 'Thunderstorm', 'Snow', 'Mist'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const temp = Math.round(15 + Math.random() * 25); // 15-40°C
    
    return {
        name: 'Your Location',
        weather: [{ main: condition, description: condition.toLowerCase(), icon: '01d' }],
        main: {
            temp: temp,
            feels_like: temp - 2,
            humidity: Math.round(40 + Math.random() * 40),
            pressure: Math.round(1000 + Math.random() * 50)
        },
        wind: {
            speed: Math.round(Math.random() * 20),
            deg: Math.round(Math.random() * 360)
        },
        visibility: Math.round(8000 + Math.random() * 2000)
    };
}

function displayWeatherData(data) {
    const container = document.getElementById('weatherContainer');
    if (!container) return;

    const weather = data.weather[0];
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = data.wind?.speed || 0;
    const condition = weather.main;
    const description = weather.description;

    const weatherIcons = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️',
        'Drizzle': '🌦️'
    };

    const icon = weatherIcons[condition] || '🌤️';

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 10px; color: white;">
                <div style="font-size: 60px; margin-bottom: 10px;">${icon}</div>
                <div style="font-size: 48px; font-weight: bold; margin-bottom: 5px;">${temp}°C</div>
                <div style="font-size: 18px; opacity: 0.9;">${description}</div>
                <div style="font-size: 14px; margin-top: 10px; opacity: 0.8;">Feels like ${feelsLike}°C</div>
            </div>
            <div style="padding: 20px;">
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--text-light);"><i class="fas fa-tint"></i> Humidity</span>
                        <span style="font-weight: 600;">${humidity}%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--text-light);"><i class="fas fa-wind"></i> Wind Speed</span>
                        <span style="font-weight: 600;">${windSpeed} km/h</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--text-light);"><i class="fas fa-compress-arrows-alt"></i> Pressure</span>
                        <span style="font-weight: 600;">${data.main.pressure} hPa</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-light);"><i class="fas fa-eye"></i> Visibility</span>
                        <span style="font-weight: 600;">${(data.visibility / 1000).toFixed(1)} km</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateWeatherAlerts(data) {
    const alerts = [];
    const condition = data.weather[0].main;
    const temp = data.main.temp;
    const windSpeed = data.wind?.speed || 0;
    const visibility = data.visibility / 1000;

    // Generate alerts based on conditions
    if (condition === 'Thunderstorm' || condition === 'Rain') {
        alerts.push({
            type: 'warning',
            icon: 'exclamation-triangle',
            title: 'Weather Alert',
            message: `${condition} conditions detected. Drive carefully and avoid unnecessary travel.`,
            time: 'Just now'
        });
    }

    if (windSpeed > 30) {
        alerts.push({
            type: 'warning',
            icon: 'wind',
            title: 'High Wind Warning',
            message: `Strong winds (${windSpeed} km/h) detected. Secure outdoor items and drive with caution.`,
            time: 'Just now'
        });
    }

    if (temp > 35) {
        alerts.push({
            type: 'warning',
            icon: 'sun',
            title: 'Heat Advisory',
            message: `High temperature (${temp}°C) expected. Stay hydrated and avoid prolonged sun exposure.`,
            time: 'Just now'
        });
    }

    if (temp < 5) {
        alerts.push({
            type: 'warning',
            icon: 'snowflake',
            title: 'Cold Weather Alert',
            message: `Low temperature (${temp}°C) expected. Dress warmly and watch for icy conditions.`,
            time: 'Just now'
        });
    }

    if (visibility < 1) {
        alerts.push({
            type: 'danger',
            icon: 'ban',
            title: 'Low Visibility Warning',
            message: `Poor visibility (${visibility.toFixed(1)} km). Drive with extreme caution.`,
            time: 'Just now'
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            type: 'info',
            icon: 'info-circle',
            title: 'Weather Conditions Normal',
            message: 'Current weather conditions are safe for travel. Enjoy your journey!',
            time: 'Just now'
        });
    }

    displaySafetyAlerts(alerts);
}

function fetchTrafficData() {
    if (!safetyLocation) {
        document.getElementById('trafficContainer').innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-light);">
                <i class="fas fa-exclamation-circle" style="font-size: 50px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>Enable location access to see traffic data.</p>
            </div>
        `;
        return;
    }

    const container = document.getElementById('trafficContainer');
    if (!container) return;

    // Simulate traffic data (in production, use Google Maps Traffic API or similar)
    // For demo purposes, generating realistic traffic conditions
    setTimeout(() => {
        const trafficConditions = generateTrafficData();
        displayTrafficData(trafficConditions);
    }, 1000);
}

function generateTrafficData() {
    const conditions = ['Light', 'Moderate', 'Heavy', 'Severe'];
    const roads = [
        { name: 'Main Highway', distance: '2.5 km', condition: conditions[Math.floor(Math.random() * conditions.length)] },
        { name: 'City Center', distance: '5.0 km', condition: conditions[Math.floor(Math.random() * conditions.length)] },
        { name: 'Airport Route', distance: '12.0 km', condition: conditions[Math.floor(Math.random() * conditions.length)] },
        { name: 'Downtown Area', distance: '3.2 km', condition: conditions[Math.floor(Math.random() * conditions.length)] }
    ];

    return roads;
}

function displayTrafficData(roads) {
    const container = document.getElementById('trafficContainer');
    if (!container) return;

    const getTrafficColor = (condition) => {
        switch(condition) {
            case 'Light': return 'var(--success-color)';
            case 'Moderate': return 'var(--warning-color)';
            case 'Heavy': return 'var(--accent-color)';
            case 'Severe': return 'var(--danger-color)';
            default: return 'var(--text-light)';
        }
    };

    const getTrafficIcon = (condition) => {
        switch(condition) {
            case 'Light': return 'fa-check-circle';
            case 'Moderate': return 'fa-exclamation-circle';
            case 'Heavy': return 'fa-exclamation-triangle';
            case 'Severe': return 'fa-ban';
            default: return 'fa-info-circle';
        }
    };

    container.innerHTML = roads.map(road => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 10px; background: var(--light-bg); border-radius: 8px; border-left: 4px solid ${getTrafficColor(road.condition)};">
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 5px; color: var(--text-dark);">${road.name}</div>
                <div style="font-size: 13px; color: var(--text-light);"><i class="fas fa-map-marker-alt"></i> ${road.distance} away</div>
            </div>
            <div style="text-align: right;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas ${getTrafficIcon(road.condition)}" style="color: ${getTrafficColor(road.condition)};"></i>
                    <span style="font-weight: 600; color: ${getTrafficColor(road.condition)};">${road.condition}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Generate traffic alerts
    const trafficAlerts = [];
    roads.forEach(road => {
        if (road.condition === 'Heavy' || road.condition === 'Severe') {
            trafficAlerts.push({
                type: road.condition === 'Severe' ? 'danger' : 'warning',
                icon: 'traffic-light',
                title: `${road.condition} Traffic on ${road.name}`,
                message: `Expect delays on ${road.name} (${road.distance} away). Consider alternate routes.`,
                time: 'Just now'
            });
        }
    });

    if (trafficAlerts.length > 0) {
        displaySafetyAlerts(trafficAlerts, true);
    }
}

function displaySafetyAlerts(alerts, append = false) {
    const container = document.getElementById('safetyAlertsList');
    if (!container) return;

    if (!append) {
        container.innerHTML = '';
    }

    const alertTypes = {
        'warning': 'alert-warning',
        'danger': 'alert-danger',
        'info': 'alert-info'
    };

    alerts.forEach(alert => {
        const alertCard = document.createElement('div');
        alertCard.className = `alert-card ${alertTypes[alert.type] || 'alert-info'}`;
        alertCard.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-${alert.icon}"></i>
            </div>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.message}</p>
                <small>Updated ${alert.time}</small>
            </div>
        `;
        container.appendChild(alertCard);
    });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initBudgetTracker();
    initTripPlanner();
    initTranslator();
    initSearch();
    initSafetyAlerts();
});

// ===== BUDGET TRACKER =====
let userBudget = null;
let expenses = [];

function initBudgetTracker() {
    const expenseForm = document.getElementById('expenseForm');
    if (!expenseForm) return;

    // Load budget and expenses from localStorage
    loadBudgetData();
    updateBudgetDisplay();

    // Budget input handler
    const budgetInput = document.getElementById('budgetInput');
    if (budgetInput) {
        budgetInput.addEventListener('change', (e) => {
            const budget = parseFloat(e.target.value);
            if (budget > 0) {
                userBudget = budget;
                localStorage.setItem('userBudget', budget.toString());
                updateBudgetDisplay();
                showToast(`✓ Budget set to $${budget.toLocaleString()}`);
                // Update trip planner with new budget
                if (userLocation) {
                    filterPlacesByBudget();
                }
            }
        });
    }

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = expenseForm.querySelectorAll('input, select');
        const description = inputs[0].value;
        const amount = parseFloat(inputs[1].value);
        const category = inputs[2].value;

        if (description && amount && category) {
            const expense = {
                id: Date.now(),
                description,
                amount,
                category,
                date: new Date().toLocaleDateString()
            };
            expenses.push(expense);
            saveExpenses();
            updateBudgetDisplay();
            showToast(`✓ Expense added: ${description} - $${amount}`);
            expenseForm.reset();
        }
    });

    // Load expenses table
    renderExpensesTable();
}

function loadBudgetData() {
    const savedBudget = localStorage.getItem('userBudget');
    userBudget = savedBudget ? parseFloat(savedBudget) : 5000; // Default $5000
    
    const savedExpenses = localStorage.getItem('expenses');
    expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
}

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function updateBudgetDisplay() {
    const totalBudgetEl = document.getElementById('totalBudget');
    const spentEl = document.getElementById('totalSpent');
    const remainingEl = document.getElementById('remainingBudget');

    if (totalBudgetEl) totalBudgetEl.textContent = `$${userBudget.toLocaleString()}`;
    
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    if (spentEl) spentEl.textContent = `$${totalSpent.toLocaleString()}`;
    
    const remaining = userBudget - totalSpent;
    if (remainingEl) {
        remainingEl.textContent = `$${remaining.toLocaleString()}`;
        remainingEl.className = remaining < 0 ? 'budget-amount remaining negative' : 'budget-amount remaining';
    }
    
    // Update expenses table
    renderExpensesTable();
}

function renderExpensesTable() {
    const tbody = document.getElementById('expensesTableBody');
    if (!tbody) return;

    if (expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-light);">No expenses yet. Add your first expense above!</td></tr>';
        return;
    }

    tbody.innerHTML = expenses.slice().reverse().map(exp => `
        <tr>
            <td>${exp.description}</td>
            <td><span class="category-badge">${exp.category}</span></td>
            <td>$${exp.amount.toLocaleString()}</td>
            <td>${exp.date}</td>
        </tr>
    `).join('');
}

function getRemainingBudget() {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return userBudget - totalSpent;
}

// ===== TRIP PLANNER - AI LOCATION-BASED =====
let plannerMap = null;
let userLocation = null;

function initTripPlanner() {
    const plannerSection = document.getElementById('plannerSection');
    if (!plannerSection) return;

    // Auto-load trip planner when page loads (already in DOMContentLoaded, so call directly)
    setTimeout(getUserLocation, 500);

    // Refresh button
    const refreshBtn = document.getElementById('refreshLocation');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', getUserLocation);
    }
}

function getUserLocation() {
    const statusIndicator = document.getElementById('locationStatus');
    if (!statusIndicator) return;

    statusIndicator.className = 'status-indicator';
    statusIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Getting your location...</span>';

    if (!navigator.geolocation) {
        updateLocationStatus('Geolocation not supported', 'error');
        loadDefaultData();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            updateLocationStatus(`Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`, 'success');
            initPlannerMap();
            fetchAllPlaces();
        },
        (error) => {
            console.log('Geolocation error:', error);
            updateLocationStatus('Location access denied', 'error');
            loadDefaultData();
            // Still try to fetch with a default location (can be removed if you want strict location requirement)
            // For now, we'll just show the no results message
        }
    );
}

function updateLocationStatus(message, status) {
    const statusIndicator = document.getElementById('locationStatus');
    const refreshBtn = document.getElementById('refreshLocation');
    if (!statusIndicator) return;

    statusIndicator.className = `status-indicator ${status}`;
    statusIndicator.innerHTML = status === 'success'
        ? `<i class="fas fa-map-marker-alt"></i><span>${message}</span>`
        : `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;

    if (refreshBtn) {
        refreshBtn.style.display = status === 'error' ? 'block' : 'none';
    }
}

function initPlannerMap() {
    if (plannerMap) return;
    if (!userLocation) return;

    const mapElement = document.getElementById('plannerMap');
    if (!mapElement) return;

    plannerMap = L.map('plannerMap').setView([userLocation.lat, userLocation.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(plannerMap);

    // User location marker
    L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 8,
        fillColor: '#2196F3',
        color: '#1565C0',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).bindPopup('You are here').addTo(plannerMap);
}

function fetchAllPlaces() {
    if (!userLocation) {
        loadDefaultData();
        return;
    }

    fetchHotels();
    fetchRestaurants();
    fetchAttractions();
    fetchActivities();
}

function fetchHotels() {
    if (!userLocation) {
        showNoResults('hotelsContainer', 'Enable location access to find nearby hotels.');
        return;
    }

    const bbox = getBBox(userLocation.lat, userLocation.lng, 0.05);
    const query = `[bbox:${bbox}];(node["tourism"="hotel"];way["tourism"="hotel"];);out center;`;

    fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query))
        .then(r => r.json())
        .then(data => {
            if (data.elements && data.elements.length > 0) {
                const items = data.elements.map(el => ({
                    name: el.tags?.name || 'Hotel',
                    lat: el.lat || el.center?.lat,
                    lng: el.lon || el.center?.lon,
                    type: 'hotel',
                    icon: '🏨',
                    rating: (4 + Math.random()).toFixed(1)
                })).filter(item => item.lat && item.lng).slice(0, 12);

                if (items.length > 0) {
                    allPlacesData.hotels = items;
                    displayItems(items, 'hotelsContainer', '#667eea', 'hotel');
                } else {
                    showNoResults('hotelsContainer', 'No hotels found in your area. Try expanding your search radius.');
                }
            } else {
                showNoResults('hotelsContainer', 'No hotels found in your area. Try expanding your search radius.');
            }
        })
        .catch(() => {
            showNoResults('hotelsContainer', 'Unable to fetch hotels. Please check your connection.');
        });
}

function fetchRestaurants() {
    if (!userLocation) {
        showNoResults('restaurantsContainer', 'Enable location access to find nearby restaurants.');
        return;
    }

    const bbox = getBBox(userLocation.lat, userLocation.lng, 0.05);
    const query = `[bbox:${bbox}];(node["amenity"="restaurant"];way["amenity"="restaurant"];);out center;`;

    fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query))
        .then(r => r.json())
        .then(data => {
            if (data.elements && data.elements.length > 0) {
                const items = data.elements.map(el => ({
                    name: el.tags?.name || 'Restaurant',
                    lat: el.lat || el.center?.lat,
                    lng: el.lon || el.center?.lon,
                    type: 'restaurant',
                    icon: '🍽️',
                    rating: (4 + Math.random()).toFixed(1)
                })).filter(item => item.lat && item.lng).slice(0, 12);

                if (items.length > 0) {
                    allPlacesData.restaurants = items;
                    displayItems(items, 'restaurantsContainer', '#f093fb', 'restaurant');
                } else {
                    showNoResults('restaurantsContainer', 'No restaurants found in your area. Try expanding your search radius.');
                }
            } else {
                showNoResults('restaurantsContainer', 'No restaurants found in your area. Try expanding your search radius.');
            }
        })
        .catch(() => {
            showNoResults('restaurantsContainer', 'Unable to fetch restaurants. Please check your connection.');
        });
}

function fetchAttractions() {
    if (!userLocation) {
        showNoResults('attractionsContainer', 'Enable location access to find nearby attractions.');
        return;
    }

    const bbox = getBBox(userLocation.lat, userLocation.lng, 0.05);
    const query = `[bbox:${bbox}];(node["tourism"~"museum|monument|castle|viewpoint"];way["tourism"~"museum|monument|castle|viewpoint"];);out center;`;

    fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query))
        .then(r => r.json())
        .then(data => {
            if (data.elements && data.elements.length > 0) {
                const items = data.elements.map(el => ({
                    name: el.tags?.name || 'Attraction',
                    lat: el.lat || el.center?.lat,
                    lng: el.lon || el.center?.lon,
                    type: 'attraction',
                    icon: '🏛️',
                    rating: (4 + Math.random()).toFixed(1)
                })).filter(item => item.lat && item.lng).slice(0, 12);

                if (items.length > 0) {
                    allPlacesData.attractions = items;
                    displayItems(items, 'attractionsContainer', '#4facfe', 'attraction');
                } else {
                    showNoResults('attractionsContainer', 'No attractions found in your area. Try expanding your search radius.');
                }
            } else {
                showNoResults('attractionsContainer', 'No attractions found in your area. Try expanding your search radius.');
            }
        })
        .catch(() => {
            showNoResults('attractionsContainer', 'Unable to fetch attractions. Please check your connection.');
        });
}

function fetchActivities() {
    if (!userLocation) {
        showNoResults('activitiesContainer', 'Enable location access to find nearby activities.');
        return;
    }

    const bbox = getBBox(userLocation.lat, userLocation.lng, 0.05);
    const query = `[bbox:${bbox}];(node["leisure"~"park|sports_centre|swimming_pool"];way["leisure"~"park|sports_centre|swimming_pool"];);out center;`;

    fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query))
        .then(r => r.json())
        .then(data => {
            if (data.elements && data.elements.length > 0) {
                const items = data.elements.map(el => ({
                    name: el.tags?.name || 'Activity',
                    lat: el.lat || el.center?.lat,
                    lng: el.lon || el.center?.lon,
                    type: 'activity',
                    icon: '🌳',
                    rating: (4 + Math.random()).toFixed(1)
                })).filter(item => item.lat && item.lng).slice(0, 12);

                if (items.length > 0) {
                    allPlacesData.activities = items;
                    displayItems(items, 'activitiesContainer', '#43e97b', 'activity');
                } else {
                    showNoResults('activitiesContainer', 'No activities found in your area. Try expanding your search radius.');
                }
            } else {
                showNoResults('activitiesContainer', 'No activities found in your area. Try expanding your search radius.');
            }
        })
        .catch(() => {
            showNoResults('activitiesContainer', 'Unable to fetch activities. Please check your connection.');
        });
}

function displayItems(items, containerId, color, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Filter by budget if budget is set
    let filteredItems = items;
    if (userBudget) {
        filteredItems = filterItemsByBudget(items, type);
    }

    if (filteredItems.length === 0) {
        showNoResults(containerId, `No ${type}s found within your budget. Try adjusting your budget in Budget Tracker.`);
        return;
    }

    filteredItems.sort((a, b) => calcDistance(a) - calcDistance(b));

    container.innerHTML = filteredItems.map(item => {
        const distance = calcDistance(item);
        const estimatedCost = estimateCost(item, type);
        const costDisplay = userBudget ? `<div class="trip-card-info" style="color: var(--primary-color); font-weight: 600;">
            <i class="fas fa-dollar-sign"></i>
            <span>Est. $${estimatedCost}</span>
        </div>` : '';
        
        return `
            <div class="trip-card">
                <div class="trip-card-image ${type}" style="background: linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%);">
                    <span style="font-size: 40px;">${item.icon}</span>
                </div>
                <div class="trip-card-content">
                    <div class="trip-card-title">${item.name}</div>
                    <div class="trip-card-rating">
                        <i class="fas fa-star"></i>
                        <span>${item.rating}</span>
                    </div>
                    <div class="trip-card-info">
                        <i class="fas fa-map-marker-alt"></i>
                        <span class="trip-card-distance">${distance.toFixed(1)} km away</span>
                    </div>
                    ${costDisplay}
                    <div class="trip-card-footer">
                        <button class="trip-card-footer btn-primary" onclick="openInMaps(${item.lat}, ${item.lng}, '${escapeHtmlAttribute(item.name)}')">
                            <i class="fas fa-directions"></i> Directions
                        </button>
                        <button class="trip-card-footer btn-secondary" onclick="savePlace('${escapeHtmlAttribute(item.name)}', '${escapeHtmlAttribute(type)}', ${estimatedCost})">
                            <i class="fas fa-bookmark"></i> Save
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add markers to map
    if (plannerMap) {
        filteredItems.forEach(item => {
            const markerColor = { hotel: '#667eea', restaurant: '#f5576c', attraction: '#00f2fe', activity: '#43e97b' }[type];
            L.circleMarker([item.lat, item.lng], {
                radius: 6,
                fillColor: markerColor,
                color: adjustColor(markerColor, -30),
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup(`<strong>${item.name}</strong><br>${calcDistance(item).toFixed(1)} km away<br>Est. $${estimateCost(item, type)}`).addTo(plannerMap);
        });
    }
}

function estimateCost(item, type) {
    // Estimate costs based on type and rating
    const baseCosts = {
        hotel: 80,      // per night
        restaurant: 25, // per meal
        attraction: 15, // per visit
        activity: 30    // per activity
    };
    
    const ratingMultiplier = parseFloat(item.rating) / 4.0; // Higher rating = higher cost
    const baseCost = baseCosts[type] || 20;
    
    return Math.round(baseCost * ratingMultiplier);
}

function filterItemsByBudget(items, type) {
    if (!userBudget) return items;
    
    const remainingBudget = getRemainingBudget();
    if (remainingBudget <= 0) return [];
    
    // Filter items that fit within remaining budget
    return items.filter(item => {
        const cost = estimateCost(item, type);
        return cost <= remainingBudget;
    });
}

function filterPlacesByBudget() {
    // Re-fetch and display places filtered by budget
    if (userLocation) {
        fetchAllPlaces();
    }
}

function loadDefaultData() {
    // Show no results message instead of static data
    showNoResults('hotelsContainer', 'No hotels found. Please enable location access.');
    showNoResults('restaurantsContainer', 'No restaurants found. Please enable location access.');
    showNoResults('attractionsContainer', 'No attractions found. Please enable location access.');
    showNoResults('activitiesContainer', 'No activities found. Please enable location access.');
}

function showNoResults(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="no-results">
            <i class="fas fa-map-marker-alt"></i>
            <p>${message}</p>
        </div>
    `;
}

function calcDistance(item) {
    if (!userLocation) return 0;
    const R = 6371; // Earth radius in km
    const lat1 = userLocation.lat * Math.PI / 180;
    const lat2 = item.lat * Math.PI / 180;
    const dlat = (item.lat - userLocation.lat) * Math.PI / 180;
    const dlng = (item.lng - userLocation.lng) * Math.PI / 180;
    const a = Math.sin(dlat/2) * Math.sin(dlat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlng/2) * Math.sin(dlng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function getBBox(lat, lng, delta) {
    return `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
}

function adjustColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
        .toString(16).slice(1);
}

function escapeHtmlAttribute(str) {
    if (typeof str !== 'string') return str;
    // Escape single quotes for use in onclick attribute (which uses single quotes)
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function openInMaps(lat, lng, name) {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    showToast(`Opening ${name} in Maps...`);
}

function savePlace(name, type, estimatedCost = 0) {
    const saved = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
    if (!saved.some(p => p.name === name)) {
        saved.push({ name, type, date: new Date().toLocaleString(), estimatedCost });
        localStorage.setItem('savedPlaces', JSON.stringify(saved));
        showToast(`✓ ${name} saved to your list!`);
    } else {
        showToast(`${name} already in your saved places`);
    }
}

// ===== TRANSLATOR =====
let currentTranslation = '';
let currentSourceText = '';
let speechSynthesis = null;

function initTranslator() {
    const translateBtn = document.getElementById('translateBtn');
    const textToTranslate = document.getElementById('textToTranslate');
    const translatedText = document.getElementById('translatedText');
    const copyBtn = document.getElementById('copyBtn');
    const speakBtn = document.getElementById('speakBtn');
    const speakSourceBtn = document.getElementById('speakSourceBtn');

    if (!translateBtn) return;

    // Check for speech synthesis support
    if ('speechSynthesis' in window) {
        speechSynthesis = window.speechSynthesis;
    }

    // Language code mapping for LibreTranslate (some languages may need different codes)
    const langCodeMap = {
        'auto': 'auto',
        'en': 'en', 'es': 'es', 'fr': 'fr', 'de': 'de', 'it': 'it', 'pt': 'pt',
        'ru': 'ru', 'ja': 'ja', 'ko': 'ko', 'zh': 'zh', 'hi': 'hi', 'ar': 'ar',
        'tr': 'tr', 'pl': 'pl', 'nl': 'nl', 'sv': 'sv', 'da': 'da', 'no': 'no',
        'fi': 'fi', 'el': 'el', 'cs': 'cs', 'hu': 'hu', 'ro': 'ro', 'bg': 'bg',
        'hr': 'hr', 'sk': 'sk', 'sl': 'sl', 'et': 'et', 'lv': 'lv', 'lt': 'lt',
        'th': 'th', 'vi': 'vi', 'id': 'id', 'ms': 'ms', 'tl': 'tl', 'he': 'he',
        'fa': 'fa', 'ur': 'ur', 'bn': 'bn', 'ta': 'ta', 'te': 'te', 'mr': 'mr',
        'gu': 'gu', 'kn': 'kn', 'ml': 'ml', 'pa': 'pa', 'sw': 'sw', 'af': 'af',
        'sq': 'sq', 'az': 'az', 'eu': 'eu', 'be': 'be', 'ca': 'ca', 'cy': 'cy',
        'ga': 'ga', 'is': 'is', 'mk': 'mk', 'mt': 'mt', 'sr': 'sr', 'uk': 'uk'
    };

    // Speech synthesis language mapping
    const speechLangMap = {
        'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT',
        'pt': 'pt-BR', 'ru': 'ru-RU', 'ja': 'ja-JP', 'ko': 'ko-KR', 'zh': 'zh-CN',
        'hi': 'hi-IN', 'ar': 'ar-SA', 'tr': 'tr-TR', 'pl': 'pl-PL', 'nl': 'nl-NL',
        'sv': 'sv-SE', 'da': 'da-DK', 'no': 'nb-NO', 'fi': 'fi-FI', 'el': 'el-GR',
        'cs': 'cs-CZ', 'hu': 'hu-HU', 'ro': 'ro-RO', 'bg': 'bg-BG', 'hr': 'hr-HR',
        'sk': 'sk-SK', 'sl': 'sl-SI', 'et': 'et-EE', 'lv': 'lv-LV', 'lt': 'lt-LT',
        'th': 'th-TH', 'vi': 'vi-VN', 'id': 'id-ID', 'ms': 'ms-MY', 'he': 'he-IL',
        'uk': 'uk-UA'
    };

    translateBtn.addEventListener('click', async () => {
        const text = (textToTranslate.value || '').trim();
        if (!text) {
            showToast('Please enter text to translate', 'warning');
            return;
        }

        const fromLangEl = document.getElementById('fromLang');
        const toLangEl = document.getElementById('toLang');
        let source = fromLangEl ? fromLangEl.value : 'en';
        const target = toLangEl ? toLangEl.value : 'hi';

        // Handle auto-detect
        if (source === 'auto') {
            source = 'en'; // Default to English for auto-detect
        }

        const sourceCode = langCodeMap[source] || source;
        const targetCode = langCodeMap[target] || target;

        translateBtn.disabled = true;
        translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';

        currentSourceText = text;

        // Try multiple translation APIs for better coverage
        try {
            // Try LibreTranslate first
            let translated = false;
            
            try {
                const resp = await fetch('https://libretranslate.de/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        q: text, 
                        source: sourceCode === 'auto' ? 'auto' : sourceCode, 
                        target: targetCode, 
                        format: 'text' 
                    })
                });

                if (resp.ok) {
                    const data = await resp.json();
                    if (data && data.translatedText) {
                        currentTranslation = data.translatedText;
                        translatedText.textContent = currentTranslation;
                        showToast('✓ Text translated!');
                        translated = true;
                    }
                }
            } catch (e) {
                console.log('LibreTranslate failed, trying alternative...');
            }

            // Fallback to MyMemory API if LibreTranslate fails
            if (!translated) {
                try {
                    const resp = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceCode}|${targetCode}`);
                    const data = await resp.json();
                    if (data && data.responseData && data.responseData.translatedText) {
                        currentTranslation = data.responseData.translatedText;
                        translatedText.textContent = currentTranslation;
                        showToast('✓ Text translated!');
                        translated = true;
                    }
                } catch (e) {
                    console.log('MyMemory API failed');
                }
            }

            // Final fallback: show message if all APIs fail
            if (!translated) {
                translatedText.textContent = 'Translation service unavailable. Please check your internet connection or try again later.';
                showToast('Translation service unavailable', 'warning');
            }
        } catch (err) {
            translatedText.textContent = 'Error: Unable to translate. Please try again.';
            showToast('Translation error occurred', 'error');
        } finally {
            translateBtn.disabled = false;
            translateBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Translate';
        }
    });

    // Copy button
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = translatedText.textContent;
            if (text && text !== 'Translation will appear here...' && !text.includes('Error:') && !text.includes('unavailable')) {
                navigator.clipboard.writeText(text);
                showToast('✓ Translation copied to clipboard!');
            }
        });
    }

    // Speak translated text
    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            const text = translatedText.textContent;
            if (text && text !== 'Translation will appear here...' && !text.includes('Error:') && !text.includes('unavailable')) {
                speakText(text, getTargetLanguage());
            } else {
                showToast('No translation available to speak', 'warning');
            }
        });
    }

    // Speak source text
    if (speakSourceBtn) {
        speakSourceBtn.addEventListener('click', () => {
            const text = textToTranslate.value.trim();
            if (text) {
                speakText(text, getSourceLanguage());
            } else {
                showToast('No text to speak', 'warning');
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
            
            // Also swap the texts if they exist
            if (currentTranslation && currentSourceText) {
                const tempText = textToTranslate.value;
                textToTranslate.value = currentTranslation;
                translatedText.textContent = currentSourceText;
                currentSourceText = tempText;
                currentTranslation = translatedText.textContent;
            }
            
            showToast('✓ Languages swapped!');
        });
    }

    function getSourceLanguage() {
        const fromLang = document.getElementById('fromLang');
        const lang = fromLang ? fromLang.value : 'en';
        return speechLangMap[lang] || 'en-US';
    }

    function getTargetLanguage() {
        const toLang = document.getElementById('toLang');
        const lang = toLang ? toLang.value : 'hi';
        return speechLangMap[lang] || 'en-US';
    }

    function speakText(text, lang) {
        if (!speechSynthesis) {
            showToast('Text-to-speech not supported in your browser', 'warning');
            return;
        }

        // Stop any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
            showToast('🔊 Speaking...', 'info');
        };

        utterance.onend = () => {
            showToast('✓ Finished speaking', 'success');
        };

        utterance.onerror = (e) => {
            showToast('Error speaking text', 'error');
            console.error('Speech error:', e);
        };

        speechSynthesis.speak(utterance);
    }
}

