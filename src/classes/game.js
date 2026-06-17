import { Player } from "./player.js";

export class Game {
    constructor(...rest) {
        if (rest.length > 0) throw new RangeError("Too many arguments given");

        this.players = [];
        this.playerOneTurn = true;
        this.winner = null;
    }

    #isValidNumber(num) {
        if (!Number.isInteger(num)) throw new TypeError("Number must be an integer");

        const index = this.getCpuPlayerIndex();
        const board = this.getPlayerBoard(index);
        if (num < 0 || num >= board.board.length) throw new RangeError("Integer out of bounds");
    }

    createNewGame() {
        // Placeholder Coordinates - delete later
        const coordinates = [
            [[0,0],[4,0]],
            [[6,0],[6,3]],
            [[8,5],[8,7]],
            [[1,4],[3,4]],
            [[3,7],[4,7]],
            [[5,5],[5,9]],
            [[3,2],[6,2]],
            [[9,0],[9,2]],
            [[3,5],[3,7]],
            [[1,0],[1,1]],
        ];

        const ships = [5, 4, 3, 3, 2];

        const playerOne = new Player("Human", true);
        const playerTwo = new Player();

        this.players.push(playerOne);
        this.players.push(playerTwo);
        
        this.players.forEach((player, playerIndex) => {
            const offset = playerIndex * ships.length;
            ships.forEach((ship, shipIndex) => {
                player.gameboard.placeShip(coordinates[offset + shipIndex][0], coordinates[offset + shipIndex][1], ship);
            });
        });
    }

    playHumanTurn(row, col) {
        this.#isValidNumber(row);
        this.#isValidNumber(col);

        if (this.winner || !this.playerOneTurn) return;

        const index = this.getCpuPlayerIndex();
        const cpuBoard = this.getPlayerBoard(index);
        if (cpuBoard.board[row][col].hit) return;

        cpuBoard.recieveAttack(row, col);
        if (cpuBoard.isAllSunk()) {
            const index = this.getHumanPlayerIndex();
            this.declareWinner(this.players[index]);
        }
        this.playerOneTurn = false;
    }

    playComputerTurn() {
        const index = this.getHumanPlayerIndex();
        const board = this.getPlayerBoard(index);

        const { available, hits } = board.board.reduce(
             (accumulator, currentValue, row) => {
                currentValue.forEach((square, col) => {
                    if (square.hit === false) accumulator.available.push([row, col]);
                    else if (square.hit === true && square.ship !== null && square.ship.isSunk() === false) accumulator.hits.push([row, col]);
                })
                return accumulator;
             },
             { available: [], hits: [] }
        );

        //console.log(available);
        //console.log(hits);

        let square;
        if (hits.length > 0) {
            console.log("hits found!");
        } else {
            square = available[Math.floor(Math.random() * available.length)];
        }
        const row = square[0];
        const col = square[1];
        board.recieveAttack(row, col);
        this.playerOneTurn = true;
        return square;
    }

    getHumanPlayerIndex() {
        return this.players.findIndex(player => player.human === true);
    }

    getCpuPlayerIndex() {
        return this.players.findIndex(player => player.human === false);
    }

    getPlayerBoard(index) {
        if (!Number.isInteger(index)) throw new TypeError("Number must be an integer");
        return this.players[index].gameboard;
    }

    declareWinner(player) {
        this.winner = player;
    }
}

// const game = new Game();

// game.createNewGame();

// game.playComputerTurn();