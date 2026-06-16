import { updateGameBoard, renderWinner } from "./uiController.js";

export function addBoardClickEvent(btn, game) {
    btn.addEventListener("click", () => {
        if (game.winner || !game.playerOneTurn) return;
        const row = parseInt(btn.dataset.rowIndex);
        const col = parseInt(btn.dataset.colIndex);
        game.playHumanTurn(row, col);
        updateGameBoard(btn, game.getEnemyBoard(), row, col);
        if (game.winner) renderWinner(game.winner);
    });
}