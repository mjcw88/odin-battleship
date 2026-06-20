import { Player } from "./player.js";
import { Gameboard } from "./gameboard.js";

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
        const player = this.getPlayer("CPU");
        const board = player.gameboard.board;
        if (num < 0 || num >= board.length) throw new RangeError("Integer out of bounds");
    }

    #isVertical(startRow, endRow) {
        return startRow !== endRow;
    }

    #getRandomCoordinates(size, board) {
        const coordinates = [];
        const available = [];

        board.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                if (rowIndex + size <= board.length) { 
                    const temp = [];
                    for(let i = 0; i < size; i++) {
                        const cell = board[rowIndex + i][colIndex];
                        temp.push(cell);
                    }
                    if (temp.every((currentValue) => currentValue.ship === null)) {
                        available.push({ coordinates: [rowIndex,colIndex], vertical: true })
                    };
                }

                if (colIndex + size <= board.length) { 
                    const temp = [];
                    for(let i = 0; i < size; i++) {
                        const cell = board[rowIndex][colIndex + i];
                        temp.push(cell);
                    }
                    if (temp.every((currentValue) => currentValue.ship === null)) {
                        available.push({ coordinates: [rowIndex,colIndex], vertical: false })
                    };
                }
            })
        })
        const start = available[Math.floor(Math.random() * available.length)];
        const end = Array.from(start.coordinates);

        if (start.vertical) {
            end[0] += (size - 1);
        } else {
            end[1] += (size -1);
        }

        coordinates.push(start.coordinates,end);
        return coordinates;
    }

    createNewGame() {
        const ships = [5, 4, 3, 3, 2];

        const playerOne = new Player("Human", true);
        const playerTwo = new Player();

        this.players.push(playerOne);
        this.players.push(playerTwo);

        this.players.forEach((player) => {
            ships.forEach((ship) => {
                const coordinates = this.#getRandomCoordinates(ship, player.gameboard.board);
                const start = coordinates[0];
                const end = coordinates[1];
                player.gameboard.placeShip(start, end, ship);
            });
        });
    }

    playHumanTurn(row, col) {
        this.#isValidNumber(row);
        this.#isValidNumber(col);

        if (this.winner || !this.playerOneTurn) return;

        const cpu = this.getPlayer("CPU");
        const cpuBoard = cpu.gameboard;

        if (cpuBoard.board[row][col].hit) return;

        cpuBoard.recieveAttack(row, col);
    }

    playComputerTurn() {
        const humanPlayer = this.getPlayer("Human");

        const { available, hits } = humanPlayer.gameboard.board.reduce(
             (acc, cur, row) => {
                cur.forEach((square, col) => {
                    if (square.hit === false) acc.available.push([row, col]);
                    else if (square.hit === true && square.ship !== null && square.ship.isSunk() === false) acc.hits.push({ row: row, col: col, ship: square.ship });
                })
                return acc;
             },
             { available: [], hits: [] }
        );

        const targets = [];
        let square;
        if (hits.length > 0) {
            const hit = hits[Math.floor(Math.random() * hits.length)];
            if (hit.ship.hits > 1) {
                const rows = hits.filter((h) => h.ship === hit.ship).map((h) => h.row).slice(0, 2);

                const queue = [hit];
                const visited = [];
                const TRAVERSE_DIRECTIONS = [-1,1];

                if (this.#isVertical(rows[0], rows[1])) {
                    while (queue.length > 0) {
                        const current = queue.shift();
                        if (visited.includes(current.row)) continue;
                        visited.push(current.row);

                        TRAVERSE_DIRECTIONS.forEach(direction => {
                            const dir = current.row + direction;
                            if (dir < 0 || dir >= humanPlayer.gameboard.board.length) return;
                            if (humanPlayer.gameboard.board[dir][current.col].hit === false) {
                                targets.push([dir,current.col])
                            } else if (humanPlayer.gameboard.board[dir][current.col].hit === true && humanPlayer.gameboard.board[dir][current.col].ship) {
                                queue.push({ row: dir, col: current.col });
                            };
                        })
                    }
                } else {
                    while (queue.length > 0) {
                        const current = queue.shift();
                        if (visited.includes(current.col)) continue;
                        visited.push(current.col);

                        TRAVERSE_DIRECTIONS.forEach(direction => {
                            const dir = current.col + direction;
                            if (dir < 0 || dir >= humanPlayer.gameboard.board.length) return;
                            if (humanPlayer.gameboard.board[current.row][dir].hit === false) {
                                targets.push([current.row,dir])
                            } else if (humanPlayer.gameboard.board[current.row][dir].hit === true && humanPlayer.gameboard.board[current.row][dir].ship) {
                                queue.push({ row: current.row, col: dir });
                            };
                        })
                    }
                }
            } else {
                const DIRECTIONS = [[-1,0],[0,1],[1,0],[0,-1]];
                DIRECTIONS.forEach(dir => {
                    const row = hit.row + dir[0];
                    const col = hit.col + dir[1];
                    if (available.some(square => square[0] === row && square[1] === col)) targets.push([row,col]);
                })   
            }
            square = targets[Math.floor(Math.random() * targets.length)];
        } else {
            square = available[Math.floor(Math.random() * available.length)];
        }
        
        const row = square[0];
        const col = square[1];
        humanPlayer.gameboard.recieveAttack(row, col);
        return square;
    }

    flipPlayerOneTurn() {
        this.playerOneTurn = !this.playerOneTurn;
    }

    getPlayer(name) {
        const index = this.players.findIndex(player => player.name === name);
        return this.players[index];
    }

    declareWinner(player) {
        this.winner = player;
    }
}