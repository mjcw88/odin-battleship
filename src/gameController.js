import { Game } from "./classes/game.js";
import { Gameboard } from "./classes/gameboard.js";
import { renderShipDock, renderValidPlacement, clearValidPlacement, renderShipPlacement, hideShipInDock, renderGameBoard, updateShipDisplay, renderWinner, renderShips } from "./displayController.js";

function isAllShipsOnBoard(gameboard, game) {
    return gameboard.ships.length === game.ships.length;
}

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
    hiddenBtns.push(randomiseBtn);
    hiddenBtns.push(startGameBtn);

    const restartBtn = document.getElementById("restart-game-btn");
    const newGameBtn = document.getElementById("new-game-btn");
    unhiddenBtns.push(restartBtn);
    unhiddenBtns.push(newGameBtn);

    randomiseBtn.addEventListener("click", () => {
        randomiseClickEvent(game, player, startGameBtn);

        const ships = document.querySelectorAll(".inner-ship-container");
        ships.forEach(ship => {
            hideShipInDock(ship);
        })
    })

    startGameBtn.addEventListener("click", () => {
        startGameClickEvent(game);
    })

    restartGame(game, hiddenBtns, unhiddenBtns);
}

function randomiseClickEvent(game, player, startGameBtn) {
    game.randomiseShipPlacement(player);
    renderGameBoard(game);
    if (isAllShipsOnBoard(player.gameboard, game)) {
        startGameBtn.disabled = false;
    };
}

function startGameClickEvent(game) {
    if (game.players.length >= 2) return;

    const hiddenBtns = [];
    const unhiddenBtns = [];

    const randomiseBtn = document.getElementById("randomise-ships-btn");
    const startGameBtn = document.getElementById("start-game-btn");
    hiddenBtns.push(randomiseBtn);
    hiddenBtns.push(startGameBtn);

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

    createShipDock(game, player.name, dragController);

    humanSquares.forEach(square => {
        square.addEventListener("dragenter", dragController.dragEnter);
        square.addEventListener("dragover", dragController.dragOver);
        square.addEventListener("drop", dragController.dragDrop);
    });

    const board = document.querySelector(".player-board");
    board.addEventListener("dragleave", dragController.dragLeave);
}

function createDragController(player, game, humanSquares, startGameBtn, boardSize) {
    let beingDragged = null;
    let squares = [];

    function dragStart(e) {
        beingDragged = e.target;
    }

    function dragEnter(e) {
        if (!beingDragged) return;
        renderValidPlacement(beingDragged, e, humanSquares, boardSize);
    }

    function dragLeave(e) {
        if (humanSquares.includes(e.relatedTarget)) return;
        clearValidPlacement(humanSquares);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dragDrop(e) {
        if (!beingDragged) return;

        const row = parseInt(e.target.dataset.rowIndex);
        const col = parseInt(e.target.dataset.colIndex);
        const isVertical = parseInt(beingDragged.dataset.isVertical) === 1;
        const shipSize = beingDragged.children.length;

        const start = [row, col];
        const end = isVertical ? [row + shipSize - 1, col] : [row, col + shipSize - 1];

        clearValidPlacement(humanSquares);

        try {
            player.gameboard.placeShip(start, end, shipSize);
        } catch (error) {
            console.error(error);
            return;
        }

        squares = renderShipPlacement(e.target, isVertical, shipSize, humanSquares);
        reattachDragEventOnShipsOnBoard(squares);
        hideShipInDock(beingDragged);

        if (isAllShipsOnBoard(player.gameboard, game)) {
            startGameBtn.disabled = false;
        }

        beingDragged = null;
    }

    function reattachDragEventOnShipsOnBoard(squares) {
        // attach drag events to ship squares on board and remove ship from gameboard object (a new function inside the gameboard object needs to be created for this)
        console.log(squares);
    }

    return {
        dragStart,
        dragEnter,
        dragLeave,
        dragOver,
        dragDrop,
    };
}

function createShipDock(game, playerName, dragController) {
    renderShipDock(game.ships, playerName);
    const ships = document.querySelectorAll(".inner-ship-container");
    ships.forEach(ship => {
        ship.addEventListener("dragstart", dragController.dragStart);
    })
}