import { addBoardClickEvent } from "./eventsController.js";

export function renderGameboard(game) {
    const contents = document.getElementById("main-contents");

    game.players.forEach(player => {
        const playerContainer = document.createElement("div");
        playerContainer.className = "player-container";

        const playerHeader = document.createElement("div");
        playerHeader.className = "player-name";
        playerHeader.textContent = player.name;

        const board = document.createElement("div");
        board.className = "player-board";

        const letters = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
        letters.forEach(letter => {
            const square = document.createElement("div");
            square.textContent = letter;
            board.append(square);
        })

        player.gameboard.board.forEach((row, rowIndex) => {
            const square = document.createElement("div");
            square.textContent = rowIndex + 1;
            board.append(square);
            row.forEach((cell, colIndex) => {
                const square = document.createElement("div");
                square.classList.add("board-square");
                square.dataset.rowIndex = rowIndex;
                square.dataset.colIndex = colIndex;
                if (player.human && cell.ship) square.classList.add("square-with-ship");
                //if (cell.ship) square.classList.add("square-with-ship");
                board.append(square);
                if (!player.human) {
                    square.classList.add("cpu-board-square");
                    addBoardClickEvent(square, game);
                } else {
                    square.classList.add("human-board-square");
                }
            })
        })
        
        contents.append(playerContainer);
        playerContainer.append(playerHeader, board);
    })
}