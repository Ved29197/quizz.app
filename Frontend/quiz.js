// Quiz variables
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 30;
let questions = [];
let quizActive = false;

// Quiz questions database
const quizQuestions = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1
    },
    {
        question: "What is the largest mammal in the world?",
        options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
        correct: 1
    },
    {
        question: "Which programming language is known as the 'language of the web'?",
        options: ["Python", "Java", "JavaScript", "C++"],
        correct: 2
    },
    {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: 2
    },
    {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correct: 2
    },
    {
        question: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correct: 2
    },
    {
        question: "Which country has the largest population in the world?",
        options: ["India", "United States", "China", "Russia"],
        correct: 2
    },
    {
        question: "What is the main ingredient in guacamole?",
        options: ["Tomato", "Avocado", "Onion", "Pepper"],
        correct: 1
    },
    {
        question: "In which year did World War II end?",
        options: ["1944", "1945", "1946", "1947"],
        correct: 1
    }
];

// Quiz functions
function startQuiz() {
    // Reset quiz state
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 30;
    quizActive = true;
    
    // Shuffle questions for variety
    questions = [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
    
    // Update UI
    document.getElementById('current-score').textContent = score;
    document.getElementById('question-number').textContent = currentQuestionIndex + 1;
    
    showScreen('quiz');
    loadQuestion();
    startTimer();
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
        return;
    }

    const question = questions[currentQuestionIndex];
    
    // Update question info
    document.getElementById('question-number').textContent = currentQuestionIndex + 1;
    document.getElementById('question-text').textContent = question.question;
    
    // Load options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.onclick = () => selectOption(index);
        optionsContainer.appendChild(optionElement);
    });
    
    // Reset timer for new question
    resetTimer();
}

function selectOption(selectedIndex) {
    if (!quizActive) return;
    
    const question = questions[currentQuestionIndex];
    const options = document.querySelectorAll('.option');
    
    // Disable all options
    options.forEach(option => {
        option.style.pointerEvents = 'none';
    });
    
    // Show correct/incorrect
    if (selectedIndex === question.correct) {
        options[selectedIndex].classList.add('correct');
        score += 10;
        document.getElementById('current-score').textContent = score;
    } else {
        options[selectedIndex].classList.add('incorrect');
        options[question.correct].classList.add('correct');
    }
    
    // Move to next question after delay
    clearTimeout(timer);
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            endQuiz();
        }
    }, 1500);
}

function startTimer() {
    resetTimer();
}

function resetTimer() {
    clearInterval(timer);
    timeLeft = 30;
    document.getElementById('timer').textContent = timeLeft;
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            timeUp();
        }
    }, 1000);
}

function timeUp() {
    if (!quizActive) return;
    
    const options = document.querySelectorAll('.option');
    const question = questions[currentQuestionIndex];
    
    // Disable all options and show correct answer
    options.forEach(option => {
        option.style.pointerEvents = 'none';
    });
    options[question.correct].classList.add('correct');
    
    // Move to next question after delay
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            endQuiz();
        }
    }, 1500);
}

async function endQuiz() {
    quizActive = false;
    clearInterval(timer);
    
    // Submit score to server
    if (currentUser && score > 0) {
        try {
            const response = await fetch(API_BASE + '/submit-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    score: score
                })
            });
            
            const data = await response.json();
            if (data.success) {
                // Update local user data
                currentUser.score = score;
                if (score > (currentUser.highScore || 0)) {
                    currentUser.highScore = score;
                }
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        } catch (error) {
            console.error('Error submitting score:', error);
        }
    }
    
    // Show results
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-highscore').textContent = currentUser?.highScore || 0;
    showScreen('results');
}

// Make functions globally available
window.startQuiz = startQuiz;
window.endQuiz = endQuiz;
window.showLeaderboard = () => showScreen('leaderboard');
window.showProfile = () => showScreen('profile');
window.backToMenu = backToMenu;
window.logout = logout;