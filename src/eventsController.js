import { updateGameBoard, renderWinner } from "./uiController.js";

export function addBoardClickEvent(btn, game) {
    btn.addEventListener("click", () => {
        if (game.winner || !game.playerOneTurn) return;

        const row = parseInt(btn.dataset.rowIndex);
        const col = parseInt(btn.dataset.colIndex);

        const cpuPlayer = game.getPlayer("CPU");
        const cpuBoard = cpuPlayer.gameboard;
        if (cpuBoard.board[row][col].hit) return;

        game.playHumanTurn(row, col);
        updateGameBoard(btn, cpuBoard, row, col);
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
            const boardDisplay = document.querySelectorAll(".human-board-square");
            const cell = Array.from(boardDisplay).find(square => 
                square.dataset.rowIndex == cpuRow && square.dataset.colIndex == cpuCol
            );
            updateGameBoard(cell, humanBoard, cpuRow, cpuCol);

            if (humanBoard.isAllSunk()) {
                game.declareWinner(cpuPlayer);
                renderWinner(game.winner);
            }

            game.flipPlayerOneTurn();
        }
    });
}