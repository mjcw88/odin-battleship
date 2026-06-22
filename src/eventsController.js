import { renderGameBoard } from "./displayController.js"
import { updateShipDisplay, renderWinner, renderShips } from "./uiController.js";
import { humanPlayer, cpuPlayer, game } from "./index.js";

export const eventListeners = {
    init(game, humanPlayer, cpuPlayer) { 
        const randomiseBtn = document.getElementById("randomise-ships-btn");
        randomiseBtn.addEventListener("click", () => {
            game.randomiseShipPlacement(humanPlayer);
            game.randomiseShipPlacement(cpuPlayer);
            renderGameBoard(game);
            game.playerOneTurn = true;
            game.winner = null;
        })
    }
}

export function addBoardClickEvent(btn, game) {
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

        const humanPlayer = game.getPlayer("Human");
        if (cpuBoard.isAllSunk()) {
            game.declareWinner(humanPlayer);
            renderWinner(game.winner);
        } else {
            const square = game.playComputerTurn();
            const cpuRow = square[0];
            const cpuCol = square[1];
            const humanName = humanPlayer.name;
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