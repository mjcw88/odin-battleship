import { Game } from "./classes/game.js";
import { Gameboard } from "./classes/gameboard.js";
import { renderShipDock, renderGameBoard, updateShipDisplay, renderWinner, renderShips } from "./displayController.js";

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

    const randomiseBtn = document.getElementById("randomise-ships-btn");
    const startGameBtn = document.getElementById("start-game-btn");
    hiddenBtns.push(randomiseBtn);
    hiddenBtns.push(startGameBtn);

    const restartBtn = document.getElementById("restart-game-btn");
    const newGameBtn = document.getElementById("new-game-btn");
    unhiddenBtns.push(restartBtn);
    unhiddenBtns.push(newGameBtn);

    randomiseBtn.addEventListener("click", () => {
        document.getElementById("ship-dock-container").hidden = true;
        randomiseClickEvent(game, player, startGameBtn);
    })

    restartGame(game, hiddenBtns, unhiddenBtns);
    createShipDock(game, playerOneName);
    const squares = renderGameBoard(game);
    const humanSquares = squares.humanSquares;
    humanSquares.forEach(square => {
        square.addEventListener("dragenter", dragEnter)
        square.addEventListener("dragleave", dragLeave)
        square.addEventListener("dragover", dragOver)
        square.addEventListener("drop", (e) => {
            dragDrop(e, player, game)
        })
    })
}

function createShipDock(game, playerName) {
    renderShipDock(game.ships, playerName);
    const ships = document.querySelectorAll(".inner-ship-container");
    ships.forEach(ship => {
        ship.addEventListener("dragstart", dragStart)
    })
}

let beingDragged;

function dragStart(e) {
    beingDragged = e.target;
}

function dragEnter(e) {
    e.target.classList.add("highlight");
}

function dragLeave(e) {
    e.target.classList.remove("highlight");
}

function dragOver(e) {
    e.preventDefault();
}

function dragDrop(e, player, game) {
    const row = parseInt(e.target.dataset.rowIndex);
    const col = parseInt(e.target.dataset.colIndex);
    const isVertical = parseInt(beingDragged.dataset.isVertical) === 1;
    const shipSize = beingDragged.children.length;

    const start = [row,col];
    let end;
    if (isVertical) end = [row + shipSize - 1, col];
    else end = [row,col + shipSize - 1];
    player.gameboard.placeShip(start, end, shipSize);
    renderGameBoard(game); // This needs removing and just append to board instead

    e.target.classList.remove("highlight");
    // e.target.append(beingDragged);
}

function randomiseClickEvent(game, player, startGameBtn) {
    game.randomiseShipPlacement(player);
    renderGameBoard(game);
    if (isAllShipsOnBoard(player.gameboard, game)) {
        startGameBtn.disabled = false;
        startGameBtn.addEventListener("click", () => {
            startGameClickEvent(game);
        })
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

function restartGame(game, hiddenBtns, unhiddenBtns) {
    game.players.splice(1);
    game.playerOneTurn = true;
    game.winner = null;
    const player = game.players[0];
    player.gameboard = new Gameboard();
    hiddenBtns.forEach(btn => {
        if (btn.id === "start-game-btn") btn.disabled = true;
        btn.hidden = false;
    })
    unhiddenBtns.forEach(btn => {
        btn.hidden = true;
    })
    renderGameBoard(game);
}

function showNewGameForm() {
    const newGameForm = document.getElementById("new-game-form");
    const closeBtn = document.getElementById("close-new-game-btn");

    closeBtn.hidden = false;
    newGameForm.showModal();
}