import { updateGameBoard, renderWinner } from "./displayController.js";

export function addBoardClickEvent(btn, board, game) {
    btn.addEventListener("click", () => {
        if (game.winner) return;
        if (!game.playerOneTurn) return;
        game.playerOneTurn = false;
        const row = parseInt(btn.dataset.rowIndex);
        const col = parseInt(btn.dataset.colIndex);
        if (board.board[row][col].hit) return;
        board.recieveAttack(row, col);
        updateGameBoard(btn, board, row, col);
        if (board.isAllSunk()) {
            game.declareWinner(game.players[0]);
            renderWinner(game.winner);
        } else {
            game.playComputerTurn();
        }
    });
}