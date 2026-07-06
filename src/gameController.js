import { Game } from "./classes/game.js";
import { Gameboard } from "./classes/gameboard.js";
import { setCurrentGame, getCurrentGame } from "./gameStateController.js";
import { showNewGameForm, renderButtonStates, renderSingleGameBoard } from "./displayController.js";
import { createDragEventListenersForBoard, createShipDock, rotateShipsInDock } from "./dragController.js"

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
            // randomiseClickEvent(getCurrentGame(), startGameBtn, doneBtn);
        });

        restartBtn.addEventListener("click", () => {
            // restartGame(getCurrentGame(), ...);
        })

        rotateBtn.addEventListener("click", () => {
            rotateShipsInDock();
        })

        startGameBtn.addEventListener("click", () => {
            // startGameClickEvent(getCurrentGame());
        })

        doneBtn.addEventListener("click", () => {
            const game = getCurrentGame(); // checked fresh, at click time
            if (game?.getHumanPlayerCount() > 1) {
                // doneBtnClickEvent(game, playerCount, playerTwoName, doneBtn, startGameBtn, randomiseBtn);
            }
        })

        document.body.addEventListener("keydown", handleKeyboardPress);
    }
}

// Helper Functions
function handleKeyboardPress(e) {
    if (e.key.toLowerCase() === "q") {
        rotateShipsInDock();
    }
}

function createHumanPlayer(game, playerName) {
    game.addPlayer(playerName, true);
    return game.getPlayer(playerName);
}

function resetButtonStates() {
    const disabled = ["done-btn", "start-game-btn", "restart-game-btn"];

    const btns = document.querySelectorAll(".multi-player-btn");
    btns.forEach(btn => {
        btn.hidden = true;
        btn.disabled = disabled.includes(btn.id);
    });
}

function resetDockState() {
    const dock = document.getElementById("ship-dock-container");
    dock.style.display = "block";
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

    renderButtonStates(playerCount, btns);
    const squares = renderSingleGameBoard(playerOne);
    const dragController = createDragEventListenersForBoard(squares, playerOne, game);
    createShipDock(game, dragController);
}