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
    removeClickableSquares,
    resetDisplays,
    setDisplays,
    renderMessage,
    renderDisplayStyling } from "./displayController.js";

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

        const helpBtn = document.getElementById("help-btn");
        const helpDialog = document.getElementById("help-dialog");
        const closeHelpBtn = document.getElementById("close-help-btn");
        
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
            startTurnClickEvent();
        })

        endTurnBtn.addEventListener("click", () => {
            endTurnClickEvent();
        })

        helpBtn.addEventListener("click", () => {
            helpDialog.showModal();
        })

        closeHelpBtn.addEventListener("click", () => {
            helpDialog.close();
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

    const dock = document.getElementById("ship-dock-container");
    dock.hidden = true;
    dock.style.display = "none";

    setGameBtns();
}

function setGameBtns() {
    const hidden = [
        "randomise-btn", 
        "rotate-btn", 
        "start-game-btn", 
        "done-btn", 
    ];

    const btns = document.querySelectorAll(".multi-player-btn");
    btns.forEach(btn => {
        btn.disabled = hidden.includes(btn.id);
        btn.hidden = hidden.includes(btn.id);
    });

    document.getElementById("end-turn-btn").disabled = true;
}

function playSinglePlayerTurn(btn, game) {
    if (!game.playerOneTurn) return;

    const WAIT = 1000;

    const row = parseInt(btn.dataset.rowIndex);
    const col = parseInt(btn.dataset.colIndex);

    const cpuPlayer = game.getPlayer("CPU");
    const cpuBoard = cpuPlayer.gameboard;
    if (cpuBoard.board[row][col].hit) return;

    game.playHumanTurn(row, col);
    const cpuBoardDisplay = document.querySelectorAll(".cpu-board-square");
    let sunk = updateShipDisplay(cpuBoardDisplay, cpuBoard.board, row, col, game);
    let resetWait = sunk ? WAIT * 2 : WAIT;

    game.flipPlayerOneTurn();

    const humanName = document.getElementById("player-1-name").textContent;
    const humanPlayer = game.getPlayer(humanName);

    if (cpuBoard.isAllSunk()) {
        game.declareWinner(humanPlayer);
        renderDisplayStyling("win-background", "win-text");
        renderWinner(game.winner);
        return;
    }
    setTimeout(() => {
        renderDisplayStyling("player-turn-background", "player-turn-text");
        renderMessage("CPU's turn");

        setTimeout(() => {
            const square = game.playComputerTurn(humanPlayer);
            const cpuRow = square[0];
            const cpuCol = square[1];
            const humanBoard = humanPlayer.gameboard;
            const humanBoardDisplay = document.querySelectorAll(".human-board-square");
            sunk = updateShipDisplay(humanBoardDisplay, humanBoard.board, cpuRow, cpuCol, game);

            if (humanBoard.isAllSunk()) {
                game.declareWinner(cpuPlayer);
                renderDisplayStyling("win-background", "win-text");
                renderWinner(game.winner);
                revealShips(game.winner.gameboard.board, cpuBoardDisplay);
                return;
            }

            resetWait = sunk ? WAIT * 2 : WAIT;

            setTimeout(() => {
                game.flipPlayerOneTurn();
                renderDisplayStyling("player-turn-background", "player-turn-text");
                renderMessage(`${humanName}'s turn`);
            }, resetWait);
        }, WAIT);
    }, resetWait);
}

function playMultiPlayerTurn(btn, game) {
    if (game.turnFinished) return;

    const row = parseInt(btn.dataset.rowIndex);
    const col = parseInt(btn.dataset.colIndex);

    let currentPlayerName, enemyPlayerName;
    if (game.playerOneTurn) {
        currentPlayerName = document.getElementById("player-1-name").textContent;
        enemyPlayerName = document.getElementById("player-2-name").textContent;
    } else {
        currentPlayerName = document.getElementById("player-2-name").textContent;
        enemyPlayerName = document.getElementById("player-1-name").textContent;
    };

    const enemyPlayer = game.getPlayer(enemyPlayerName);
    const enemyBoard = enemyPlayer.gameboard;
    if (enemyBoard.board[row][col].hit) return;

    game.playHumanTurn(row, col, enemyPlayerName);
    const enemyBoardDisplay = document.querySelectorAll(".enemy-board-square");
    updateShipDisplay(enemyBoardDisplay, enemyBoard.board, row, col, game);

    const currentPlayer = game.getPlayer(currentPlayerName);
    if (enemyPlayer.gameboard.isAllSunk()) {
        game.declareWinner(currentPlayer);
        renderDisplayStyling("win-background", "win-text");
        renderWinner(game.winner);
    }
    removeClickableSquares();
    const endTurnBtn = document.getElementById("end-turn-btn");
    endTurnBtn.disabled = false;
    game.turnFinished = true;
}

// Main functions
export function createGame(playerOneName, playerTwoName, difficulty, playerCount) {
    resetButtonStates();
    resetDisplays();

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
        container.classList.remove("inner-ship-container-shipyard");
        Array.from(container.children).forEach(square => {
            square.classList.remove("shipyard-square");
        })

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
    
    document.getElementById("start-game-btn-container").style.display = "flex";
    const startGameBtn = document.getElementById("start-game-btn");
    startGameBtn.hidden = false;

    const nextPlayer = game.players.find(p => p !== game.currentPlayer);
    game.currentPlayer = nextPlayer;

    const squares = renderSingleGameBoard(nextPlayer);
    const dragController = createDragEventListenersForBoard(squares, nextPlayer, game);

    createShipDock(game, dragController);
    setDoneBtn(doneBtn, nextPlayer.gameboard, game);
    setStartBtn(startGameBtn, nextPlayer.gameboard, game);
}

function startTurnClickEvent() {
    const game = getCurrentGame();
    if (!game) return;

    document.getElementById("start-turn-dialog").close();
    game.turnFinished = false;
    setGameBoards(game, game.getHumanPlayerCount());

    document.getElementById("bottom-buttons-container").style.display = "flex";
    const endTurnBtn = document.getElementById("end-turn-btn");
    endTurnBtn.disabled = true;
    endTurnBtn.hidden = false;

    document.getElementById("display-container").style.display = "flex";

    let playerName;
    if (game.playerOneTurn) playerName = document.getElementById("player-1-name").textContent;
    else playerName = document.getElementById("player-2-name").textContent;
    const message =`${playerName}'s turn`;
    renderDisplayStyling("player-turn-background", "player-turn-text");
    renderMessage(message);
}

function endTurnClickEvent() {
    const game = getCurrentGame();
    if (!game || game.winner) return;

    game.flipPlayerOneTurn();
    showStartTurnDialog(game.playerOneTurn);
    renderTwoPlayerBetweenTurnsBoards(game);
}

function startGameClickEvent(game) {
    if(!game) return;

    const playerCount = game.getHumanPlayerCount();

    if (playerCount === 1) {
        const cpuPlayer = game.addPlayer();
        game.randomiseShipPlacement(cpuPlayer);
        setGameBoards(game, playerCount);
        const playerName = document.getElementById("player-1-name").textContent;
        const message = `${playerName}'s turn`;
        renderMessage(message);
        renderDisplayStyling("player-turn-background", "player-turn-text");
        document.getElementById("display-container").style.display = "flex";
    } else {
        hideDock();
        renderTwoPlayerBetweenTurnsBoards(game);
        showStartTurnDialog(game.playerOneTurn);
    }
    setDisplays(playerCount);
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