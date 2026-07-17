import { Game } from "./classes/game.js";
import { Gameboard } from "./classes/gameboard.js";
import { setCurrentGame, getCurrentGame } from "./gameStateController.js";
import { createDragEventListenersForBoard, 
    createShipDock, 
    rotateShipsInDock, 
    setOrientationStyling, 
    setDoneBtn, 
    setStartBtn } from "./dragController.js"
import { showNewGameForm, 
    renderButtons, 
    renderSingleGameBoard, 
    renderShipPlacement, 
    renderMultipleGameBoards, 
    renderTwoPlayerBetweenTurnsBoards,
    updateShipDisplay,
    renderWinner,
    revealShips,
    hideDock,
    showStartTurnDialog,
    removeClickableSquares } from "./displayController.js";

export const eventListeners = {
    init() {
        const btns = document.querySelectorAll(".multi-player-btn");
        const btnArray = Array.from(btns);
        const getBtn = (action) => btnArray.find(b => b.dataset.action === action);

        const newGameBtn = getBtn("new");
        const randomiseBtn = getBtn("randomise");
        const rotateBtn = getBtn("rotate");
        const startGameBtn = getBtn("start game");
        const restartBtn = getBtn("restart");
        const doneBtn = getBtn("done");
        const startTurnBtn = getBtn("start turn");
        const endTurnBtn = getBtn("end turn");

        const restartGameDialog = document.getElementById("restart-game-dialog");
        const closeRestart = document.getElementById("close-restart-game-btn");
        const yesRestartBtn = document.getElementById("yes-restart-game-btn");
        const noRestartBtn = document.getElementById("no-restart-game-btn");
        const closeBtnContainer = document.getElementById("close-new-game-container");
        
        newGameBtn.addEventListener("click", () => {
            closeBtnContainer.style.display = "flex";
            showNewGameForm();
        })

        randomiseBtn.addEventListener("click", () => {
            randomiseClickEvent(getCurrentGame(), startGameBtn, doneBtn);
        });

        restartBtn.addEventListener("click", () => {
            restartGameDialog.showModal();
        })

        closeRestart.addEventListener("click", () => {
            restartGameDialog.close();
        })

        yesRestartBtn.addEventListener("click", () => {            
            restartGameDialog.close();
            restartGame(getCurrentGame());
        })

        noRestartBtn.addEventListener("click", () => {
            restartGameDialog.close();
        })

        rotateBtn.addEventListener("click", () => {
            rotateShipsInDock();
        })

        startGameBtn.addEventListener("click", () => {
            startGameClickEvent(getCurrentGame());
        })

        doneBtn.addEventListener("click", () => {
            const game = getCurrentGame();
            if (!game) return;

            const playerCount = game.getHumanPlayerCount();
            if (playerCount > 1) {
                doneBtnClickEvent(playerCount, game);
            }
        })

        startTurnBtn.addEventListener("click", () => {
            const game = getCurrentGame();
            if (!game) return;

            const startTurn = document.getElementById("start-turn-dialog");
            startTurn.close();
            game.turnFinished = false;
            setGameBoards(game, game.getHumanPlayerCount());
        })

        endTurnBtn.addEventListener("click", () => {
            const game = getCurrentGame();
            if (!game || game.winner) return;

            game.flipPlayerOneTurn();
            showStartTurnDialog(game.playerOneTurn);
            renderTwoPlayerBetweenTurnsBoards(game);
        })

        document.body.addEventListener("keydown", (e) => {
            if (document.querySelector("dialog[open]")) return;
            handleKeyboardPress(e, startGameBtn, doneBtn)
        });
    }
}

// Helper Functions
function handleKeyboardPress(e, startGameBtn, doneBtn) {
    if (e.key.toLowerCase() === "q") {
        rotateShipsInDock();
    }

    if (e.key.toLowerCase() === "r") {
        randomiseClickEvent(getCurrentGame(), startGameBtn, doneBtn);
    }
}

