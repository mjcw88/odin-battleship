import { createNewGame } from "./gameController.js";

export function renderGameboard() {
    const contents = document.getElementById("main-contents");

    const game = createNewGame();
    game.forEach(player => {
        const playerContainer = document.createElement("div");
        playerContainer.className = "player-container";

        const playerHeader = document.createElement("div");
        playerHeader.className = "player-name";
        playerHeader.textContent = player.name;

        const board = document.createElement("div");
        board.className = "player-board";

        player.gameboard.board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const square = document.createElement("div");
                square.dataset.index = [rowIndex, colIndex];
                if (cell.ship) square.className = "square-with-ship";
                board.append(square);
            })

        })
        
        contents.append(playerContainer);
        playerContainer.append(playerHeader, board);
    })
}