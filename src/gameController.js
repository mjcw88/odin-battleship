import { Game } from "./classes/game.js";
import { Gameboard } from "./classes/gameboard.js";
import { setCurrentGame, getCurrentGame } from "./gameStateController.js";
import { showNewGameForm, renderButtons, renderSingleGameBoard, renderShipPlacement, renderMultipleGameBoards } from "./displayController.js";
import { createDragEventListenersForBoard, createShipDock, rotateShipsInDock, setOrientationStyling, setDoneBtn, setStartBtn } from "./dragController.js"

export const eventListeners = {
    init() {
        const btns = document.querySelectorAll(".multi-player-btn");
        const btnArray = Array.from(btns);
        const getBtn = (action) => btnArray.find(b => b.dataset.action === action);

        const newGameBtn = getBtn("new");
        const randomiseBtn = getBtn("randomise");
        const rotateBtn = getBtn("rotate");
        const startGameBtn = getBtn("start");
        const restartBtn = getBtn("restart");
        const doneBtn = getBtn("done");
        
        newGameBtn.addEventListener("click", () => {
            showNewGameForm();
        })

        randomiseBtn.addEventListener("click", () => {
            randomiseClickEvent(getCurrentGame(), startGameBtn, doneBtn);
        });

        restartBtn.addEventListener("click", () => {
            restartGame(getCurrentGame());
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

        document.body.addEventListener("keydown", (e) => {
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
    game.addPlayer(playerName, true);
    return game.getPlayer(playerName);
}

function resetDockState() {
    const dock = document.getElementById("ship-dock-container");
    dock.style.display = "block";
}

function setGameBtns() {
    const hidden = ["randomise-btn", "rotate-btn", "start-game-btn", "done-btn"];

    const btns = document.querySelectorAll(".multi-player-btn");
    btns.forEach(btn => {
        btn.disabled = hidden.includes(btn.id);
        btn.hidden = hidden.includes(btn.id);
    });
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

    const isEmpty = innerShipContainers.every(container =>
        container.children.length === 0
    );

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

function startGameClickEvent(game) {
    if(!game) return;

    const playerCount = game.getHumanPlayerCount();
    if (playerCount === 1 && game.players.length >= 2) return;

    if (playerCount === 1) {
        game.addPlayer();
        const cpuPlayer = game.getPlayer("CPU");
        game.randomiseShipPlacement(cpuPlayer);
    }

    const squares = renderMultipleGameBoards(game, playerCount);
    const secondPlayerSquares = squares.secondPlayerSquares;
    secondPlayerSquares.forEach(square => {
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

function restartGame(game) {
    const playerCount = game.getHumanPlayerCount();
    const playerOneName = document.getElementById("player-1-name").textContent;
    const playerOne = game.getPlayer(playerOneName);
    const difficulty = game.difficulty;
    let playerTwoName = "";

    if (playerCount > 1) {
        playerTwoName = document.getElementById("player-2-name").textContent;
    }

    createGame(playerOneName, playerTwoName, difficulty, playerCount)
}