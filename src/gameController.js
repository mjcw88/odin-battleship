import { Game } from "./classes/game.js";
import { Gameboard } from "./classes/gameboard.js";
import { renderShipDock, renderValidPlacement, clearValidPlacement, renderShipPlacement, renderMultipleGameBoards, updateShipDisplay, renderWinner, revealShips, setOrientationStyling, renderSingleGameBoard } from "./displayController.js";

// Helper Functions
function createDragImage(target) {
    const dragImage = target.cloneNode(true);
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    document.body.appendChild(dragImage);
    return dragImage;
}

function setPointerEvents(beingDragged, event) {
    document.querySelectorAll(".ship-board .inner-ship-container").forEach(ship => {
        ship.style.pointerEvents = event;
    });

    beingDragged.style.pointerEvents = event;
}

function isAllShipsOnBoard(gameboard, game) {
    return gameboard.ships.length === game.ships.length;
}

function setDoneBtn(doneBtn, gameboard, game) {
    if (isAllShipsOnBoard(gameboard, game)) {
        doneBtn.disabled = false;
    } else {
        doneBtn.disabled = true;
    }
}

function setStartBtn(startGameBtn, gameboard, game) {
    if (isAllShipsOnBoard(gameboard, game)) {
        startGameBtn.disabled = false;
    } else {
        startGameBtn.disabled = true;
    }
}

function replaceShipOnBoard(beingDragged, board) {
    const isVertical = parseInt(beingDragged.dataset.isVertical) === 1;
    const size = beingDragged.children.length;

    const originalRow = parseInt(beingDragged.dataset.rowIndex);
    const originalCol = parseInt(beingDragged.dataset.colIndex);

    if (!isNaN(originalRow) && !isNaN(originalCol)) {
        const originalStart = [originalRow, originalCol];
        const originalEnd = isVertical ? [originalRow + size - 1, originalCol] : [originalRow, originalCol + size - 1];
        board.placeShip(originalStart, originalEnd, size)
    }
}

function createRandomiseButton(randomiseBtn, game, startGameBtn, doneBtn) {
    randomiseBtn.addEventListener("click", () => {
        randomiseClickEvent(game, startGameBtn, doneBtn);
    });
}

function createShipDock(game, dragController) {    
    renderShipDock(game.ships);

    const outerShipContainers = document.querySelectorAll(".outer-ship-container");
    outerShipContainers.forEach(container => {
        container.addEventListener("dragover", dragController.dragOver)
        container.addEventListener("drop", dragController.dragDropOnDock)
        container.addEventListener("dragend", dragController.dragEnd)
    })

    const ships = document.querySelectorAll(".inner-ship-container");
    ships.forEach(ship => {
        ship.addEventListener("dragstart", dragController.dragStart)
        ship.addEventListener("dragend", dragController.dragEnd)
    })
}

function createDragEventListenersForBoard(humanSquares, player, startGameBtn, game, boardSize) {
    const dragController = createDragController(
        player,
        game,
        humanSquares,
        startGameBtn,
        boardSize
    );

    humanSquares.forEach(square => {
        square.addEventListener("dragenter", dragController.dragEnter);
        square.addEventListener("dragover", dragController.dragOver);
        square.addEventListener("drop", dragController.dragDropOnBoard);
    });

    const board = document.querySelector(".player-board");
    board.addEventListener("dragleave", dragController.dragLeave);
    document.body.addEventListener("keydown", dragController.handleKeyboardPress);

    return dragController;
}

