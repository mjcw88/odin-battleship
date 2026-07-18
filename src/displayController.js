// Helper functions
function renderBoardContainer(player, index = 0) {
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

    return { board: board, 
        playerContainer: playerContainer, 
        boardContainer: boardContainer, 
        shipBoard: shipBoard, 
        playerHeader: playerHeader 
    };
}

function renderBoardHeader(board) {
    const LETTERS = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    LETTERS.forEach(letter => {
        const square = document.createElement("div");
        square.classList.add("grid-label");
        square.textContent = letter;
        board.append(square);
    })
}

function renderSinglePlayerSquare(player, cell, square, firstPlayerSquares, secondPlayerSquares) {
    if (player.human && cell.ship) square.classList.add("square-with-ship");

    if (player.human) {
        square.classList.add("human-board-square");
        firstPlayerSquares.push(square);
    } else {
        square.classList.add("cpu-board-square");
        square.classList.add("clickable-square");
        secondPlayerSquares.push(square);                    
    }
}

function renderMultiPlayerSquares(cell, square, playerIndex, firstPlayerSquares, secondPlayerSquares, playerOneTurn) {
    const renderCurrentPlayersSquares = function() {
        square.classList.add("human-board-square");
        if (cell.ship) {
            if (cell.ship.isSunk()) {
                square.classList.add("board-sunk");
            } else if (cell.hit) {
                square.classList.add("board-hit");
            }
            square.classList.add("square-with-ship");
        } else if (cell.hit) {
            square.classList.add("board-miss");
        }
    }

    const renderEnemyPlayerSquares = function() {
        square.classList.add("enemy-board-square");
        square.classList.add("human-board-square");
        if (cell.ship) {
            if (cell.ship.isSunk()) {
                square.classList.add("board-sunk");
            } else if (cell.hit) {
                square.classList.add("board-hit");
            }
        } else if (!cell.ship && cell.hit) {
            square.classList.add("board-miss");
        } 

        if (!cell.hit) {
            square.classList.add("clickable-square");
        }
    }

    if (playerOneTurn && playerIndex === 0) {
        renderCurrentPlayersSquares();
    } else if (!playerOneTurn && playerIndex === 1) {
        renderCurrentPlayersSquares();
    } else {
        renderEnemyPlayerSquares();
    }

    if (playerIndex === 0) {
        firstPlayerSquares.push(square);
    } else {
        secondPlayerSquares.push(square);
    }
}

// Main functions
export function showNewGameForm() {
    const closeBtn = document.getElementById("close-new-game-btn");
    closeBtn.hidden = false;
    document.getElementById("player-count-dialog").showModal();
}

export function renderButtons(playerCount, btns) {
    btns.forEach(btn => {
        if (btn.dataset.action !== "restart") {
            btn.hidden = false;
        }
        
        if (playerCount > 1) {
            if (btn.dataset.action === "start game" || btn.dataset.action === "end turn") {
                btn.hidden = true
            };
        }
    });
}

export function renderShipDock(ships) {
    const container = document.getElementById("ship-dock-container");
    container.style.display = "flex";
    container.style.flexDirection = "column";

    const dock = document.getElementById("ship-container");
    dock.dataset.isVertical = "0";
    dock.style.flexDirection = "column";
    dock.innerHTML = "";

    ships.forEach(ship => {
        const outerShipContainer = document.createElement("div");
        outerShipContainer.classList.add("outer-ship-container");

        const innerShipContainer = document.createElement("div");
        innerShipContainer.classList.add("inner-ship-container");
        innerShipContainer.classList.add("inner-ship-container-shipyard");

        innerShipContainer.dataset.isVertical = "0";
        innerShipContainer.draggable = true;
        innerShipContainer.style.gridTemplateColumns = `repeat(${ship}, 1fr)`;
        for (let i = 0; i < ship; i++) {
            const square = document.createElement("div");
            square.classList.add("square-with-ship");
            square.classList.add("shipyard-square");
            innerShipContainer.append(square);
        }

        outerShipContainer.append(innerShipContainer);
        dock.append(outerShipContainer);
    })
}

export function renderShipPlacement(ship, row, col, isVertical, shipSize, playerName) {
    ship.dataset.rowIndex = row;
    ship.dataset.colIndex = col;
    ship.style.gridColumn = `${col + 2} / span ${isVertical ? 1 : shipSize}`;
    ship.style.gridRow = `${row + 2} / span ${isVertical ? shipSize : 1}`;

    const board = document.querySelector(`[data-player-board="${playerName}"]`);
    board.append(ship);
}

