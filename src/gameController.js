import { Game } from "./classes/game.js";
import { renderGameBoard, updateShipDisplay, renderWinner, renderShips } from "./displayController.js";

export function createGame(playerOneName, difficulty) {
    const game = new Game(difficulty);
    game.addPlayer(playerOneName, true);
    game.addPlayer();
    game.randomiseShipPlacement(game.getPlayer("CPU"));
    game.randomiseShipPlacement(game.getPlayer(playerOneName));
    const cpuSquares = renderGameBoard(game);
    cpuSquares.forEach(square => {
        playTurnClickEvent(square, game);
    })
}

export function playTurnClickEvent(btn, game) {
        btn.addEventListener("click", () => {
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
    });
}