function createDragController(player, game, humanSquares, startGameBtn, boardSize) {
    let beingDragged = null;
    let shiftKeyHeld = false;

    function dragStart(e) {
        if (!e.target.classList.contains("inner-ship-container")) return;

        const dragImage = createDragImage(e.target);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        requestAnimationFrame(() => dragImage.remove());

        const row = parseInt(e.target.dataset.rowIndex);
        const col = parseInt(e.target.dataset.colIndex);
        
        if (!isNaN(row) && !isNaN(col) && player.gameboard.isShipOnBoard(row, col)) {
            const isVertical = parseInt(e.target.dataset.isVertical) === 1;
            const size = e.target.children.length;

            const start = [row, col];
            const end = isVertical ? [row + size - 1, col] : [row, col + size - 1];
            player.gameboard.removeShip(start, end, size);
        }
        
        beingDragged = e.target;

        // setTimeout required to work in Chrome
        setTimeout(() => {
            setPointerEvents(beingDragged, "none");
        }, 0);
    }

    function dragEnter(e) {
        if (!beingDragged) return;
        renderValidPlacement(beingDragged, e, humanSquares, boardSize, player.gameboard.board);
    }

    function dragLeave(e) {
        if (humanSquares.includes(e.relatedTarget)) return;
        clearValidPlacement(humanSquares);
    }

    function dragOver(e) {
        e.preventDefault();
        if (!beingDragged) return;

        if (e.shiftKey && !shiftKeyHeld) {
            shiftKeyHeld = true;
            rotateDraggedShip(beingDragged);
            renderValidPlacement(beingDragged, e, humanSquares, boardSize, player.gameboard.board);
        } else if (!e.shiftKey && shiftKeyHeld) {
            shiftKeyHeld = false;
        }
    }

    function dragDropOnBoard(e) {
        if (!beingDragged) return;

        const row = parseInt(e.target.dataset.rowIndex);
        const col = parseInt(e.target.dataset.colIndex);
        const isVertical = Boolean(parseInt(beingDragged.dataset.isVertical));
        const size = beingDragged.children.length;

        const start = [row, col];
        const end = isVertical ? [row + size - 1, col] : [row, col + size - 1];

        clearValidPlacement(humanSquares);

        try {
            player.gameboard.placeShip(start, end, size);
        } catch (error) {
            console.error(error);
            return;
        }

        setOrientationStyling(isVertical, beingDragged, size);
        renderShipPlacement(beingDragged, row, col, isVertical, size, player.name);
        setStartBtn(startGameBtn, player.gameboard, game);
        setPointerEvents(beingDragged, "all");
        beingDragged = null;
    }

    function dragDropOnDock(e) {
        if (!beingDragged || e.currentTarget.children.length > 0) return;

        delete beingDragged.dataset.rowIndex;
        delete beingDragged.dataset.colIndex;

        beingDragged.addEventListener("dragstart", dragStart);
        beingDragged.addEventListener("dragend", dragEnd);

        const dock = document.getElementById("ship-dock-container");
        const isVertical = parseInt(dock.dataset.isVertical) === 1;

        beingDragged.dataset.isVertical = Number(isVertical);
        const size = beingDragged.children.length;
        setOrientationStyling(isVertical, beingDragged, size);
        setStartBtn(startGameBtn, player.gameboard, game);
        setPointerEvents(beingDragged, "all");
        
        e.currentTarget.append(beingDragged);
        beingDragged = null;
    }

    function dragEnd(e) {
        if (!beingDragged) return;
        replaceShipOnBoard(beingDragged, player.gameboard);
        setPointerEvents(beingDragged, "all");
        beingDragged = null;
        shiftKeyHeld = false;
    }

    function handleKeyboardPress(e) {
        if (e.key.toLowerCase() === "q") {
            rotateShipsInDock()
        }
    }

    return {
        dragStart,
        dragEnter,
        dragLeave,
        dragOver,
        dragDropOnBoard,
        dragDropOnDock,
        dragEnd,
        handleKeyboardPress,
    };
}

