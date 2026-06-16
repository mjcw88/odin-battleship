export function updateGameBoard(square, board, row, col) {
    if (board.board[row][col].ship) {
        square.classList.add("board-hit");
    } else {
        square.classList.add("board-miss");
    }
}

export function renderWinner(player) {
    const name = player.name;
    console.log(`A winner is you, ${name}!`);
}