export function renderSingleGameBoard(player) {
    const contents = document.getElementById("main-board-contents");
    contents.innerHTML = "";

    const squares = [];

    const container = renderBoardContainer(player);
    const board = container.board;
    const playerContainer = container.playerContainer;
    const boardContainer = container.boardContainer;
    const shipBoard = container.shipBoard;
    const playerHeader = container.playerHeader;

    renderBoardHeader(board);

    player.gameboard.board.forEach((row, rowIndex) => {
        const square = document.createElement("div");
        square.classList.add("grid-label");
        square.textContent = rowIndex + 1;
        board.append(square);
        row.forEach((cell, colIndex) => {
            const square = document.createElement("div");
            square.classList.add("board-square");
            square.dataset.rowIndex = rowIndex;
            square.dataset.colIndex = colIndex;
            if (player.human && cell.ship) square.classList.add("square-with-ship");
            board.append(square);
            square.classList.add("human-board-square");
            squares.push(square);
        })
    })
        
    contents.append(playerContainer);
    boardContainer.append(shipBoard, board)
    playerContainer.append(playerHeader, boardContainer);

    return squares;
}

export function renderMultipleGameBoards(game, playerCount) {
    const contents = document.getElementById("main-board-contents");
    contents.innerHTML = "";

    const firstPlayerSquares = [];
    const secondPlayerSquares = [];

    game.players.forEach((player, playerIndex) => {
        const container = renderBoardContainer(player, playerIndex);
        const board = container.board;
        const playerContainer = container.playerContainer;
        const boardContainer = container.boardContainer;
        const playerHeader = container.playerHeader;

        renderBoardHeader(board);

        player.gameboard.board.forEach((row, rowIndex) => {
            const square = document.createElement("div");
            square.classList.add("grid-label");
            square.textContent = rowIndex + 1;
            board.append(square);
            row.forEach((cell, colIndex) => {
                const square = document.createElement("div");
                square.classList.add("board-square");
                square.dataset.rowIndex = rowIndex;
                square.dataset.colIndex = colIndex;
                if (playerCount === 1) {
                    renderSinglePlayerSquare(player, cell, square, firstPlayerSquares, secondPlayerSquares);
                } else {
                    renderMultiPlayerSquares(cell, square, playerIndex, firstPlayerSquares, secondPlayerSquares, game.playerOneTurn);
                }
                board.append(square);
            })
        })
        
        contents.append(playerContainer);
        boardContainer.append(board)
        playerContainer.append(playerHeader, boardContainer);
    })
    return { firstPlayerSquares: firstPlayerSquares, secondPlayerSquares: secondPlayerSquares };
}

export function renderTwoPlayerBetweenTurnsBoards(game) {
    const contents = document.getElementById("main-board-contents");
    contents.innerHTML = "";

    game.players.forEach((player, playerIndex) => {
        const container = renderBoardContainer(player, playerIndex);
        const board = container.board;
        const playerContainer = container.playerContainer;
        const boardContainer = container.boardContainer;
        const playerHeader = container.playerHeader;

        renderBoardHeader(board);

        player.gameboard.board.forEach((row, rowIndex) => {
            const square = document.createElement("div");
            square.classList.add("grid-label");
            square.textContent = rowIndex + 1;
            board.append(square);
            row.forEach(cell => {
                const square = document.createElement("div");
                square.classList.add("board-square");
                if (cell.ship) {
                    if (cell.ship.isSunk()) {
                        square.classList.add("board-sunk");
                    } else if (cell.hit) {
                        square.classList.add("board-hit");
                    }
                } else if (!cell.ship && cell.hit) {
                    square.classList.add("board-miss");
                }
                board.append(square);
            })
        })
        
        contents.append(playerContainer);
        boardContainer.append(board)
        playerContainer.append(playerHeader, boardContainer);
    })
}

export function showStartTurnDialog(playerOneTurn) {
    const startTurn = document.getElementById("start-turn-dialog");
    startTurn.showModal();

    let playerName;
    if (playerOneTurn) playerName = document.getElementById("player-1-name").textContent;
    else playerName = document.getElementById("player-2-name").textContent;

    const startTurnBtn = document.getElementById("start-turn-btn");
    startTurnBtn.textContent = `Start ${playerName}'s turn`;
}

export function hideDock() {
    const dock = document.getElementById("ship-dock-container");
    dock.hidden = true;
    dock.style.display = "none";
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
    cell.classList.remove("clickable-square");
}

export function removeClickableSquares() {
    const squares = document.querySelectorAll(".clickable-square");
    squares.forEach(square => {
        square.classList.remove("clickable-square");
    })
}

export function renderWinner(player) {
    const clickableSquares = document.querySelectorAll(".clickable-square");
    clickableSquares.forEach(square => {
        square.classList.remove("clickable-square");
    })
    
    const name = player.name;
    console.log(`A winner is you, ${name}!`);
}

export function revealShips(board, squares) {
    board.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
            const cell = Array.from(squares).find(square => 
                square.dataset.rowIndex == rowIndex && square.dataset.colIndex == colIndex
            );
            if (col.ship !== null && !col.ship.isSunk()) cell.classList.add("square-with-ship");  
        })
    })
}