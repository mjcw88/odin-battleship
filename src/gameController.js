import { Game } from "./classes/game.js";
import { Gameboard } from "./classes/gameboard.js";
import { setCurrentGame, getCurrentGame } from "./gameStateController.js";
import { showNewGameForm, resetButtonStates, setButtonStates, renderSingleGameBoard } from "./displayController.js";

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
            // rotateShipsInDock();
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
    }
}

// Helper Functions
function createHumanPlayer(game, playerName) {
    game.addPlayer(playerName, true);
    return game.getPlayer(playerName);
}

// Main functions
export function createGame(playerOneName, playerTwoName, difficulty, playerCount) {
    resetButtonStates();

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

    setButtonStates(playerCount, btns);
    const squares = renderSingleGameBoard(playerOne);
}