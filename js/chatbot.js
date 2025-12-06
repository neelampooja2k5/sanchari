// Chatbot Script - Sanchari AI Assistant
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const chatMessages = document.getElementById('chatMessages');

// Sample responses for Sanchari chatbot
const sanchariResponses = {
    greetings: [
        'Hello! I\'m Sanchari, your travel companion. How can I assist you today?',
        'Hi there! Ready to explore? What would you like to know about travel?',
        'Welcome! I\'m here to help with your travel plans. What\'s on your mind?'
    ],
    destination: [
        'Popular destinations include Taj Mahal in India, Maldives for beaches, Swiss Alps for mountains, and Paris for culture.',
        'Where are you thinking of traveling? I can suggest attractions, hotels, and activities based on your interests!',
        'Some amazing destinations are Thailand, Japan, Egypt, and Iceland. What type of travel interests you most?'
    ],
    hotels: [
        'Looking for hotels? I can help you find luxury resorts, budget-friendly stays, or boutique hotels.',
        'Our platform features thousands of hotels. What\'s your budget range and preferred location?',
        'From luxury 5-star resorts to cozy budget stays, we have options for everyone!'
    ],
    attractions: [
        'Every destination has unique attractions! Share which place you\'re visiting and I\'ll suggest nearby spots.',
        'From historical monuments to natural wonders, beaches to mountains - what excites you?',
        'I can help you discover must-see attractions, hidden gems, and local experiences!'
    ],
    budget: [
        'Budget travel is possible! Look for local attractions, eat at local restaurants, and use public transport.',
        'Set a daily budget and I\'ll help you plan accordingly. What\'s your travel duration?',
        'Mix of free activities, affordable hotels, and street food can make great budget trips!'
    ],
    weather: [
        'Weather matters for travel planning! Which destination are you interested in?',
        'Best time to visit depends on your destination. Tell me where you\'re going!',
        'I can help you choose the best season for your chosen destination.'
    ],
    offline: [
        'Our offline map feature lets you download maps for any destination before you travel.',
        'You can access maps, nearby attractions, and directions without internet in offline mode!',
        'Download maps, hotel info, and tourist spots to your device for offline access.'
    ],
    booking: [
        'Ready to book? You can reserve hotels, attractions tickets, and make travel arrangements right here.',
        'Our booking system is secure and easy. Select your destination and dates to begin!',
        'I can walk you through the booking process step by step.'
    ]
};

// Keyword matching function
function findResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.match(/hello|hi|hey|greet/)) return sanchariResponses.greetings[Math.floor(Math.random() * sanchariResponses.greetings.length)];
    if (msg.match(/destination|place|visit|where|go/)) return sanchariResponses.destination[Math.floor(Math.random() * sanchariResponses.destination.length)];
    if (msg.match(/hotel|stay|accommodation|room|lodge/)) return sanchariResponses.hotels[Math.floor(Math.random() * sanchariResponses.hotels.length)];
    if (msg.match(/attract|sight|see|landmark|monument/)) return sanchariResponses.attractions[Math.floor(Math.random() * sanchariResponses.attractions.length)];
    if (msg.match(/budget|cheap|afford|cost|price|save|money/)) return sanchariResponses.budget[Math.floor(Math.random() * sanchariResponses.budget.length)];
    if (msg.match(/weather|climate|season|temperature|rain|snow/)) return sanchariResponses.weather[Math.floor(Math.random() * sanchariResponses.weather.length)];
    if (msg.match(/offline|map|download|internet|connection/)) return sanchariResponses.offline[Math.floor(Math.random() * sanchariResponses.offline.length)];
    if (msg.match(/book|reserve|ticket|purchase|order/)) return sanchariResponses.booking[Math.floor(Math.random() * sanchariResponses.booking.length)];
    if (msg.match(/thank|thanks|thank you|appreciated/)) return 'You\'re welcome! Anything else I can help you with?';
    if (msg.match(/how are you|doing|fine/)) return 'I\'m doing great! Ready to help you plan an amazing trip!';
    
    // Default responses
    return 'That\'s interesting! Can you tell me more about what you\'re looking for? (Try asking about destinations, hotels, attractions, budget, weather, offline features, or bookings)';
}

// Send message function
function sendMessage() {
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user-message');
    
    // Clear input
    chatInput.value = '';
    
    // Simulate typing delay
    setTimeout(() => {
        const response = findResponse(message);
        addMessage(response, 'bot-message');
    }, 500);
}

// Add message to chat
function addMessage(message, className) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + className;
    
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = message;
    
    messageDiv.appendChild(messageParagraph);
    chatMessages.appendChild(messageDiv);
    
    // Auto scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event listeners
sendChatBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Quick suggestion buttons (optional enhancement)
const quickQuestions = [
    'Show me popular destinations',
    'Find budget hotels',
    'Nearby attractions',
    'Best time to visit',
    'Offline maps'
];

// Function to add quick suggestions (can be added to UI)
function addQuickSuggestions() {
    // This would add quick suggestion buttons if needed
    console.log('Quick suggestions available:', quickQuestions);
}

// Initialize chatbot
addQuickSuggestions();
