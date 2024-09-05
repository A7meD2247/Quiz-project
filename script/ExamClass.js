class Exam {
    constructor(timeInMinutes) {
        // Convert time from minutes to seconds and store it as the remaining time for the exam
        this.timeLeft = timeInMinutes * 60;
        
        // Placeholder for the interval ID used to control the exam timer
        this.timerInterval = null;

         // Array to hold the list of questions for the exam
        this.questions = [];

        // Variable to store the user's score (initially 0)
        this.score = 0;

        // Index of the current question being displayed (starts from index[0])
        this.currentQuestionIndex = 0;

        // Variable to store the selected answer for the current question (initially null)
        this.selectedAnswer = null;

        // Array to keep track of the answers the user has given for each question
        this.answersGiven = [];

        // Set to hold flagged question indexes
        this.flaggedQuestions = new Set();

        // If the 'Time' element exists on the page, start the timer and load the questions
        if (document.getElementById('Time')) {
            this.startTimer(); // Initialize and start the timer countdown
            this.loadQuestions(); // Load the questions from the Json File
        }

        this.setupEventListeners(); // Set up event listeners for user interactions
    
    }

    flagQuestion(questionIndex) {
        // Check if the questionIndex is already flagged
        if (this.flaggedQuestions.has(questionIndex)) {
            // If flagged, remove it from the flaggedQuestions set
            this.flaggedQuestions.delete(questionIndex);
        } else {
            // If not flagged, add it to the flaggedQuestions set
            this.flaggedQuestions.add(questionIndex);
        }
        // Update the list of flagged questions displayed to the user
        this.updateFlaggedQuestionsList();

        // Update any indicators that show how many questions are flagged
        this.updateQuestionIndicator();
    }

    displayFlaggedQuestions() {
        // Get the DOM element where flagged questions will be displayed
        const flaggedQuestionsContainer = document.getElementById('flaggedQuestions');
        // Check if the container exists
        if (flaggedQuestionsContainer) {

            // Clear any previous flagged questions displayed in the container
            flaggedQuestionsContainer.innerHTML = '';
            // Create an unordered list for better structure of flagged questions
            const ul = document.createElement('ul');
            // Iterate over each flagged question index
            this.flaggedQuestions.forEach((questionIndex) => {
                // Create a list item for each flagged question
                const listItem = document.createElement('li');
                // Add a click event listener to navigate to the flagged question when clicked
                listItem.textContent = `Question ${questionIndex + 1}`;
                
                listItem.addEventListener('click', () => {
                    // Call the method to navigate
                    this.navigateToQuestion(questionIndex);
                });
                // Append the list item to the unordered list
                ul.appendChild(listItem);
            });
            // Append the unordered list to the flagged questions container
            flaggedQuestionsContainer.appendChild(ul);
        } else {
            // Log an error if the flagged questions container is not found
            console.error('Flagged questions container not found');
        }
    }

    updateFlaggedQuestionsList() {
        // Get the DOM element for flagged questions
        const flaggedQuestionsContainer = document.getElementById('flaggedQuestions');
        // Exit the function if the container does not exist
        if (!flaggedQuestionsContainer) return;

        // Clear any previous list of flagged questions
        flaggedQuestionsContainer.innerHTML = '';
    
        // Create a list to hold flagged questions
        const ul = document.createElement('ul');
    
        // Create a new unordered list for structuring the flagged questions
        this.flaggedQuestions.forEach(index => {
            const flagItem = document.createElement('li'); // Changed from 'div' to 'li'
            flagItem.className = 'flag-item'; // Ensure this matches your CSS class
            flagItem.textContent = `Question ${index + 1}`;
            flagItem.addEventListener('click', () => this.navigateToQuestion(index));
            ul.appendChild(flagItem); // Append the item to the unordered list
        });
    
        // Append the unordered list to the container
        flaggedQuestionsContainer.appendChild(ul);
    }

    navigateToQuestion(index) {
        // Set the current question index to the selected one
        this.currentQuestionIndex = index;
        // Call the display method to show the selected question and answers
        this.display();
    }

    async loadQuestions() {
        try {
            // Fetch the questions from a local JSON file using a relative path
            const res = await fetch('../JsonFiles/Questions.json');

            // Parse the response as JSON to get the questions data
            const data = await res.json();

            // Store the loaded questions in the class's 'questions' array
            this.questions = data.questions;

            // Call the display function to show the first question
            this.display();

        } catch (error) {
            // Log an error message if the request to load questions fails
            console.error("Error loading questions:", error);
        }
    }

    display() {
        // Select the DOM element that will display the question
        const questionArea = document.querySelector('.big-square');

        // Select all DOM elements that will display the answer options (small squares)
        const smallSquares = document.querySelectorAll('.small-square');

        // Get the current question based on the current question index
        const currentQuestion = this.questions[this.currentQuestionIndex];

        // Set the inner HTML of the question area to display the current question text
        questionArea.innerHTML = currentQuestion.question;

        // Iterate over the small squares to display each answer option
        smallSquares.forEach((square, index) => {

            // If there is an answer for the current index, display it in the square
            if (currentQuestion.answers[index]) {
                square.innerHTML = currentQuestion.answers[index];
                square.classList.remove('selected'); // Ensure no previous selection remains

                // If the user has already selected this answer, mark it as selected
                if (this.answersGiven[this.currentQuestionIndex] === currentQuestion.answers[index]) {
                    square.classList.add('selected');
                }
            }
        });

        // Update the question indicator to reflect the current question number
        this.updateQuestionIndicator();

        // Update the visibility of the submit button based on current conditions
        this.updateSubmitButtonVisibility();
    }

    updateQuestionIndicator() {
        // Select the DOM element that contains the question indicator (where question circles are displayed)
        const questionIndicator = document.querySelector('.question-indicator');
        // Clear any existing content in the question indicator (previous question circles)
        questionIndicator.innerHTML = '';

        // Iterate through the list of questions
        this.questions.forEach((_, index) => {
            // Create a new div element for each question, representing it as a circle
            const circle = document.createElement('div');

            circle.className = 'question-circle';  // Assign a class for styling the circle

            // If the current circle represents the active (current) question, add the 'active' class to highlight it
            if (index === this.currentQuestionIndex) {
                circle.classList.add('active');
            }

            // Set the text content of the circle to display the question number (1-based index)
            circle.textContent = index + 1;

            // Append the circle to the question indicator area in the DOM
            questionIndicator.appendChild(circle);
        });
    }

    nextQuestion() {
        // Check if the current question is not the last question in the quiz
        if (this.currentQuestionIndex < this.questions.length - 1) {
            // Store the user's answer for the current question
            this.storeAnswer();

            // Move to the next question by incrementing the current question index
            this.currentQuestionIndex++;

            // Update the display to show the next question and answer choices
            this.display();
        } else {
            // If already on the last question, store the current answer
            this.storeAnswer();

            // Display the final question and answer state
            this.display();

            // Update the submit button's visibility to allow the user to submit the quiz
            this.updateSubmitButtonVisibility();
        }
    }

    prevQuestion() {
        // Check if the current question is not the first question in the quiz
        if (this.currentQuestionIndex > 0) {
            // Store the user's answer for the current question
            this.storeAnswer();

            // Move to the previous question by decrementing the current question index
            this.currentQuestionIndex--;

            // Update the display to show the previous question and answer choices
            this.display();
        }
    }

    storeAnswer() {
        // Select all elements representing answer choices
        const smallSquares = document.querySelectorAll('.small-square');
        let answerSelected = false;

        // Iterate over each answer choice element
        smallSquares.forEach(square => {
            // Check if the answer choice is currently selected
            if (square.classList.contains('selected')) {
                // Store the selected answer in the `answersGiven` array at the current question index
                this.answersGiven[this.currentQuestionIndex] = square.innerHTML; // Indicate that an answer has been selected
                answerSelected = true;
            }
        });
        // Check if the user is on the last question
        const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;
        if (isLastQuestion && answerSelected) {
            // Update the visibility of the submit button if on the last question and an answer is selected
            this.updateSubmitButtonVisibility();
        }
    }

    startTimer() {
        // Start the interval that updates every second (1000 milliseconds)
        this.timerInterval = setInterval(() => {
            // Calculate the remaining minutes and seconds from the time left
            let minutes = Math.floor(this.timeLeft / 60);
            let seconds = this.timeLeft % 60;

            // Display the formatted time (adding a leading zero to seconds if less than 10)
            document.getElementById('Time').innerHTML = `<b>Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}</b>`;

            // Decrease the time left by one second
            this.timeLeft--;

            if (this.timeLeft < 0) {
                // Stop the timer
                clearInterval(this.timerInterval);
                // Redirect to the "End.html" page when the time is up
                window.location.href = "End.html";
            }
        }, 1000); // The timer interval is set to 1000ms (1 second)
    }

    setupEventListeners() {
        const smallSquares = document.querySelectorAll('.small-square');
        const submitAnswer = document.getElementById('SubmitAnswer');
        const nextButton = document.getElementById('Next');
        const prevButton = document.getElementById('Prev');
        const Info = document.getElementById('Info');
        const closeMessage = document.getElementById('closeMessage');
        const overlay = document.getElementById('overlay');
        const message = document.getElementById('message');
        const submitExam = document.getElementById('submitExam');
        const scoreElement = document.getElementById('Score');
        const flagButton = document.getElementById('Flag');

        if (flagButton) {
            flagButton.addEventListener('click', () => {
                const questionIndex = this.currentQuestionIndex; // Assuming you want to flag the current question
                this.flagQuestion(questionIndex);
            });
        }
        // Display the user's score (if applicable) from localStorage
        if (scoreElement) {
            const score = localStorage.getItem('examScore') || 0;
            scoreElement.textContent = `${score}/10`;
        }

        // Add click event listeners for each answer choice (small squares)
        if (smallSquares.length > 0) {
            smallSquares.forEach(square => {
                square.addEventListener('click', () => {

                    // Store the selected answer and visually mark it as selected
                    this.selectedAnswer = square.innerHTML;

                    // Remove the 'selected' class from all small squares to reset any previously selected answer
                    smallSquares.forEach(sq => sq.classList.remove('selected'));

                    // Add the 'selected' class to the clicked square to highlight it as the current selection
                    square.classList.add('selected');
                });
            });
        }
        // Add a click listener to the submit answer button
        if (submitAnswer) {
            submitAnswer.addEventListener('click', () => this.handleSubmission());
        }
        // Add a click listener to the "Next" button to move to the next question
        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextQuestion());
        }
        // Add a click listener to the "Previous" button to move to the previous question
        if (prevButton) {
            prevButton.addEventListener('click', () => this.prevQuestion());
        }
        // Add a click listener to the submit exam button to show a confirmation dialog
        if (submitExam) {
            submitExam.addEventListener('click', () => this.showConfirmationDialog());
        }
        // Add a click listener to the Info button to display a message
        if (Info) {
            Info.addEventListener('click', () => this.toggleMessage(true));
        }
        // Add a click listener to the close button to hide the message dialog
        if (closeMessage) {
            closeMessage.addEventListener('click', () => this.toggleMessage(false));
        }
        // Add a click listener to the overlay to hide the message dialog when clicked
        if (overlay) {
            overlay.addEventListener('click', () => this.toggleMessage(false));
        }
    }

    updateSubmitButtonVisibility() {
        // Get the submit button element by its ID
        const submitButton = document.getElementById('submitExam');
        // If the submit button does not exist, exit the function
        if (!submitButton) return;

        // Check if all questions have been answered
        // 'every' ensures that each question has a corresponding answer in 'answersGiven' that is not undefined
        const allAnswered = this.questions.every((_, index) => this.answersGiven[index] !== undefined);

        // Determine if the current question is the last question
        const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;

        // If all questions have been answered, or the user is on the last question and has answered it,
        // then display the submit button, otherwise hide it
        if (allAnswered || (isLastQuestion && this.answersGiven[this.currentQuestionIndex])) {
            // Show the submit button by setting its display to 'inline-block'
            submitButton.style.display = 'inline-block';
        } else {
            // Hide the submit button by setting its display to 'none'
            submitButton.style.display = 'none';
        }
    }

    showConfirmationDialog() {
        // Show the custom confirmation popup instead of the default confirm dialog
        const confirmationPopup = document.getElementById('confirmationPopup');
        const confirmYes = document.getElementById('confirmYes');
        const confirmNo = document.getElementById('confirmNo');

        // Display the confirmation popup
        confirmationPopup.classList.remove('hidden');

        // Handle the "Yes" button click - submit the exam
        confirmYes.addEventListener('click', () => {
            confirmationPopup.classList.add('hidden');  // Hide the popup
            this.finalizeSubmission(); // Call the final submission function
        });

        // Handle the "No" button click - just close the popup
        confirmNo.addEventListener('click', () => {
            confirmationPopup.classList.add('hidden');  // Hide the popup without submitting
        });
    }

    handleSubmission() {
        // Store the currently selected answer for the current question
        this.storeAnswer();
        // Check if all questions have been answered by comparing the number of answers given
        // with the total number of questions, and ensuring none of the answers are undefined
        const allAnswered = this.answersGiven.length === this.questions.length && !this.answersGiven.includes(undefined);
        // If not all questions are answered, show Box that prompting the user to answer all questions
        if (!allAnswered) {
            this.showPopup();
        } else {
            // If all questions are answered, update the visibility of the submit button
            this.updateSubmitButtonVisibility();
        }
    }
    showPopup() {
        const popup = document.getElementById('popup');
        const closePopup = document.getElementById('closePopup');
    
        popup.classList.remove('hidden'); // Show the popup
    
        closePopup.addEventListener('click', () => {
            popup.classList.add('hidden'); // Hide the popup on button click
        });
    }

    finalizeSubmission() {
        // Calculate the user's score by comparing their answers to the correct answers
        this.score = this.answersGiven.reduce((acc, answer, index) => {
            // Get the correct answer for the current question
            const correctAnswer = this.questions[index].correctAnswer;

            // Check if the user's answer matches the correct answer (case insensitive)
            // Increment the score if the answer is correct, otherwise keep the score unchanged
            return acc + (answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase() ? 1 : 0);
        }, 0);
        // Store the user's score in localStorage
        localStorage.setItem('examScore', this.score);

        // Check if all questions have been answered
        const allAnswered = this.answersGiven.length === this.questions.length && !this.answersGiven.includes(undefined);

        // If all questions are answered
        if (allAnswered) {
            const overlay = document.getElementById('overlay');
            overlay.style.display = 'block';
            overlay.innerHTML = 'Please wait...';
            // Redirect to the success page if the score is greater than 5
            // Redirect to the failure page if the score is 5 or less
            if (this.score > 5) {
                window.location.href = "../htmlRoutes/success.html";
            } else {
                window.location.href = "../htmlRoutes/failed.html";
            }
        }
    }

    toggleMessage(show) {
        // Get the overlay and message elements from the DOM
        const overlay = document.getElementById('overlay');
        const message = document.getElementById('message');

        // Check if the 'show' parameter is true or false
        if (show) {
            // If 'show' is true, display both the overlay and the message
            // Set the overlay to block to cover the entire screen
            overlay.style.display = 'block';
            // Set the message to flex to center it within the overlay
            message.style.display = 'flex';
        } else {
            // If 'show' is false, hide both the overlay and the message
            overlay.style.display = 'none';
            message.style.display = 'none';
        }
    }
}

window.onload = function() {
    // Check if the 'Time' element exists on the page
    if (document.getElementById('Time')) {
        // If the 'Time' element is present, create a new Exam instance with 5 minutes
        new Exam(5);
    }

    // Get the 'Submit' button element from the DOM
    const submit = document.getElementById('Submit');
    if (submit) {
        // If the 'Submit' button exists, add a click event listener to it
        // On click, redirect the user to the 'Exam.html' page
        submit.addEventListener('click', () => {
            window.location.href = '../htmlRoutes/Exam.html';
        });
    }
    // Get the 'Score' element from the DOM
    const scoreElement = document.getElementById('Score');
    if (scoreElement) {
        // If the 'Score' element exists, retrieve the score from local storage
        // If no score is found, default to 0
        const score = localStorage.getItem('examScore') || 0;
        scoreElement.textContent = `${score}/10`;
    }
};