// Main functions
export function createPlayerOne(playerOneName, playerTwoName, difficulty, playerCount) {
    document.getElementById("main-contents-container").hidden = false;
    document.getElementById("ship-dock-container").hidden = false;

    const hiddenBtns = [];
    const unhiddenBtns = [];

    const game = new Game(difficulty);
    game.addPlayer(playerOneName, true);
    const player = game.getPlayer(playerOneName);
    game.currentPlayer = player;

    const randomiseBtn = document.getElementById("randomise-ships-btn");
    const rotateBtn = document.getElementById("rotate-btn");
    const startGameBtn = document.getElementById("start-game-btn");
    const doneBtn = document.getElementById("done-btn");
    hiddenBtns.push(randomiseBtn);
    hiddenBtns.push(rotateBtn);

    const restartBtn = document.getElementById("restart-game-btn");
    const newGameBtn = document.getElementById("new-game-btn");
    unhiddenBtns.push(restartBtn);
    unhiddenBtns.push(newGameBtn);

    createRandomiseButton(randomiseBtn, game, startGameBtn, doneBtn)

    rotateBtn.addEventListener("click", () => {
        rotateShipsInDock();
    })

    if (playerCount > 1) {
        doneBtn.hidden = false;
        doneBtn.disabled= true;
        doneBtn.addEventListener("click", () => {
            doneBtnClickEvent(playerCount, playerTwoName, game, doneBtn, startGameBtn, randomiseBtn);
        })
    } else {
        hiddenBtns.push(startGameBtn);
    }

    startGameBtn.addEventListener("click", () => {
        startGameClickEvent(game);
    })

    restartBtn.addEventListener("click", () => {
        document.getElementById("ship-dock-container").hidden = false;
        restartGame(game, hiddenBtns, unhiddenBtns);
    })

    newGameBtn.addEventListener("click", () => {
        showNewGameForm();
    })

    restartGame(game, hiddenBtns, unhiddenBtns);
}

function doneBtnClickEvent(playerCount, playerTwoName, game, doneBtn, startGameBtn, randomiseBtn) {
    if (playerCount < 1) return;

    if (game.getHumanPlayerCount() === 1) {
        createPlayerTwo(playerTwoName, game);
    }

    const player = game.getPlayer(playerTwoName);
    game.currentPlayer = player;

    doneBtn.hidden = true;
    doneBtn.disabled = true;

    startGameBtn.hidden = false;
    startGameBtn.disabled = true;

    const squares = renderSingleGameBoard(player);
    const boardSize = player.gameboard.board.length;

    const dragController = createDragEventListenersForBoard(squares, player, startGameBtn, game, boardSize);
    createShipDock(game, dragController);
}

function createPlayerTwo(playerTwoName, game) {
    game.addPlayer(playerTwoName, true);
}

function randomiseClickEvent(game, startGameBtn, doneBtn) {
    const player = game.currentPlayer;
    const innerShipContainers = Array.from(document.querySelectorAll(".inner-ship-container"));
    const ships = game.randomiseShipPlacement(player);
    
    ships.forEach(ship => {
        const size = ship.size;
        const index = innerShipContainers.findIndex((s) => s.children.length === size);
        const container = innerShipContainers.splice(index, 1)[0];
        const row = ship.start[0];
        const col = ship.start[1];
        const isVertical = ship.start[0] !== ship.end[0];
        container.dataset.isVertical = Number(isVertical);
        setOrientationStyling(isVertical, container, size)
        renderShipPlacement(container, row, col, isVertical, size, player.name);
    })
    setDoneBtn(doneBtn, player.gameboard, game);
    setStartBtn(startGameBtn, player.gameboard, game);
}

function startGameClickEvent(game) {
    const playerCount = game.getHumanPlayerCount();
    if (playerCount === 1 && game.players.length >= 2) return;

    const hiddenBtns = [];
    const unhiddenBtns = [];

    const randomiseBtn = document.getElementById("randomise-ships-btn");
    const rotateBtn = document.getElementById("rotate-btn");
    const startGameBtn = document.getElementById("start-game-btn");
    const doneBtn = document.getElementById("done-btn");
    hiddenBtns.push(randomiseBtn);
    hiddenBtns.push(rotateBtn);
    hiddenBtns.push(startGameBtn);
    hiddenBtns.push(doneBtn);

    hiddenBtns.forEach(btn => {
        btn.hidden = true;
    })

    const restartBtn = document.getElementById("restart-game-btn");
    const newGameBtn = document.getElementById("new-game-btn");
    unhiddenBtns.push(restartBtn);
    unhiddenBtns.push(newGameBtn);

    unhiddenBtns.forEach(btn => {
        btn.hidden = false;
    })

    if (playerCount === 1) {
        game.addPlayer();
        const cpuPlayer = game.getPlayer("CPU");
        game.randomiseShipPlacement(cpuPlayer);
    }

    const squares = renderMultipleGameBoards(game, playerCount);
    const secondPlayerSquares = squares.secondPlayerSquares;
    secondPlayerSquares.forEach(square => {
        square.addEventListener("click", () => {
            playTurnClickEvent(square, game);
        })
    })

    const shipBoards = document.querySelectorAll(".ship-board");
    shipBoards.forEach(board => {
        board.style.display = "none"
    })
}

