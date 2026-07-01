export function renderShipDock(ships, playerName) {
    playerName = playerName.replace(/ /g, "-").toLowerCase();

    const dock = document.getElementById("ship-dock-container");
    dock.innerHTML = "";

    let count = 1;
    ships.forEach((ship, index) => {
        const outerShipContainer = document.createElement("div");
        outerShipContainer.classList.add("outer-ship-container");

        const innerShipContainer = document.createElement("div");
        innerShipContainer.classList.add("inner-ship-container");

        innerShipContainer.dataset.isVertical = "0";
        innerShipContainer.draggable = true;
        innerShipContainer.style.gridTemplateColumns = `repeat(${ship}, var(--gridSize))`;
        for (let i = 0; i < ship; i++) {
            const square = document.createElement("div");
            square.classList.add("square-with-ship");
            square.dataset.shipIndex = index;
            square.dataset.isVertical = "0";
            innerShipContainer.append(square);
        }
        outerShipContainer.append(innerShipContainer);
        dock.append(outerShipContainer);
        count++;
    })
}

export function renderValidPlacement(beingDragged, e, humanSquares, boardSize, gameboard) {
    const isVertical = parseInt(beingDragged.dataset.isVertical) === 1;
    const shipSize = beingDragged.children.length;

    const row = parseInt(e.target.dataset.rowIndex);
    const col = parseInt(e.target.dataset.colIndex);

    const coordinates = [];
    for(let i = 0; i < shipSize; i++) {
        if (isVertical) coordinates.push([row + i, col]);
        else coordinates.push([row,col + i]);
    }

    let isValid = true;
    coordinates.forEach(coordinate => {
        const row = coordinate[0];
        const col = coordinate[1];
        if (row >= boardSize || col >= boardSize) isValid = false;
        const square = humanSquares.find(square => parseInt(square.dataset.rowIndex) === row && parseInt(square.dataset.colIndex) === col);
        if (square && gameboard[row][col].ship) isValid = false;
    })

    humanSquares.forEach(square => {
        square.classList.remove("valid-placement");
        square.classList.remove("invalid-placement");
        const squareRow = parseInt(square.dataset.rowIndex);
        const squareCol = parseInt(square.dataset.colIndex);
        if (coordinates.some(element => element[0] === squareRow && element[1] === squareCol)) {
            if (isValid) square.classList.add("valid-placement")
            else square.classList.add("invalid-placement")
        };
    })
}

export function clearValidPlacement(humanSquares) {
    humanSquares.forEach(square => {
        square.classList.remove("valid-placement");
        square.classList.remove("invalid-placement");
    })
}

export function renderShipPlacement(beingDragged, startingSquare, isVertical, shipSize, playerName) {
    const row = parseInt(startingSquare.dataset.rowIndex);
    const col = parseInt(startingSquare.dataset.colIndex);

    beingDragged.dataset.rowIndex = row;
    beingDragged.dataset.colIndex = col;
    beingDragged.style.gridColumn = `${col + 2} / span ${isVertical ? 1 : shipSize}`;
    beingDragged.style.gridRow = `${row + 2} / span ${isVertical ? shipSize : 1}`;

    const board = document.querySelector(`[data-player-board="${playerName}"]`);
    board.append(beingDragged);
}

export function renderGameBoard(game) {
    const contents = document.getElementById("main-contents");
    contents.innerHTML = "";

    const humanSquares = [];
    const cpuSquares = [];

    game.players.forEach((player, index) => {
        const playerContainer = document.createElement("div");
        playerContainer.classList.add("player-container");

        const playerHeader = document.createElement("div");
        playerHeader.classList.add("player-name");
        playerHeader.id = `player-${index + 1}-name`;
        playerHeader.textContent = player.name;

        const boardContainer = document.createElement("div");
        boardContainer.classList.add("board-container");

        const shipBoard = document.createElement("div");
        shipBoard.classList.add("ship-board");
        shipBoard.dataset.playerBoard = player.name;

        const board = document.createElement("div");
        board.classList.add("player-board");

        const LETTERS = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
        LETTERS.forEach(letter => {
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
                board.append(square);
                if (player.human) {
                    square.classList.add("human-board-square");
                    humanSquares.push(square);
                } else {
                    square.classList.add("cpu-board-square");
                    cpuSquares.push(square);                    
                }
            })
        })
        
        contents.append(playerContainer);
        boardContainer.append(shipBoard, board)
        playerContainer.append(playerHeader, boardContainer);
    })
    return { humanSquares, cpuSquares };
}

export function updateShipDisplay(squares, board, row, col) {
    const traverseBoard = function() {
        const TRAVERSE_DIRECTIONS = [-1,1];
        const visited = [];
        const queue = [{ row: row, col: col }];
        cell.classList.add("board-sunk");
        
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.some(v => v.row === current.row && v.col === current.col)) continue;
            visited.push({ row: current.row, col: current.col });

            TRAVERSE_DIRECTIONS.forEach(direction => {
                const dir = current.row + direction;
                if (dir < 0 || dir >= board.length) return;
                if (board[dir][current.col].ship === coordinate.ship) {
                    const cell = Array.from(squares).find(square => 
                        square.dataset.rowIndex == dir && square.dataset.colIndex == current.col
                    );
                    cell.classList.remove("board-hit");
                    cell.classList.add("board-sunk");
                    queue.push({ row: dir, col: current.col });
                }
            })

            TRAVERSE_DIRECTIONS.forEach(direction => {
                const dir = current.col + direction;
                if (dir < 0 || dir >= board.length) return;
                if (board[current.row][dir].ship === coordinate.ship) {
                    const cell = Array.from(squares).find(square => 
                        square.dataset.rowIndex == current.row && square.dataset.colIndex == dir
                    );
                    cell.classList.remove("board-hit");
                    cell.classList.add("board-sunk");
                    queue.push({ row: current.row, col: dir });
                }
            })
        }
    }

    const cell = Array.from(squares).find(square => 
        square.dataset.rowIndex == row && square.dataset.colIndex == col
    );

    const coordinate = board[row][col];
    if (coordinate.ship) {
        if (coordinate.ship.isSunk()) {
            traverseBoard();
        } else {
            cell.classList.add("board-hit");
        }
    } else {
        cell.classList.add("board-miss");
    }
}

export function renderWinner(player) {
    const name = player.name;
    console.log(`A winner is you, ${name}!`);
}

export function renderShips(board, squares) {
    board.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
            const cell = Array.from(squares).find(square => 
                square.dataset.rowIndex == rowIndex && square.dataset.colIndex == colIndex
            );
            if (col.ship !== null && !col.ship.isSunk()) cell.classList.add("square-with-ship");  
        })
    })
}