function resetButtonStates() {
    const disabled = ["done-btn", "start-game-btn", "restart-game-btn"];

    const btns = document.querySelectorAll(".multi-player-btn");
    btns.forEach(btn => {
        btn.hidden = true;
        btn.disabled = disabled.includes(btn.id);
    });
}

function createHumanPlayer(game, playerName) {
    return game.addPlayer(playerName, true);
}

function resetDockState() {
    const dock = document.getElementById("ship-dock-container");
    // dock.style.display = "block";
}

function setGameBoards(game, playerCount) {
    const squares = renderMultipleGameBoards(game, playerCount);

    let clickableSquares;
    if (game.playerOneTurn) clickableSquares = squares.secondPlayerSquares;
    else clickableSquares = squares.firstPlayerSquares;
    
    clickableSquares.forEach(square => {
        square.addEventListener("click", () => {
            playTurnClickEvent(square, game);
        })
    })

    const shipDock = document.getElementById("ship-dock-container");
    shipDock.innerHTML = "";
    shipDock.hidden = true;
    shipDock.style.display = "none";

    setGameBtns();
}

function setGameBtns() {
    const hidden = [
        "randomise-btn", 
        "rotate-btn", 
        "start-game-btn", 
        "done-btn", 
        "end-turn-btn"
    ];

    const btns = document.querySelectorAll(".multi-player-btn");
    btns.forEach(btn => {
        btn.disabled = hidden.includes(btn.id);
        btn.hidden = hidden.includes(btn.id);
    });
}

function playSinglePlayerTurn(btn, game) {
    if (!game.playerOneTurn) return;

    const row = parseInt(btn.dataset.rowIndex);
    const col = parseInt(btn.dataset.colIndex);

    const cpuPlayer = game.getPlayer("CPU");
    const cpuBoard = cpuPlayer.gameboard;
    if (cpuBoard.board[row][col].hit) return;

    game.playHumanTurn(row, col);
    const cpuBoardDisplay = document.querySelectorAll(".cpu-board-square");
    updateShipDisplay(cpuBoardDisplay, cpuBoard.board, row, col);
    game.flipPlayerOneTurn();

    const humanName = document.getElementById("player-1-name").textContent;
    const humanPlayer = game.getPlayer(humanName);
    if (cpuBoard.isAllSunk()) {
        game.declareWinner(humanPlayer);
        renderWinner(game.winner);
    } else {
        const WAIT = 500;
        setTimeout(() => {
            const square = game.playComputerTurn(humanPlayer);
            const cpuRow = square[0];
            const cpuCol = square[1];
            const humanBoard = humanPlayer.gameboard;
            const humanBoardDisplay = document.querySelectorAll(".human-board-square");
            updateShipDisplay(humanBoardDisplay, humanBoard.board, cpuRow, cpuCol);
            if (humanBoard.isAllSunk()) {
                game.declareWinner(cpuPlayer);
                renderWinner(game.winner);
                revealShips(game.winner.gameboard.board, cpuBoardDisplay);
            }
            game.flipPlayerOneTurn();
        }, WAIT);
    }
}

function playMultiPlayerTurn(btn, game) {
    if (game.turnFinished) return;
    const row = parseInt(btn.dataset.rowIndex);
    const col = parseInt(btn.dataset.colIndex);

    let currentPlayerName, enemyPlayerName;
    if (game.playerOneTurn) {
        currentPlayerName = document.getElementById("player-1-name").textContent
        enemyPlayerName = document.getElementById("player-2-name").textContent
    } else {
        currentPlayerName = document.getElementById("player-2-name").textContent
        enemyPlayerName = document.getElementById("player-1-name").textContent
    };

    const enemyPlayer = game.getPlayer(enemyPlayerName);
    const enemyBoard = enemyPlayer.gameboard;
    if (enemyBoard.board[row][col].hit) return;

    game.playHumanTurn(row, col, enemyPlayerName);
    const enemyBoardDisplay = document.querySelectorAll(".enemy-board-square");
    updateShipDisplay(enemyBoardDisplay, enemyBoard.board, row, col);

    const currentPlayer = game.getPlayer(currentPlayerName);
    if (enemyPlayer.gameboard.isAllSunk()) {
        game.declareWinner(currentPlayer);
        renderWinner(game.winner);
    } else {

    }
    removeClickableSquares();
    const endTurnBtn = document.getElementById("end-turn-btn");
    endTurnBtn.hidden = false;
    endTurnBtn.disabled = false;
    game.turnFinished = true;
}

