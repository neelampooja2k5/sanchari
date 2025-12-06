# SmartTrip - AI-Powered Travel Assistant Website

A comprehensive travel planning and assistance platform built with Bootstrap 5 and Bootstrap Icons.

## 📁 Website Structure

### Core Pages
- **index.html** - Landing page with features showcase and navigation
- **login.html** - User login with credential validation
- **register.html** - User registration with form validation
- **dashboard.html** - Main user dashboard with quick access to all tools

### Feature Pages
- **tripplanner.html** - AI-powered trip planning tool
- **discover.html** - Discover places, attractions, and restaurants
- **budget.html** - Track expenses and manage budget
- **translation.html** - Real-time language translator
- **map.html** - Maps and navigation tools
- **safety_alerts.html** - Safety alerts and emergency information
- **chartbot.html** - Cultural AI chatbot

## 🔄 Navigation Flow

### Public Navigation (index.html)
```
Home → Tools (dropdown) → Log In / Sign Up
    ↓
    Features section
    ↓
    CTA Buttons
```

### Tools Dropdown (All Pages)
- Trip Planner
- Discover Places
- Translator
- Budget Tracker
- Maps
- Safety Alerts
- AI Chatbot

### Authentication Flow
```
index.html → register.html → login.html → dashboard.html
                                              ↓
                        (All tools accessible from here)
```

## 🎯 Key Features

### 1. **Trip Planner** (tripplanner.html)
- Plan trips with destination, dates, budget
- Generate personalized itineraries
- Day-by-day activity suggestions

### 2. **Discover Places** (discover.html)
- Search for attractions and restaurants
- Filter by budget, rating, and type
- Browse local recommendations

### 3. **Budget Manager** (budget.html)
- Add and track expenses
- Categorize spending
- View expense charts
- Currency conversion support

### 4. **Language Translator** (translation.html)
- Translate text to multiple languages
- Support for 5+ languages
- Real-time translation interface

### 5. **Maps & Navigation** (map.html)
- Location-based mapping
- Find nearby attractions
- Route planning

### 6. **Safety Alerts** (safety_alerts.html)
- Weather updates
- Emergency contact numbers
- Real-time alerts and advisories

### 7. **AI Chatbot** (chartbot.html)
- Cultural guidance
- Travel advice
- Information retrieval

## 👤 User Management

### Registration
- Full Name, Email, Password (minimum 8 characters)
- Password confirmation validation
- Data stored in localStorage
- Redirect to login after registration

### Login
- Email and password validation
- Verification against registered credentials
- Redirect to dashboard on success
- Error messages for invalid credentials

### Dashboard
- Personalized welcome with user's name
- Quick access tiles to all tools
- Upcoming trip information
- Logout functionality with confirmation

## 🎨 Design & Styling

- **Framework**: Bootstrap 5.3.3
- **Icons**: Bootstrap Icons & Font Awesome 6.5.2
- **Color Scheme**: Professional blues and complementary colors
- **Responsive Design**: Mobile-first approach
- **Consistent Navigation**: Sticky navbar on all pages

## 🚀 Getting Started

1. Open **index.html** in your browser
2. Explore features or click "Sign Up"
3. Register with your details
4. Login with your credentials
5. Access all tools from the dashboard

## 💾 Data Storage

- User credentials stored in browser's localStorage
- Demo data for expenses and recommendations
- Persistent across sessions

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔐 Security Note

This is a frontend demo using localStorage. For production, implement:
- Backend authentication (JWT, OAuth)
- Secure password hashing
- HTTPS encryption
- Input sanitization

## 📝 Navigation Tips

- Use navbar menu on all pages to switch between tools
- Mobile menu available on smaller screens
- "Back to home" links on auth pages
- Dashboard is the central hub for all features
- Logout redirects to home page with confirmation

---

**Version**: 1.0
**Last Updated**: December 6, 2025
