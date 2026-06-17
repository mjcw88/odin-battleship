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
;
        const board = this.getPlayerBoard("CPU");
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

        const ships = [2, 2, 2, 2, 2];

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

        const cpuBoard = this.getPlayerBoard("CPU");
        if (cpuBoard.board[row][col].hit) return;

        cpuBoard.recieveAttack(row, col);
        if (cpuBoard.isAllSunk()) {
            const humanName = this.players.find(player => player.human).name;
            const index = this.getPlayerBoard(humanName);
            this.declareWinner(this.players[index]);
        }
        this.playerOneTurn = false;
    }

    playComputerTurn() {
        const humanName = this.players.find(player => player.human).name;
        const humanBoard = this.getPlayerBoard(humanName);

        const { available, hits } = humanBoard.board.reduce(
             (acc, cur, row) => {
                cur.forEach((square, col) => {
                    if (square.hit === false) acc.available.push([row, col]);
                    else if (square.hit === true && square.ship !== null && square.ship.isSunk() === false) acc.hits.push({ row: row, col: col, ship: square.ship });
                })
                return acc;
             },
             { available: [], hits: [] }
        );

        let square;
        if (hits.length > 0) {
            const targets = [];
            const hit = hits[Math.floor(Math.random() * hits.length)];

            if (hit.ship.hits > 1) {

            } else {
                const directions = [[-1,0],[0,1],[1,0],[0,-1]];
                directions.forEach(dir => {
                    const row = hit.row + dir[0];
                    const col = hit.col + dir[1];
                    if (available.some(square => square[0] === row && square[1] === col)) targets.push([row,col]);
                })
                square = targets[Math.floor(Math.random() * targets.length)];
            }
        } else {
            square = available[Math.floor(Math.random() * available.length)];
        }
        const row = square[0];
        const col = square[1];
        humanBoard.recieveAttack(row, col);
        this.playerOneTurn = true;
        return square;
    }

    getPlayerBoard(name) {
        const index = this.players.findIndex(player => player.name === name);
        return this.players[index].gameboard;
    }

    declareWinner(player) {
        this.winner = player;
    }
}