// Main functions
export function createGame(playerOneName, playerTwoName, difficulty, playerCount) {
    resetButtonStates();
    resetDockState();

    document.getElementById("main-contents-container").hidden = false;
    document.getElementById("ship-dock-container").hidden = false;

    const game = new Game(difficulty);
    setCurrentGame(game);
    const playerOne = createHumanPlayer(game, playerOneName);
    game.currentPlayer = playerOne;

    let btns, playerTwo;
    if (playerCount === 1) {
        btns = document.querySelectorAll(".single-player-btn");
    } else {
        playerTwo = createHumanPlayer(game, playerTwoName);
        btns = document.querySelectorAll(".multi-player-btn");
    }

    renderButtons(playerCount, btns);
    const squares = renderSingleGameBoard(playerOne);
    const dragController = createDragEventListenersForBoard(squares, playerOne, game);
    createShipDock(game, dragController);
}

function randomiseClickEvent(game, startGameBtn, doneBtn) {
    const innerShipContainers = Array.from(document.querySelectorAll(".inner-ship-container"));
    const isEmpty = innerShipContainers.every(container => container.children.length === 0);
    if (isEmpty) return;

    const player = game.currentPlayer;
    const ships = game.randomiseShipPlacement(player);
    
    ships.forEach(ship => {
        const size = ship.size;
        const index = innerShipContainers.findIndex((s) => s.children.length === size);
        const container = innerShipContainers.splice(index, 1)[0];
        const row = ship.start[0];
        const col = ship.start[1];
        const isVertical = ship.start[0] !== ship.end[0];
        container.dataset.isVertical = Number(isVertical);
        setOrientationStyling(isVertical, container, size)
        renderShipPlacement(container, row, col, isVertical, size, player.name);
    })

    if (game.getHumanPlayerCount() > 1) setDoneBtn(doneBtn, player.gameboard, game);
    setStartBtn(startGameBtn, player.gameboard, game);
}

function doneBtnClickEvent(playerCount, game) {
    if (playerCount < 1) return;

    const doneBtn = document.getElementById("done-btn")
    doneBtn.hidden = true;
    doneBtn.disabled = true;
    
    const startGameBtn = document.getElementById("start-game-btn");
    startGameBtn.hidden = false;

    const nextPlayer = game.players.find(p => p !== game.currentPlayer);
    game.currentPlayer = nextPlayer;

    const squares = renderSingleGameBoard(nextPlayer);
    const dragController = createDragEventListenersForBoard(squares, nextPlayer, game);

    // document.getElementById("ship-dock-container").style.display = "block";
    createShipDock(game, dragController);
    setDoneBtn(doneBtn, nextPlayer.gameboard, game);
    setStartBtn(startGameBtn, nextPlayer.gameboard, game);
}

function startGameClickEvent(game) {
    if(!game) return;

    const playerCount = game.getHumanPlayerCount();

    if (playerCount === 1) {
        const cpuPlayer = game.addPlayer();
        game.randomiseShipPlacement(cpuPlayer);
        setGameBoards(game, playerCount);
    } else {
        hideDock();
        renderTwoPlayerBetweenTurnsBoards(game);
        showStartTurnDialog(game.playerOneTurn);
    }
}

function restartGame(game) {
    const playerOneName = document.getElementById("player-1-name").textContent;
    const playerTwoName = document.getElementById("player-2-name").textContent;
    const difficulty = game.difficulty;
    const playerCount = game.getHumanPlayerCount();
    
    createGame(playerOneName, playerTwoName, difficulty, playerCount);
}

function playTurnClickEvent(btn, game) {
    if (game.winner) return;

    if (game.getHumanPlayerCount() === 1) {
        playSinglePlayerTurn(btn, game);
    } else {
        playMultiPlayerTurn(btn, game);
    }
}