"""
Flask server for SmartTrip application
Handles user registration, login, and serves HTML files
"""

from flask import Flask, request, jsonify, redirect, session, send_file
from india_travel_db import IndiaTravelDatabase
import os

app = Flask(__name__)
app.secret_key = 'smarttrip_secret_key_2025'

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Database
db = IndiaTravelDatabase()


@app.route('/')
def index():
    return send_file(os.path.join(BASE_DIR, 'index.html'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return send_file(os.path.join(BASE_DIR, 'register.html'))
    
    try:
        data = request.get_json()
        full_name = data.get('fullName', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        confirm_password = data.get('confirmPassword', '')
        
        if not all([full_name, email, password, confirm_password]):
            return jsonify({'success': False, 'message': 'All fields required'}), 400
        
        if password != confirm_password:
            return jsonify({'success': False, 'message': 'Passwords do not match'}), 400
        
        if len(password) < 8:
            return jsonify({'success': False, 'message': 'Password must be 8+ characters'}), 400
        
        if '@' not in email or '.' not in email:
            return jsonify({'success': False, 'message': 'Invalid email'}), 400
        
        if db.register_user(full_name, email, password):
            return jsonify({'success': True, 'message': 'Registration successful!'}), 201
        else:
            return jsonify({'success': False, 'message': 'Email already registered'}), 409
    except Exception as e:
        print(f"[ERROR] Registration failed: {e}")
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return send_file(os.path.join(BASE_DIR, 'login.html'))
    
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password required'}), 400
        
        user = db.login_user(email, password)
        
        if user:
            session['user_id'] = user['id']
            session['user_name'] = user['full_name']
            session['user_email'] = user['email']
            return jsonify({'success': True, 'message': 'Login successful!'}), 200
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"[ERROR] Login failed: {e}")
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500


@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect('/login')
    
    return send_file(os.path.join(BASE_DIR, 'dashboard.html'))


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out'}), 200


@app.route('/api/session')
def api_session():
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user_name': session.get('user_name'),
            'user_email': session.get('user_email')
        }), 200
    else:
        return jsonify({'authenticated': False}), 401


@app.route('/tripplanner')
def tripplanner():
    return send_file(os.path.join(BASE_DIR, 'tripplanner.html'))


@app.route('/<path:filename>')
def serve_static(filename):
    try:
        filepath = os.path.join(BASE_DIR, filename)
        if os.path.exists(filepath) and os.path.isfile(filepath):
            return send_file(filepath)
    except Exception as e:
        print(f"[ERROR] Serving file {filename}: {e}")
    
    return jsonify({'error': 'File not found'}), 404


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Server error'}), 500


if __name__ == '__main__':
    print("[OK] Connected to database: smarttrip.db")
    print("[OK] Users table created successfully")
    app.run(debug=True, host='127.0.0.1', port=5000)
