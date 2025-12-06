# Sanchari - Installation & Setup Guide

## Quick Start (Frontend Only - No Backend)

If you just want to explore the interface and don't need backend functionality:

### Step 1: Open in Browser
1. Navigate to the project folder: `c:\Users\Hp\Desktop\toursim`
2. Open `index.html` in your web browser
3. Click "Sign Up" or "Login" to access the app

**Note:** All data will be stored locally in browser storage (localStorage) for demo purposes.

---

## Full Setup with Backend (Recommended)

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Community Edition) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional) - [Download](https://git-scm.com/)

### Installation Steps

#### 1. Setup Frontend
```bash
# Navigate to project folder
cd c:\Users\Hp\Desktop\toursim

# Open index.html in your browser or use a local server
# Option A: Using Python (if installed)
python -m http.server 8000

# Option B: Using Node.js http-server
npm install -g http-server
http-server

# Then open: http://localhost:8000 (or http://localhost:3000 for http-server)
```

#### 2. Setup MongoDB

**Option A: Local Installation**
```bash
# Windows: Download installer from https://www.mongodb.com/try/download/community
# Run the installer and follow the steps
# MongoDB will run as a service by default

# Verify MongoDB is running
# Open Command Prompt and type:
mongosh
# If connected successfully, you'll see: test>
```

**Option B: Using Docker (if installed)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option C: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update `.env` file with the connection string

#### 3. Setup Backend Server

```bash
# Navigate to backend folder
cd c:\Users\Hp\Desktop\toursim\backend

# Install dependencies
npm install

# Create .env file
# Copy from .env.example:
# Rename .env.example to .env

# For Windows:
copy .env.example .env

# Edit .env if using MongoDB Atlas:
# MONGODB_URI=your_atlas_connection_string

# Start the server
npm start
# Should show: "Sanchari server running on port 3000"
```

#### 4. Test the Application

1. **Frontend:** Open http://localhost:8000 in your browser
2. **Backend API Test:**
   ```bash
   # Open another terminal and test the API:
   curl http://localhost:3000/api/hotels
   ```

---

## Features Walkthrough

### 1. Home Page (index.html)
- Landing page with feature overview
- Quick links to login/signup
- Responsive design showcase

### 2. Registration (register.html)
**Features:**
- Form validation in real-time
- Password strength indicator
- Terms acceptance
- Interest selection
- Data sent to backend
- Auto-redirect to dashboard

**Test Data:**
```
First Name: John
Last Name: Doe
Email: john@example.com
Phone: 9876543210
Password: Test@123 (strong)
Country: India
Interests: Adventure, Culture
```

### 3. Login (login.html)
**Features:**
- Email & password authentication
- Remember me option
- Social login buttons (UI ready)
- Password visibility toggle
- Error messages

**Test Credentials:**
```
Email: john@example.com
Password: Test@123
```

### 4. Dashboard (dashboard.html)
**Main Features:**

#### Home Section
- Welcome message
- Statistics cards
- Featured destinations carousel

#### Map & Explore
- Interactive map with Leaflet.js
- Marker placement for hotels/attractions
- Current location tracking
- Offline mode toggle
- Zoom and pan controls

#### Hotels & Accommodations
- Hotel listing with filters
- Price and rating sorting
- Hotel details (amenities, reviews)
- Booking functionality

#### Tourist Attractions
- Nearby attractions display
- Distance information
- Ratings and reviews
- Get directions button
- Save favorites

#### My Profile
- User information display
- Personal details
- Travel preferences
- Account settings

### 5. Sachare AI Chatbot
**Features:**
- 24/7 available
- Keyword-based responses
- Topics covered:
  - Destinations
  - Hotels
  - Attractions
  - Budget travel
  - Weather
  - Offline features
  - Bookings
  - General greetings

**Try These Questions:**
- "Hi, how can you help me?"
- "What are some popular destinations?"
- "I'm looking for budget hotels"
- "Show me nearby attractions"
- "What's the weather like?"

---

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "securepassword",
  "country": "India",
  "interests": ["adventure", "culture"]
}

Response:
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}

Response:
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": { ... }
}
```

### Hotel Endpoints

#### Get All Hotels
```
GET /api/hotels

Response: [
  {
    "_id": "...",
    "name": "Hotel Name",
    "location": "Location",
    "rating": 4.5,
    "price": 100,
    "features": [...],
    "reviews": 245
  },
  ...
]
```

### Attraction Endpoints

#### Get All Attractions
```
GET /api/attractions

