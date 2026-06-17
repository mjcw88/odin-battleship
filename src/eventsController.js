import { updateGameBoard, renderWinner } from "./uiController.js";

export function addBoardClickEvent(btn, game) {
    btn.addEventListener("click", () => {
        if (game.winner || !game.playerOneTurn) return;

        const row = parseInt(btn.dataset.rowIndex);
        const col = parseInt(btn.dataset.colIndex);
        game.playHumanTurn(row, col);

        const cpu = game.getCpuPlayerIndex();
        const cpuBoard = game.getPlayerBoard(cpu);
        updateGameBoard(btn, cpuBoard, row, col);

        if (game.winner) {
            renderWinner(game.winner);
        } else {
            const square = game.playComputerTurn();
            const cpuRow = square[0];
            const cpuCol = square[1];
            const human = game.getHumanPlayerIndex();
            const humanBoard = game.getPlayerBoard(human);
            const boardDisplay = document.querySelectorAll(".human-board-square");
            const cell = Array.from(boardDisplay).find(square => 
                square.dataset.rowIndex == cpuRow && square.dataset.colIndex == cpuCol
            );
            updateGameBoard(cell, humanBoard, cpuRow, cpuCol);
        }
    });
}