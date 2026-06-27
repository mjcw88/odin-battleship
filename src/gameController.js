import { Game } from "./classes/game.js";
import { Gameboard } from "./classes/gameboard.js";
import { renderGameBoard, updateShipDisplay, renderWinner, renderShips } from "./displayController.js";

export function createGame(playerOneName, difficulty) {
    const hiddenBtns = [];
    const unhiddenBtns = [];

    const game = new Game(difficulty);
    game.addPlayer(playerOneName, true);
    const player = game.getPlayer(playerOneName);

    const randomiseBtn = document.getElementById("randomise-ships-btn");
    const startGameBtn = document.getElementById("start-game-btn");
    hiddenBtns.push(randomiseBtn);
    hiddenBtns.push(startGameBtn);

    const restartBtn = document.getElementById("restart-game-btn");
    const newGameBtn = document.getElementById("new-game-btn");
    unhiddenBtns.push(restartBtn);
    unhiddenBtns.push(newGameBtn);

    randomiseBtn.addEventListener("click", () => {
        randomiseClickEvent(game, player, startGameBtn);
    })

    restartGame(game, hiddenBtns, unhiddenBtns);
    renderGameBoard(game);
}

export function randomiseClickEvent(game, player, startGameBtn) {
    game.randomiseShipPlacement(player);
    renderGameBoard(game);
    if (isAllShipsOnBoard(player.gameboard, game)) {
        startGameBtn.disabled = false;
        startGameBtn.addEventListener("click", () => {
            startGameClickEvent(game);
        })
    };
}

export function isAllShipsOnBoard(gameboard, game) {
    return gameboard.ships.length === game.ships.length;
}

export function startGameClickEvent(game) {
    if (game.players.length >= 2) return;

    const hiddenBtns = [];
    const unhiddenBtns = [];

    const randomiseBtn = document.getElementById("randomise-ships-btn");
    const startGameBtn = document.getElementById("start-game-btn");
    hiddenBtns.push(randomiseBtn);
    hiddenBtns.push(startGameBtn);

    hiddenBtns.forEach(btn => {
        btn.hidden = true;
    })

    const restartBtn = document.getElementById("restart-game-btn");
    const newGameBtn = document.getElementById("new-game-btn");
    unhiddenBtns.push(restartBtn);
    unhiddenBtns.push(newGameBtn);

    unhiddenBtns.forEach(btn => {
        btn.hidden = false;
    })

    game.addPlayer();
    const cpuPlayer = game.getPlayer("CPU");
    game.randomiseShipPlacement(cpuPlayer);
    const cpuSquares = renderGameBoard(game);
    cpuSquares.forEach(square => {
        square.addEventListener("click", () => {
            playTurnClickEvent(square, game);
        })
    })

    restartBtn.addEventListener("click", () => {
        restartGame(game, hiddenBtns, unhiddenBtns);
    })

    newGameBtn.addEventListener("click", () => {
        showNewGameForm();
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

export function restartGame(game, hiddenBtns, unhiddenBtns) {
    game.players.splice(1);
    game.playerOneTurn = true;
    game.winner = null;
    const player = game.players[0];
    player.gameboard = new Gameboard();
    hiddenBtns.forEach(btn => {
        if (btn.id === "start-game-btn") btn.disabled = true;
        btn.hidden = false;
    })
    unhiddenBtns.forEach(btn => {
        btn.hidden = true;
    })
    renderGameBoard(game);
}

export function showNewGameForm() {
    const newGameForm = document.getElementById("new-game-form");
    const closeBtn = document.getElementById("close-new-game-btn");

    closeBtn.hidden = false;
    newGameForm.showModal();
}