Response: [
  {
    "_id": "...",
    "name": "Attraction Name",
    "location": "Location",
    "description": "...",
    "category": "Historical",
    "distance": "2.5 km",
    "rating": 4.8,
    "reviews": 520,
    "coordinates": { ... }
  },
  ...
]
```

### Booking Endpoints

#### Create Booking
```
POST /api/bookings
Content-Type: application/json

{
  "userId": "user_id",
  "hotelId": "hotel_id",
  "checkIn": "2024-01-15",
  "checkOut": "2024-01-20",
  "totalPrice": 600
}

Response:
{
  "message": "Booking created",
  "booking": { ... }
}
```

---

## Troubleshooting

### Issue: Port 3000 Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in server.js
PORT=3001
```

### Issue: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solutions:
1. Start MongoDB service (Windows):
   - Services app -> MongoDB Server -> Start

2. Or run MongoDB manually:
   mongod

3. Check if MongoDB is installed:
   mongod --version
```

### Issue: "Cannot find module" Error
```bash
# In backend folder, reinstall dependencies
npm install

# Clear npm cache if still having issues
npm cache clean --force
npm install
```

### Issue: CORS Error
```
Access to XMLHttpRequest blocked by CORS policy

Solution: Already configured in server.js
If still issues, ensure:
1. Frontend is on http://localhost:8000
2. Backend is on http://localhost:3000
3. Backend has CORS enabled
```

### Issue: Map Not Loading
```
Solutions:
1. Check internet connection (Leaflet needs to download tiles)
2. Verify Leaflet CDN is accessible
3. Open browser console (F12) and check for errors
4. Try refreshing the page
```

---

## Customization Guide

### Change Primary Colors
Edit `css/styles.css`:
```css
:root {
    --primary-color: #667eea;      /* Change this */
    --secondary-color: #764ba2;     /* Change this */
    --accent-color: #f5576c;        /* Change this */
    /* ... other colors ... */
}
```

### Add New Tourist Spots
Edit `backend/server.js` in the `seedDatabase()` function:
```javascript
{
    name: 'Your New Attraction',
    location: 'Location Name',
    description: 'Description here',
    category: 'Category',
    distance: '5 km',
    rating: 4.8,
    reviews: 100,
    coordinates: {
        latitude: 28.7041,
        longitude: 77.1025
    }
}
```

### Customize Chatbot Responses
Edit `js/chatbot.js` and add to `sachareResponses`:
```javascript
yourTopic: [
    'Response 1',
    'Response 2',
    'Response 3'
]
```

### Add Authentication to API
Edit `backend/server.js` to add middleware:
```javascript
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    // Token verification logic
}

app.get('/api/protected', verifyToken, (req, res) => {
    // Protected endpoint
});
```

---

## Database Schema

### User Collection
```javascript
{
    _id: ObjectId,
    firstName: String,
    lastName: String,
    email: String (unique),
    phone: String,
    password: String (hashed),
    country: String,
    interests: [String],
    joinDate: Date,
    profilePicture: String,
    savedPlaces: [String],
    bookings: [ObjectId]
}
```

### Hotel Collection
```javascript
{
    _id: ObjectId,
    name: String,
    location: String,
    rating: Number,
    price: Number,
    features: [String],
    image: String,
    reviews: Number,
    contact: String
}
```

### Attraction Collection
```javascript
{
    _id: ObjectId,
    name: String,
    location: String,
    description: String,
    category: String,
    distance: String,
    rating: Number,
    reviews: Number,
    image: String,
    coordinates: {
        latitude: Number,
        longitude: Number
    }
}
```

---

## Deployment

### Deploy Frontend (Netlify/Vercel)
1. Push code to GitHub
2. Connect to Netlify/Vercel
3. Deploy automatically

### Deploy Backend (Heroku/Railway)
1. Create account on Heroku
2. Login: `heroku login`
3. Create app: `heroku create app-name`
4. Add MongoDB Atlas URI to environment
5. Deploy: `git push heroku main`

---

## Performance Tips

1. **Cache static assets** - Use browser caching for CSS/JS
2. **Compress images** - Optimize images before deployment
3. **Lazy load maps** - Load map only when section is visible
4. **Database indexes** - Add indexes to frequently queried fields
5. **API pagination** - Limit API responses to prevent overload

---

## Support & Help

- Check browser console for errors: Press F12 → Console
- Check server logs in terminal
- Review API responses in Network tab (F12 → Network)
- Read MongoDB logs for database issues

---

## Next Steps

1. ✅ Test all features
2. ✅ Customize colors and content
3. ✅ Add more attractions/hotels to database
4. ✅ Integrate real payment gateway
5. ✅ Deploy to production
6. ✅ Add more chatbot responses
7. ✅ Implement user reviews system
8. ✅ Add notification system

---

**Happy Coding! 🚀**