function rotateShipsInDock() {
    const dock = document.getElementById("ship-dock-container");
    const outerShipContainers = document.querySelectorAll(".outer-ship-container");

    const isEmpty = Array.from(outerShipContainers).every(container =>
        container.children.length === 0
    );

    if (isEmpty) return;

    const flip = Number(!Boolean(parseInt(dock.dataset.isVertical)));
    const isVertical = flip === 1;

    if (isVertical) {
        dock.style.display = "flex";
    } else {
        dock.style.display = "block";
    }

    dock.dataset.isVertical = flip;

    outerShipContainers.forEach(container => {
        const innerShipContainer = container.children;
        for (let ship of innerShipContainer) {
            ship.dataset.isVertical = flip;
            const size = ship.children.length;
            setOrientationStyling(isVertical, ship, size);
        }
    })
}

function rotateDraggedShip(ship) {
    ship.dataset.isVertical = Number(!Boolean(parseInt(ship.dataset.isVertical)));
}

function playTurnClickEvent(btn, game) {
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

    const humanName = document.getElementById("player-1-name").textContent;
    const humanPlayer = game.getPlayer(humanName);
    if (cpuBoard.isAllSunk()) {
        game.declareWinner(humanPlayer);
        renderWinner(game.winner);
    } else {
        const WAIT = 500;
        setTimeout(() => {
            const square = game.playComputerTurn(humanPlayer);
            const cpuRow = square[0];
            const cpuCol = square[1];
            const humanBoard = humanPlayer.gameboard;
            const humanBoardDisplay = document.querySelectorAll(".human-board-square");
            updateShipDisplay(humanBoardDisplay, humanBoard.board, cpuRow, cpuCol);
            if (humanBoard.isAllSunk()) {
                game.declareWinner(cpuPlayer);
                renderWinner(game.winner);
                revealShips(game.winner.gameboard.board, cpuBoardDisplay);
            }
            game.flipPlayerOneTurn();
        }, WAIT);
    }
}

function restartGame(game, hiddenBtns, unhiddenBtns) {
    console.log("START OF RESTART FUNCTION");
    game.players.forEach(player => {
        console.log(player);
    })

    const playerCount = game.getHumanPlayerCount();
    const startGameBtn = document.getElementById("start-game-btn");
    document.getElementById("ship-dock-container").style = "";

    const player = game.players[0];
    const boardSize = player.gameboard.board.length;

    game.currentPlayer = player;
    game.playerOneTurn = true;
    game.winner = null;

    if (playerCount === 1) {
        game.players.splice(1);
        player.gameboard = new Gameboard();

        hiddenBtns.forEach(btn => {
            if (btn.id === "start-game-btn") {
                btn.disabled = true;
                btn.hidden = false;
            } else if (btn.id === "done-btn") {
                btn.disabled = true;
                btn.hidden = true;
            } else {
                btn.hidden = false;
            }
        })
    } else {
        game.players.forEach(player => {
            player.gameboard = new Gameboard();
        })

        hiddenBtns.forEach(btn => {
            if (btn.id === "start-game-btn") {
                btn.disabled = true;
                btn.hidden = true;
            } else if (btn.id === "done-btn") {
                console.log("FOUND");
                btn.disabled = true;
                btn.hidden = false;
            } else {
                btn.hidden = false;
            }
        })
    }

    unhiddenBtns.forEach(btn => {
        btn.hidden = true;
    })

    const squares = renderSingleGameBoard(player);
    const dragController = createDragEventListenersForBoard(squares, player, startGameBtn, game, boardSize);
    createShipDock(game, dragController);

    console.log("END OF RESTART FUNCTION");
    game.players.forEach(player => {
        console.log(player);
    })
}

function showNewGameForm() {
    const newGameForm = document.getElementById("new-game-form");
    const closeBtn = document.getElementById("close-new-game-btn");

    closeBtn.hidden = false;
    newGameForm.showModal();
}