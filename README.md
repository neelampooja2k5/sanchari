# Sanchari - Smart Tourism Platform

A professional, feature-rich tourism website built with HTML, CSS, JavaScript, and Node.js.

## Features

### 🎯 Core Features
- **User Authentication**: Secure login and registration system
- **Offline Maps**: Download maps for offline access with location services
- **AI Chatbot (Sanchari)**: 24/7 travel assistance and recommendations
- **Hotel Booking**: Browse and book hotels with ratings and reviews
- **Tourist Attractions**: Discover nearby places, monuments, and attractions
- **User Dashboard**: Centralized hub for all travel information
- **Itinerary Planning**: Create and manage travel plans
- **User Profiles**: Personalized travel preferences and history

### 🎨 Design Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI/UX**: Clean, professional interface with smooth animations
- **Dark Mode Ready**: Professional color scheme with accessibility
- **Interactive Elements**: Engaging cards, buttons, and animations

### 🚀 Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Mapping**: Leaflet.js for interactive maps
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT tokens with bcrypt password hashing

## Project Structure

```
toursim/
├── login.html              # Login page
├── register.html           # Registration page
├── dashboard.html          # Main dashboard
├── css/
│   └── styles.css          # All styling
├── js/
│   ├── login.js            # Login functionality
│   ├── register.js         # Registration logic
│   ├── dashboard.js        # Dashboard features
│   └── chatbot.js          # Sanchari chatbot
├── backend/
│   ├── server.js           # Express server
│   ├── package.json        # Dependencies
│   └── .env.example        # Environment variables
└── data/                   # Database storage
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- Modern web browser

### Frontend Setup

1. **Open the website locally:**
   - Simply open `login.html` in your browser
   - Or use a local server: `python -m http.server 8000`

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update MongoDB URI and JWT secret

3. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

## Usage Guide

### 1. Registration
- Navigate to the registration page
- Fill in your details (name, email, phone, country, interests)
- Password strength indicator shows password quality
- Agree to terms and create account

### 2. Login
- Use your registered email and password
- Account stays logged in with token storage

### 3. Dashboard Features

#### Home Section
- View statistics (destinations, hotels, attractions visited)
- Browse featured destinations
- Access quick stats

#### Map & Explore
- Interactive map with offline capability
- View nearby hotels and attractions
- Get directions to locations
- Download maps for offline use

#### Hotels & Accommodations
- Filter hotels by price and rating
- View hotel details, amenities, and reviews
- Book hotels directly

#### Tourist Attractions
- Discover nearby tourist spots
- View ratings and reviews
- Get directions
- Save favorites

#### My Profile
- View and edit personal information
- Manage travel preferences
- View account settings

### 4. Sanchari Chatbot
- Click the robot icon to open the chat
- Ask questions about destinations, hotels, attractions, budget travel
- Get instant recommendations and assistance
- Available 24/7

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get hotel details
- `POST /api/hotels` - Create hotel (admin)

### Attractions
- `GET /api/attractions` - Get all attractions
- `GET /api/attractions/:id` - Get attraction details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user/:userId` - Get user bookings

## Key Features Explained

### 🗺️ Offline Maps
- Uses Leaflet.js for mapping
- Supports marker placement for hotels and attractions
- Current location tracking with geolocation
- Offline mode for map access without internet

### 🤖 Sanchari AI Chatbot
- Natural language processing for user queries
- Keyword-based response system
- Covers topics: destinations, hotels, attractions, budget travel, weather, offline features
- Extensible response system

### 🔐 Security
- Passwords hashed with bcrypt
- JWT token-based authentication
- Secure API endpoints
- CORS protection

### 📱 Responsive Design
- Mobile-first approach
- Adaptive grid layouts
- Touch-friendly buttons and interfaces
- Optimized for all screen sizes

## Customization Guide

### Change Brand Colors
Edit the CSS variables in `css/styles.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    /* ... other colors */
}
```

### Add More Attractions
In `backend/server.js`, add to the seed data:
```javascript
{
    name: 'Your Attraction',
    location: 'Location',
    description: 'Description',
    // ... other fields
}
```

### Customize Chatbot Responses
Edit `js/chatbot.js` and add to the `sanchariResponses` object:
```javascript
yourTopic: [
    'Response 1',
    'Response 2'
]
```

## Testing the System

### Demo Credentials
Use any email and password (for demo purposes):
- Email: `demo@example.com`
- Password: `password123`

### Test Features
1. Register a new account
2. Login with credentials
3. Explore the dashboard
4. Use the map feature
5. Chat with Sanchari
6. View hotels and attractions
7. Edit profile information

## Troubleshooting

### Map not loading
- Ensure Leaflet.js CDN is accessible
- Check browser console for errors
- Verify internet connection

### Chatbot not responding
- Check `js/chatbot.js` is loaded
- Ensure chat modal is visible
- Try refreshing the page

### Backend connection issues
- Verify MongoDB is running
- Check if server is started (`npm start`)
- Ensure `backend/.env` is configured correctly
- Check port 3000 is available

## Future Enhancements

- [ ] Real payment gateway integration
- [ ] Advanced search and filters
- [ ] User reviews and ratings
- [ ] Real-time notifications
- [ ] Video tours of destinations
- [ ] Multi-language support
- [ ] Social sharing features
- [ ] Advanced analytics dashboard
- [ ] Integration with airline APIs
- [ ] Augmented Reality features

## Support & Contribution

For issues, questions, or contributions:
- Report bugs through the dashboard
- Contact support via chatbot
- Suggest features through feedback form

## License

This project is built for educational and demonstration purposes.

## Credits

Built with ❤️ for smart tourism solutions.

---

**Happy Traveling! 🌍✈️**
