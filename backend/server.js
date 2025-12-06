// server.js - Main Backend Server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Session & Passport for OAuth
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

app.use(session({ secret: process.env.SESSION_SECRET || 'dev-session-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select('-password');
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Helper to create or find user by email
async function findOrCreateUserByProfile(profile, provider) {
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    let user = null;
    if (email) user = await User.findOne({ email });

    if (!user) {
        // Create a lightweight account for OAuth users
        const nameParts = (profile.displayName || '').split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        const randomPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = await require('bcryptjs').hash(randomPassword, 10);

        user = new User({
            firstName,
            lastName,
            email: email || `${provider}_${profile.id}@noemail.local`,
            password: hashedPassword,
            profilePicture: (profile.photos && profile.photos[0] && profile.photos[0].value) || ''
        });

        await user.save();
    }
    return user;
}

// Configure Passport Strategies (Google, Facebook, Twitter)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.CALLBACK_BASE_URL || 'http://localhost:3000'}/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await findOrCreateUserByProfile(profile, 'google');
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.CALLBACK_BASE_URL || 'http://localhost:3000'}/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'photos', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await findOrCreateUserByProfile(profile, 'facebook');
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));
}

if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
    passport.use(new TwitterStrategy({
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: `${process.env.CALLBACK_BASE_URL || 'http://localhost:3000'}/auth/twitter/callback`,
        includeEmail: true
    }, async (token, tokenSecret, profile, done) => {
        try {
            const user = await findOrCreateUserByProfile(profile, 'twitter');
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));
}

// OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/failure' }), async (req, res) => {
    const user = req.user;
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const frontend = process.env.FRONTEND_BASE_URL || 'http://localhost:8000';
    res.redirect(`${frontend}/auth_success.html?token=${token}&name=${encodeURIComponent(user.firstName+' '+user.lastName)}&email=${encodeURIComponent(user.email)}`);
});

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/auth/failure' }), async (req, res) => {
    const user = req.user;
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const frontend = process.env.FRONTEND_BASE_URL || 'http://localhost:8000';
    res.redirect(`${frontend}/auth_success.html?token=${token}&name=${encodeURIComponent(user.firstName+' '+user.lastName)}&email=${encodeURIComponent(user.email)}`);
});

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/auth/failure' }), async (req, res) => {
    const user = req.user;
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const frontend = process.env.FRONTEND_BASE_URL || 'http://localhost:8000';
    res.redirect(`${frontend}/auth_success.html?token=${token}&name=${encodeURIComponent(user.firstName+' '+user.lastName)}&email=${encodeURIComponent(user.email)}`);
});

app.get('/auth/failure', (req, res) => {
    res.status(401).send('Authentication failed');
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sanchari', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// ===== USER SCHEMA =====
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: String,
    password: {
        type: String,
        required: true
    },
    country: String,
    interests: [String],
    joinDate: {
        type: Date,
        default: Date.now
    },
    profilePicture: String,
    savedPlaces: [String],
    bookings: []
});

// ===== HOTEL SCHEMA =====
const hotelSchema = new mongoose.Schema({
    name: String,
    location: String,
    rating: Number,
    price: Number,
    features: [String],
    image: String,
    reviews: Number,
    contact: String
});

// ===== ATTRACTION SCHEMA =====
const attractionSchema = new mongoose.Schema({
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
});

// ===== BOOKING SCHEMA =====
const bookingSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    hotelId: mongoose.Schema.Types.ObjectId,
    checkIn: Date,
    checkOut: Date,
    status: String,
    totalPrice: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Models
const User = mongoose.model('User', userSchema);
const Hotel = mongoose.model('Hotel', hotelSchema);
const Attraction = mongoose.model('Attraction', attractionSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ===== AUTHENTICATION ROUTES =====

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, country, interests } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            country,
            interests
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                phone: user.phone,
                country: user.country
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                phone: user.phone,
                country: user.country
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// ===== USER ROUTES =====

// Get user profile
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

// Update user profile
app.put('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// ===== HOTEL ROUTES =====

// Get all hotels
app.get('/api/hotels', async (req, res) => {
    try {
        const hotels = await Hotel.find();
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hotels', error: error.message });
    }
});

// Get hotel by ID
app.get('/api/hotels/:id', async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        res.json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hotel', error: error.message });
    }
});

// Create hotel (admin only)
app.post('/api/hotels', async (req, res) => {
    try {
        const hotel = new Hotel(req.body);
        await hotel.save();
        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error creating hotel', error: error.message });
    }
});

// ===== ATTRACTION ROUTES =====

// Get all attractions
app.get('/api/attractions', async (req, res) => {
    try {
        const attractions = await Attraction.find();
        res.json(attractions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attractions', error: error.message });
    }
});

// Get attraction by ID
app.get('/api/attractions/:id', async (req, res) => {
    try {
        const attraction = await Attraction.findById(req.params.id);
        res.json(attraction);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attraction', error: error.message });
    }
});

// ===== BOOKING ROUTES =====

// Create booking
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
});

// Get user bookings
app.get('/api/bookings/user/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
});

// ===== SEED DATA (for demo) =====
async function seedDatabase() {
    try {
        const hotelCount = await Hotel.countDocuments();
        if (hotelCount === 0) {
            const hotels = [
                {
                    name: 'Luxury Hotel & Spa',
                    location: 'Downtown',
                    rating: 4.5,
                    price: 120,
                    features: ['Free WiFi', 'Restaurant', 'Pool'],
                    reviews: 245
                },
                {
                    name: 'Boutique Hotel',
                    location: 'City Center',
                    rating: 4.3,
                    price: 85,
                    features: ['Free WiFi', 'Concierge', 'Cozy Rooms'],
                    reviews: 189
                }
            ];
            await Hotel.insertMany(hotels);
            console.log('Hotels seeded');
        }

        const attractionCount = await Attraction.countDocuments();
        if (attractionCount === 0) {
            const attractions = [
                {
                    name: 'Historical Monument',
                    location: 'District Center',
                    description: 'Ancient historical site with rich cultural heritage',
                    category: 'Historical',
                    distance: '2.5 km',
                    rating: 4.8,
                    reviews: 520,
                    coordinates: { latitude: 28.7041, longitude: 77.1025 }
                },
                {
                    name: 'Nature Park',
                    location: 'Outskirts',
                    description: 'Beautiful nature reserve with hiking trails',
                    category: 'Nature',
                    distance: '5.3 km',
                    rating: 4.6,
                    reviews: 380,
                    coordinates: { latitude: 28.5244, longitude: 77.0855 }
                },
                {
                    name: 'Beach Paradise',
                    location: 'Coastal Area',
                    description: 'Pristine beach with water sports',
                    category: 'Beach',
                    distance: '8.1 km',
                    rating: 4.9,
                    reviews: 650,
                    coordinates: { latitude: 28.5355, longitude: 77.3910 }
                }
            ];
            await Attraction.insertMany(attractions);
            console.log('Attractions seeded');
        }
    } catch (error) {
        console.error('Seeding error:', error);
    }
}

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sanchari server running on port ${PORT}`);
    seedDatabase();
});
