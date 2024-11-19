// script.js

document.addEventListener('DOMContentLoaded', () => {
    const questionContainer = document.getElementById('question');
    const answersContainer = document.getElementById('choices');
    const startButton = document.getElementById('start-button');
    const categorySelect = document.getElementById('category');
    const usernameInput = document.getElementById('username');
    const amountInput = document.getElementById('amount');
    const submitButton = document.getElementById('submit-button');

    let quiz;
    let questionGenerator;
    let selectedButton = null; // To keep track of the selected button
    class Question {
        constructor(text, choices, correctAnswer) {
            this.text = text;
            this.choices = choices;
            this.correctAnswer = correctAnswer;
        }
        isCorrectAnswer(selectedAnswer) {
            return selectedAnswer === this.correctAnswer
        }
    }

    class Quiz {
        constructor(username) {
            this.username = username;
            this.score = 0;
            this.currentQuestionIndex = 0;
            this.easyQuestions = [];
            this.mediumQuestions = [];
            this.hardQuestions = [];
        }

        addeasyQuestion(question) {
            this.easyQuestions.push(question);
        }

        addmediumQuestion(question) {
            this.mediumQuestions.push(question);
        }

        addhardQuestion(question) {
            this.hardQuestions.push(question);
        }

        start() {
            this.currentQuestionIndex = 0;
            this.score = 0;
        }

        getCurrentQuestion(difficulty) {
            switch (difficulty) {
                case 'easy':
                    return this.easyQuestions[this.currentQuestionIndex];
                case 'medium':
                    return this.mediumQuestions[this.currentQuestionIndex];
                case 'hard':
                    return this.hardQuestions[this.currentQuestionIndex];
                default:
                    return null; // or handle an invalid difficulty case
            }
        }

        checkAnswer(selectedAnswer, currentQuestion) {
            const isCorrect = currentQuestion.isCorrectAnswer.call(currentQuestion, selectedAnswer)
            if (isCorrect) {
                this.score++;
                return true
            }
            return false
        }

        nextQuestion() {
            this.currentQuestionIndex++;
            return this.currentQuestionIndex < this.easyQuestions.length;
        }
    }

    function* questionGeneratorFunction(questions) {
        for (const question of questions) {
            yield question;
        }
    }

    async function fetchQuestions(difficulty) {
            const category = categorySelect.value;
            const amount = amountInput.value;
            const level = difficulty
            let response = await fetch(`https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${level}`);
            // while (response.status == 429){
            //     await delay(5000)
            //     response = await fetch(`https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${level}`);
            // }
            const data = await response.json();
            return data.results.map(q => new Question(decodeHTML(q.question), [...q.incorrect_answers.map(decodeHTML), decodeHTML(q.correct_answer)], decodeHTML(q.correct_answer)));
    }
    
    async function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Helper function to decode HTML entities
    function decodeHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.documentElement.textContent;
    }

    async function fetchCategories() {
        const response = await fetch('https://opentdb.com/api_category.php');
        const data = await response.json();
        getCategories(data.trivia_categories);
    }

    function getCategories(categories) {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;  // Store category ID for fetching questions
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    function validateInputs() {
        let isValid = true;
    
        // Reset previous error styles
        [usernameInput, amountInput, categorySelect].forEach(input => {
            input.style.borderColor = '';
        });
    
        // Validate username
        if (!usernameInput.value.trim()) {
            isValid = false;
            usernameInput.style.borderColor = 'red';
        }
    
        // Validate amount
        if (!amountInput.value.trim() || isNaN(amountInput.value) || amountInput.value <= 0) {
            isValid = false;
            amountInput.style.borderColor = 'red';
        }
    
        // Validate category
        if (!categorySelect.value) {
            isValid = false;
            categorySelect.style.borderColor = 'red';
        }
    
        return isValid;
    }
    
    
    async function startQuiz(event) {
        event.preventDefault(); // Prevent form submission
         // Validate inputs before starting the quiz
        if (!validateInputs()) {
            return; // Exit if inputs are not valid
        }
        const username = usernameInput.value;
        try {
            const easyQuestions = await fetchQuestions('easy');
            await delay(5100)
            const mediumQuestions = await fetchQuestions('medium')
            await delay(5100)
            const hardQuestions = await fetchQuestions('hard')
            quiz = new Quiz(username);
            easyQuestions.forEach(q => quiz.addeasyQuestion(q));
            mediumQuestions.forEach(q => quiz.addmediumQuestion(q));
            hardQuestions.forEach(q => quiz.addhardQuestion(q));
            questionGenerator = questionGeneratorFunction(quiz.questions);
            
            // Hide home screen and show quiz container
            document.getElementById('homescreen').style.display = 'none';
            document.getElementById('quiz-container').style.display = 'flex';
            
            displayNextQuestion('easy');
        } catch(error){
            console.error("Error fetching questions:", error)
            alert("an error occured while fetching questions please try again")
        }

    }

    function displayNextQuestion(difficulty) {
        const difficultyNotifier = document.getElementById('difficulty-notifier');
        const scoreDisplay = document.getElementById('score-display');

        // Set initial values for difficulty and score
        difficultyNotifier.textContent = `Difficulty: ${difficulty}`;
        scoreDisplay.textContent = `Score: ${quiz.score}`;
        const currentQuestion = quiz.getCurrentQuestion(difficulty);

        if (currentQuestion) {
            questionContainer.textContent = currentQuestion.text;
            answersContainer.innerHTML = '';
            currentQuestion.choices.forEach(choice => {
                const button = document.createElement('button');
                button.textContent = choice;
                button.classList.add('questions');

                button.onclick = () => {
                    // Change background color on selection
                    if (selectedButton) {
                        selectedButton.classList.remove('highlight');
                    }
                    button.classList.add('highlight');
                    selectedButton = button;

                    // Store the selected choice but don't handle it yet
                    selectedChoice = choice;

                    // Enable the submit button and make it green
                    submitButton.disabled = false;
                    submitButton.classList.add('enabled');
                };
                answersContainer.appendChild(button);
            });

            submitButton.onclick = () => {
                // Handle the selected answer here
                handleAnswer(selectedChoice, currentQuestion, difficulty);
    
                // Reset submit button
                submitButton.disabled = true;
                submitButton.classList.remove('enabled');
                selectedChoice = null; // Clear the stored choice

            };
        } else {
            displayResults();
        }
    }

    function handleAnswer(selectedAnswer, currentQuestion, difficulty) {
        const resultMessage = document.getElementById('result-message');
        const correctAnswerElement = document.getElementById('correct-answer');
        if (quiz.checkAnswer(selectedAnswer, currentQuestion)) {
            switch (difficulty) {
                case 'easy':
                        difficulty = 'medium';
                    break;
                case 'medium':
                        difficulty = 'hard';
                    break;
                default:
                    break;
            }
            resultMessage.textContent = "Correct!";
            correctAnswerElement.textContent = ""; // No need to show the correct answer if it's correct
        } else {
            switch (difficulty) {
                case 'hard':
                        difficulty = 'medium';
                    break;
                case 'medium':
                        difficulty = 'easy';
                    break;
                default:
                    break;
            }
            resultMessage.textContent = "Incorrect!";
            correctAnswerElement.textContent = `The correct answer was: ${currentQuestion.correctAnswer}`;
        }

        document.getElementById('quiz-container').style.display = 'none';

        document.getElementById('intermediary-screen').style.display = 'flex';
        
        document.getElementById('next-question-button').addEventListener('click', () => {
            // Hide the intermediary screen and show the quiz container again
            document.getElementById('intermediary-screen').style.display = 'none';
            document.getElementById('quiz-container').style.display = 'flex';
            
            // Display the next question
        });
        if (quiz.nextQuestion()) {
            displayNextQuestion(difficulty);
        } else {
            displayResults();
        }
    }
    
    function displayResults() {
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('score-display').style.display = 'none';
        document.getElementById('difficulty-notifier').style.display = 'none';
        document.getElementById('submit-button').style.display= 'none';
        questionContainer.textContent = `Quiz over! Your score: ${quiz.score}/${quiz.easyQuestions.length}`;
        answersContainer.innerHTML = ''; // Clear choices
    }

    fetchCategories();
    startButton.onclick = startQuiz.bind(this);
});