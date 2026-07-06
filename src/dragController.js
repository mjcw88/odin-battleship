import { renderShipDock, renderShipPlacement } from "./displayController";

// Helper functions
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

function renderValidPlacement(beingDragged, e, squares, boardSize, gameboard) {
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
        const square = squares.find(square => parseInt(square.dataset.rowIndex) === row && parseInt(square.dataset.colIndex) === col);
        if (square && gameboard[row][col].ship) isValid = false;
    })

    squares.forEach(square => {
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

function clearValidPlacement(squares) {
    squares.forEach(square => {
        square.classList.remove("valid-placement");
        square.classList.remove("invalid-placement");
    })
}

function rotateDraggedShip(ship) {
    ship.dataset.isVertical = Number(!Boolean(parseInt(ship.dataset.isVertical)));
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

export function rotateShipsInDock() {
    const outerShipContainers = document.querySelectorAll(".outer-ship-container");
    const isEmpty = Array.from(outerShipContainers).every(container =>
        container.children.length === 0
    );

    if (isEmpty) return;

    const dock = document.getElementById("ship-dock-container");
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

// Main functions
export function createDragEventListenersForBoard(squares, player, game) {
    const dragController = createDragController(squares, player, game);

    squares.forEach(square => {
        square.addEventListener("dragenter", dragController.dragEnter);
        square.addEventListener("dragover", dragController.dragOver);
        square.addEventListener("drop", dragController.dragDropOnBoard);
    });

    const board = document.querySelector(".player-board");
    board.addEventListener("dragleave", dragController.dragLeave);

    return dragController;
}

function createDragController(squares, player, game) {
    const startGameBtn = document.getElementById("start-game-btn");
    const boardSize = player.gameboard.board.length;

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
        renderValidPlacement(beingDragged, e, squares, boardSize, player.gameboard.board);
    }

    function dragLeave(e) {
        if (squares.includes(e.relatedTarget)) return;
        clearValidPlacement(squares);
    }

    function dragOver(e) {
        e.preventDefault();
        if (!beingDragged) return;

        if (e.shiftKey && !shiftKeyHeld) {
            shiftKeyHeld = true;
            rotateDraggedShip(beingDragged);
            renderValidPlacement(beingDragged, e, squares, boardSize, player.gameboard.board);
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

        clearValidPlacement(squares);

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

export function createShipDock(game, dragController) {    
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