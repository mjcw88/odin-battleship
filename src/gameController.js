import { Game } from "./classes/game.js";
import { Gameboard } from "./classes/gameboard.js";
import { renderShipDock, renderValidPlacement, clearValidPlacement, renderShipPlacement, renderGameBoard, updateShipDisplay, renderWinner, renderShips } from "./displayController.js";

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

function setOrientationStyling(isVertical, container, size) {
    if (isVertical) {
        container.style.gridTemplateColumns = "";
        container.style.gridTemplateRows = `repeat(${size}, var(--gridSize))`;
        container.style.width = "var(--gridSize)";
    } else {
        container.style.gridTemplateColumns = `repeat(${size}, var(--gridSize))`;
        container.style.gridTemplateRows = "";
        container.style.width = "fit-content";
    }
}

// Main functions
export function createGame(playerOneName, difficulty) {
    document.getElementById("main-contents-container").hidden = false;;
    document.getElementById("ship-dock-container").hidden = false;

    const hiddenBtns = [];
    const unhiddenBtns = [];

    const game = new Game(difficulty);
    game.addPlayer(playerOneName, true);
    const player = game.getPlayer(playerOneName);
    const boardSize = player.gameboard.board.length;

    const randomiseBtn = document.getElementById("randomise-ships-btn");
    const startGameBtn = document.getElementById("start-game-btn");
    const rotateBtn = document.getElementById("rotate-btn");
    hiddenBtns.push(randomiseBtn);
    hiddenBtns.push(startGameBtn);
    hiddenBtns.push(rotateBtn);

    const restartBtn = document.getElementById("restart-game-btn");
    const newGameBtn = document.getElementById("new-game-btn");
    unhiddenBtns.push(restartBtn);
    unhiddenBtns.push(newGameBtn);

    randomiseBtn.addEventListener("click", () => {
        randomiseClickEvent(game, player, startGameBtn);
    })

    startGameBtn.addEventListener("click", () => {
        startGameClickEvent(game);
    })

    rotateBtn.addEventListener("click", () => {
        rotateShipsEvent();
    })

    restartGame(game, hiddenBtns, unhiddenBtns);
}

function randomiseClickEvent(game, player, startGameBtn) {
    game.randomiseShipPlacement(player);
    renderGameBoard(game);
    setStartBtn(startGameBtn, player.gameboard, game);
}

function startGameClickEvent(game) {
    if (game.players.length >= 2) return;

    const hiddenBtns = [];
    const unhiddenBtns = [];

    const randomiseBtn = document.getElementById("randomise-ships-btn");
    const startGameBtn = document.getElementById("start-game-btn");
    const rotateBtn = document.getElementById("rotate-btn");
    hiddenBtns.push(randomiseBtn);
    hiddenBtns.push(startGameBtn);
    hiddenBtns.push(rotateBtn);

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

    game.addPlayer();
    const cpuPlayer = game.getPlayer("CPU");
    game.randomiseShipPlacement(cpuPlayer);
    const squares = renderGameBoard(game);
    const cpuSquares = squares.cpuSquares;
    cpuSquares.forEach(square => {
        square.addEventListener("click", () => {
            playTurnClickEvent(square, game);
        })
    })

    restartBtn.addEventListener("click", () => {
        document.getElementById("ship-dock-container").hidden = false;
        restartGame(game, hiddenBtns, unhiddenBtns);
    })

    newGameBtn.addEventListener("click", () => {
        showNewGameForm();
    })
}

function rotateShipsEvent() {
    const dock = document.getElementById("ship-dock-container");
    const outerShipContainers = document.querySelectorAll(".outer-ship-container");

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
                renderShips(game.winner.gameboard.board, cpuBoardDisplay);
            }
            game.flipPlayerOneTurn();
        }, WAIT);
    }
}

function showNewGameForm() {
    const newGameForm = document.getElementById("new-game-form");
    const closeBtn = document.getElementById("close-new-game-btn");

    closeBtn.hidden = false;
    newGameForm.showModal();
}

function restartGame(game, hiddenBtns, unhiddenBtns) {
    const startGameBtn = document.getElementById("start-game-btn");
    document.getElementById("ship-dock-container").style = "";

    game.players.splice(1);
    game.playerOneTurn = true;
    game.winner = null;
    const player = game.players[0];
    player.gameboard = new Gameboard();
    const boardSize = player.gameboard.board.length;

    hiddenBtns.forEach(btn => {
        if (btn.id === "start-game-btn") btn.disabled = true;
        btn.hidden = false;
    })
    unhiddenBtns.forEach(btn => {
        btn.hidden = true;
    })

    const squares = renderGameBoard(game);
    const humanSquares = squares.humanSquares;
    createDragEventListenersForBoard(humanSquares, player, startGameBtn, game, boardSize);
}

function createDragEventListenersForBoard(humanSquares, player, startGameBtn, game, boardSize) {
    const dragController = createDragController(
        player,
        game,
        humanSquares,
        startGameBtn,
        boardSize
    );

    createShipDock(game, player, dragController);

    humanSquares.forEach(square => {
        square.addEventListener("dragenter", dragController.dragEnter);
        square.addEventListener("dragover", dragController.dragOver);
        square.addEventListener("drop", dragController.dragDropOnBoard);
    });

    const board = document.querySelector(".player-board");
    board.addEventListener("dragleave", dragController.dragLeave);
}

function createDragController(player, game, humanSquares, startGameBtn, boardSize) {
    let beingDragged = null;

    function dragStart(e) {
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
    }

    function dragDropOnBoard(e) {
        if (!beingDragged) return;

        const row = parseInt(e.target.dataset.rowIndex);
        const col = parseInt(e.target.dataset.colIndex);
        const isVertical = parseInt(beingDragged.dataset.isVertical) === 1;
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

        renderShipPlacement(beingDragged, e.target, isVertical, size, player.name);
        setStartBtn(startGameBtn, player.gameboard, game);
        setPointerEvents(beingDragged, "all");
        beingDragged = null;
    }

    function dragDropOnDock(e) {
        if (e.currentTarget.children.length > 0) return;

        setStartBtn(startGameBtn, player.gameboard, game);

        delete beingDragged.dataset.rowIndex;
        delete beingDragged.dataset.colIndex;

        beingDragged.addEventListener("dragstart", dragStart);
        beingDragged.addEventListener("dragend", dragEnd);

        const dock = document.getElementById("ship-dock-container");
        const isVertical = parseInt(dock.dataset.isVertical) === 1;

        beingDragged.dataset.isVertical =  Number(isVertical);
        const size = beingDragged.children.length;
        setOrientationStyling(isVertical, beingDragged, size);
        setPointerEvents(beingDragged, "all");
        
        e.currentTarget.append(beingDragged);
        beingDragged = null;
    }

    function dragEnd(e) {
        if (!beingDragged) return;
        replaceShipOnBoard(beingDragged, player.gameboard);
        setPointerEvents(beingDragged, "all");
        beingDragged = null;
    }

    return {
        dragStart,
        dragEnter,
        dragLeave,
        dragOver,
        dragDropOnBoard,
        dragDropOnDock,
        dragEnd,
    };
}

function createShipDock(game, player, dragController) {    
    const playerName = player.name;
    renderShipDock(game.ships, playerName);

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