import { Game } from "./classes/game.js";
import { renderGameBoard, updateShipDisplay, renderWinner, renderShips } from "./displayController.js";

export function createGame(playerOneName, difficulty) {
    const game = new Game(difficulty);
    game.addPlayer(playerOneName, true);
    const player = game.getPlayer(playerOneName);

    const randomiseBtn = document.getElementById("randomise-ships-btn");
    randomiseBtn.hidden = false;

    const startGameBtn = document.getElementById("start-game-btn");
    startGameBtn.hidden = false;

    randomiseBtn.addEventListener("click", () => {
        randomiseClickEvent(game, player, startGameBtn);
    })

    renderGameBoard(game);
}

export function randomiseClickEvent(game, player, startGameBtn) {
    game.randomiseShipPlacement(player);
    renderGameBoard(game);
    if (isShipsOnBoard(player.gameboard, game)) {
        startGameBtn.disabled = false;
        startGameBtn.addEventListener("click", () => {
            startGameClickEvent(game);
        })
    };
}

export function isShipsOnBoard(gameboard, game) {
    return gameboard.ships.length === game.ships.length;
}

export function startGameClickEvent(game) {
    if (game.players.length >= 2) return;

    const randomiseBtn = document.getElementById("randomise-ships-btn");
    randomiseBtn.hidden = true;

    const startGameBtn = document.getElementById("start-game-btn");
    startGameBtn.hidden = true;

    const restartBtn = document.getElementById("restart-game-btn");
    restartBtn.hidden = false;

    const newGameBtn = document.getElementById("new-game-btn");
    newGameBtn.hidden = false;

    game.addPlayer();
    const cpuPlayer = game.getPlayer("CPU");
    game.randomiseShipPlacement(cpuPlayer);
    const cpuSquares = renderGameBoard(game);
    cpuSquares.forEach(square => {
        square.addEventListener("click", () => {
            playTurnClickEvent(square, game);
        })
    })
}

export function playTurnClickEvent(btn, game) {
    if (game.winner || !game.playerOneTurn) return;

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
        const square = game.playComputerTurn(humanPlayer);
        const cpuRow = square[0];
        const cpuCol = square[1];
        const humanBoard = humanPlayer.gameboard;
        const humanBoardDisplay = document.querySelectorAll(".human-board-square");
        updateShipDisplay(humanBoardDisplay, humanBoard.board, cpuRow, cpuCol);
        if (humanBoard.isAllSunk()) {
            game.declareWinner(cpuPlayer);
            renderWinner(game.winner);
            renderShips(game.winner.gameboard.board, cpuBoardDisplay);
        }
        game.flipPlayerOneTurn();
    }
}