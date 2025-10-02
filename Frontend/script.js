// Global variables
let currentUser = null;
let currentScreen = 'auth';

// API Base URL
const API_BASE = 'http://localhost:3000';

// DOM Elements
const screens = {
    auth: document.getElementById('auth-screen'),
    menu: document.getElementById('menu-screen'),
    quiz: document.getElementById('quiz-screen'),
    results: document.getElementById('results-screen'),
    leaderboard: document.getElementById('leaderboard-screen'),
    profile: document.getElementById('profile-screen')
};
function handleSignup() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validation
    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }

    if (username.length < 3) {
        alert("Username must be at least 3 characters long!");
        return;
    }

    // Call signup API
    signup(username, password);
}

// Your actual signup API function
async function signup(username, password) {
    try {
        console.log('Sending signup request for:', username);
        
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Signup response:', data);
        
        if (data.success) {
            alert("Account created successfully!");
            // Switch to login form after successful signup
            showLoginForm();
        } else {
            alert(data.message || "Signup failed");
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert("Network error - please try again");
    }
}
// Authentication functions
function showLogin() {
    document.getElementById('auth-title').textContent = 'Login';
    document.getElementById('auth-btn').textContent = 'Login';
    document.getElementById('confirm-password').style.display = 'none';
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
}

function showSignup() {
    document.getElementById('auth-title').textContent = 'Sign Up';
    document.getElementById('auth-btn').textContent = 'Sign Up';
    document.getElementById('confirm-password').style.display = 'block';
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
}

async function handleAuth() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const isSignup = document.getElementById('auth-btn').textContent === 'Sign Up';
    const messageEl = document.getElementById('auth-message');

    // Validation
    if (!username || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (isSignup && password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    try {
        const endpoint = isSignup ? '/signup' : '/login';
        const response = await fetch(API_BASE + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            if (isSignup) {
                showMessage('Account created successfully! Please login.', 'success');
                showLogin();
            } else {
                currentUser = {
                    id: data.userId,
                    username: data.username,
                    score: data.score,
                    highScore: data.highScore
                };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showMessage('Login successful!', 'success');
                setTimeout(() => showScreen('menu'), 1000);
            }
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
        console.error('Auth error:', error);
    }
}

function showMessage(message, type) {
    const messageEl = document.getElementById('auth-message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
}

// Screen management
function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    screens[screenName].classList.add('active');
    currentScreen = screenName;

    // Update screen-specific content
    switch(screenName) {
        case 'menu':
            updateMenu();
            break;
        case 'profile':
            showProfile();
            break;
        case 'leaderboard':
            loadLeaderboard();
            break;
    }
}

function updateMenu() {
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.username;
        document.getElementById('user-highscore').textContent = currentUser.highScore || 0;
    }
}

function showProfile() {
    if (currentUser) {
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-score').textContent = currentUser.score || 0;
        document.getElementById('profile-highscore').textContent = currentUser.highScore || 0;
    }
}

async function loadLeaderboard() {
    try {
        const response = await fetch(API_BASE + '/leaderboard');
        const data = await response.json();

        const leaderboardList = document.getElementById('leaderboard-list');
        
        if (data.success && data.leaderboard.length > 0) {
            leaderboardList.innerHTML = data.leaderboard.map((user, index) => `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank">#${index + 1}</div>
                    <div class="leaderboard-user">${user.username}</div>
                    <div class="leaderboard-score">${user.score} pts</div>
                </div>
            `).join('');
        } else {
            leaderboardList.innerHTML = '<p>No scores yet. Be the first to play!</p>';
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        document.getElementById('leaderboard-list').innerHTML = '<p>Error loading leaderboard</p>';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showScreen('auth');
    
    // Clear form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('auth-message').style.display = 'none';
}

function backToMenu() {
    showScreen('menu');
}

// Check if user is already logged in
function checkLoggedIn() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showScreen('menu');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkLoggedIn();
    
    // Enter key support for auth form
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleAuth();
        }
    });
});