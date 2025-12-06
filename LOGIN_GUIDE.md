# Login & Authentication Guide

## Demo User Credentials

The application includes a demo user database for testing. **Only registered users can log in** using the standard login form.

### Available Demo Accounts:

| Email | Password | Name |
|-------|----------|------|
| `demo@example.com` | `password123` | Demo User |
| `user@sanchari.com` | `sanchari123` | Sanchari User |
| `test@test.com` | `test1234` | Test Account |

## Login Methods

### 1. Standard Email/Password Login
- Enter one of the demo email addresses above
- Enter the corresponding password
- Click "Login"
- ✅ **Error message** will display if email is not registered or password is incorrect

### 2. Demo OAuth (Google, Facebook, Twitter)
- Click any of the **Demo** buttons (Google Demo, Facebook Demo, Twitter Demo)
- You will be instantly logged in as a demo user for that provider
- This is for **testing purposes only** — no real account needed
- **Note:** These are demo buttons, not real OAuth logins yet

## Important Notes

⚠️ **Password Policy:**
- Minimum 6 characters required
- Email must be in valid format (username@domain.extension)
- If you enter unregistered credentials, you'll see an error

✅ **Registration:**
- Click "Sign Up" on the login page to create a new account
- Fill in all required fields
- Your account will be added to the registered users database

🔐 **Security:**
- This is a demo application
- In production, passwords should be hashed and stored securely
- Tokens are issued for authorized users
- Always use HTTPS in production environments

## Troubleshooting

### "Invalid email or password. Not registered?"
- Check the email is spelled correctly
- Verify you're using one of the demo accounts above
- Make sure the password matches exactly (case-sensitive)

### Can't login even with correct credentials?
- Clear your browser's localStorage: DevTools → Application → Storage → Local Storage → Clear All
- Refresh the page and try again

### Demo OAuth buttons not working?
- Ensure browser allows cookies and localStorage
- Check browser console for any JavaScript errors (F12 → Console tab)

## Testing Social Login Features

The demo OAuth buttons allow instant testing without real provider setup:
- **Google Demo** → Logs in as "Google Demo User"
- **Facebook Demo** → Logs in as "Facebook Demo User"  
- **Twitter Demo** → Logs in as "Twitter Demo User"

These are temporary demo logins for UI testing. Real OAuth requires provider credentials and backend configuration.

---

**Next Steps:** After logging in, explore the dashboard features:
- Map & Explore
- Hotels & Stays
- Tourist Spots
- Budget Tracker
- Trip Planner
- Safety Alerts
- Translator
- Chat with Sanchari AI
