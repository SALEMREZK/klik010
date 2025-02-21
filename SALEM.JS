document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll(".cell");
    const statusText = document.getElementById("status");
    const restartBtn = document.getElementById("restart");
    const playerVsPlayerBtn = document.getElementById("player-vs-player");
    const playerVsAIBtn = document.getElementById("player-vs-ai");
    const timeLeft = document.getElementById("time-left");
    const darkModeBtn = document.getElementById("toggle-dark-mode");
    const moveSound = document.getElementById('move-sound');
    const winSound = document.getElementById('win-sound');
    const celebration = document.getElementById('celebration');
    const professionalModeBtn = document.getElementById('toggle-professional-mode');
    const celebrationSound = document.getElementById('celebration-sound');
    let darkMode = false;
    let professionalMode = false;

    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let running = false;
    let againstAI = false;
    let timer;

    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // صفوف
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // أعمدة
        [0, 4, 8], [2, 4, 6] // أقطار
    ];

    function startGame() {
        cells.forEach(cell => cell.addEventListener("click", cellClicked));
        statusText.textContent = `${currentPlayer} يبدأ`;
        running = true;
        againstAI = false;
        startTimer();
    }

    function startTimer() {
        let seconds = 10;
        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft.textContent = seconds;
            if (seconds === 0) {
                changePlayer();
                startTimer();
            }
            seconds--;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer);
    }

    function cellClicked() {
        const cellIndex = this.getAttribute("data-index");
        if (board[cellIndex] !== "" || !running) return;

        updateCell(this, cellIndex);
        moveSound.play();
        if (checkWinner()) return;

        if (againstAI && running) {
            setTimeout(aiMove, 500); 
        }
    }

    function updateCell(cell, index) {
        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer === "X" ? "x-color" : "o-color");
    }

    function changePlayer() {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.textContent = `دور ${currentPlayer}`;
    }

    function checkWinner() {
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                statusText.textContent = `🎉 ${currentPlayer} فاز!`;
                running = false;
                stopTimer();
                winSound.play();
                showCelebration();
                return true;
            }
        }

        if (board.every(cell => cell !== "")) {
            statusText.textContent = "🤝 تعادل!";
            running = false;
            stopTimer();
            return true;
        }

        changePlayer();
        return false;
    }

    function showCelebration() {
        celebration.classList.remove('hidden');
        celebrationSound.play();
        setTimeout(() => {
            celebration.classList.add('hidden');
        }, 3000);
    }

    function restartGame() {
        board.fill("");
        currentPlayer = "X";
        statusText.textContent = `${currentPlayer} يبدأ`;
        cells.forEach(cell => {
            cell.textContent = "";
            cell.classList.remove("x-color", "o-color");
        });
        running = true;
        startTimer();
    }

    function aiMove() {
        let bestScore = -Infinity;
        let move;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, 0, false);
                board[i] = "";
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        let aiCell = document.querySelector(`.cell[data-index="${move}"]`);
        updateCell(aiCell, move);
        checkWinner();
    }

    function minimax(board, depth, isMaximizing) {
        let scores = {
            "X": -1,
            "O": 1,
            "tie": 0
        };

        let result = checkWinnerForMinimax();
        if (result !== null) {
            return scores[result];
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === "") {
                    board[i] = "O";
                    let score = minimax(board, depth + 1, false);
                    board[i] = "";
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === "") {
                    board[i] = "X";
                    let score = minimax(board, depth + 1, true);
                    board[i] = "";
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    function checkWinnerForMinimax() {
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }

        if (board.every(cell => cell !== "")) {
            return "tie";
        }

        return null;
    }

    darkModeBtn.addEventListener("click", () => {
        darkMode = !darkMode;
        document.body.classList.toggle('dark-mode', darkMode);
    });
    professionalModeBtn.addEventListener("click", () => {
        professionalMode = !professionalMode;
        document.body.classList.toggle('professional-mode', professionalMode);
    });
    restartBtn.addEventListener("click", restartGame);
    playerVsPlayerBtn.addEventListener("click", () => { againstAI = false; restartGame(); });
    playerVsAIBtn.addEventListener("click", () => { againstAI = true; restartGame(); });

    startGame();
});
