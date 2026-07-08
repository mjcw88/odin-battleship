import { Player } from "./player.js";
import { Gameboard } from "./gameboard.js";

export class Game {
    constructor(difficulty = 2, ...rest) {
        if (rest.length > 0) throw new RangeError("Too many arguments given");

        this.players = [];
        this.ships = [5, 4, 3, 3, 2];
        this.playerOneTurn = true;
        this.currentPlayer = null;
        this.difficulty = difficulty;
        this.winner = null;
    }

    #isValidNumber(num) {
        if (!Number.isInteger(num)) throw new TypeError("Number must be an integer");
        
        const player = this.getPlayer("CPU");
        const board = player.gameboard.board;
        if (num < 0 || num >= board.length) throw new RangeError("Integer out of bounds");
    }

    #isVertical(startRow, endRow) {
        return startRow !== endRow;
    }

    #getSmallestShip(ships) {
        const unsunkShips = ships.filter(ship => !ship.isSunk());
        return unsunkShips.reduce((acc, cur) => acc.size < cur.size ? acc : cur).size;
    }

    #easyHitAlgorithm(hits, available, targets) {
        if (hits.length > 0) {
            const DIRECTIONS = [[-1,0],[0,1],[1,0],[0,-1]];
            hits.forEach(hit => {
                DIRECTIONS.forEach(dir => {
                    const row = hit.row + dir[0];
                    const col = hit.col + dir[1];
                    if (available.some(square => square[0] === row && square[1] === col)) targets.push([row,col]);
                })   
            })
        }
    }

    #normalHitAlgorithm(TRAVERSE_DIRECTIONS, board, available, hits, targets) {
        if (hits.length > 1) {
            const hit = hits[Math.floor(Math.random() * hits.length)];
            const rows = [hit.row];
            const callBack = (h) => (Math.abs(h.row - hit.row) === 1 && h.col === hit.col) || (Math.abs(h.col - hit.col) === 1 && h.row === hit.row);
            const adjacentRows = hits.filter(callBack).map((h) => h.row).slice(0, 1);
            rows.push(...adjacentRows);
            const queue = [hit];
            const visited = [];

            if (this.#isVertical(rows[0], rows[1])) {
                this.#normalVerticalTraversal(TRAVERSE_DIRECTIONS, board, queue, visited, targets);
            } else {
                this.#normalHorizontalTraversal(TRAVERSE_DIRECTIONS, board, queue, visited, targets);
            }  

            if (targets.length === 0) this.#normalSingleHit(available, targets, hit);
        } else if (hits.length === 1) {
            const hit = hits[0];
            this.#normalSingleHit(available, targets, hit);
        }
    }

    #hardHitAlgorithm(TRAVERSE_DIRECTIONS, board, available, hits, targets) {
        if (hits.length > 1) {
            const hit = hits[Math.floor(Math.random() * hits.length)];
            const rows = hits.filter((h) => h.ship === hit.ship).map((h) => h.row).slice(0, 2);
            const queue = [hit];
            const visited = [];

            if (this.#isVertical(rows[0], rows[1])) {
                this.#hardVerticalTraversal(TRAVERSE_DIRECTIONS, board, queue, visited, targets, hit);
            } else {
                this.#hardHorizontalTraversal(TRAVERSE_DIRECTIONS, board, queue, visited, targets, hit);
            }

            if (targets.length === 0) this.#hardSingleHit(available, targets, hit, board);
        } else if (hits.length === 1) {
            const hit = hits[0];
            this.#hardSingleHit(available, targets, hit, board);
        }
    }

    #slidingWindowTraversal(available, board, targets, ship) {
        available.forEach(coordinate => {
            const row = coordinate[0];
            const col = coordinate[1];

            if (row + ship <= board.length) {
                const temp = [];
                for (let i = 0; i < ship; i++) {
                    const square = [row + i,col];
                    temp.push(square);
                }

                if (temp.every((cur) => available.some(element => element[0] === cur[0] && element[1] === cur[1]))) {
                    targets.push(temp);
                }
            }

            if (col + ship <= board.length) {
                const temp = [];
                for (let i = 0; i < ship; i++) {
                    const square = [row,col + i];
                    temp.push(square);
                }

                if (temp.every((cur) => available.some(element => element[0] === cur[0] && element[1] === cur[1]))) {
                    targets.push(temp);
                }
            }
        })

        if (targets.length > 0) {
            const combination = targets[Math.floor(Math.random() * targets.length)];
            return combination[Math.floor(combination.length / 2)];
        }
        return available[Math.floor(Math.random() * available.length)];
    }

    #longestRunTraversal(available, targets, ship) {
        available.forEach(coordinate => {
            const row = coordinate[0];
            const col = coordinate[1];

            const verticalTemp = [coordinate];
            let i = 1;
            while (true) {
                const nextRow = row + i;
                const next = available.some(element => element[0] === nextRow && element[1] === col);
                if (next) verticalTemp.push([nextRow,col]);
                else break;
                i++;
            }
            if (verticalTemp.length >= ship) {
                if (!verticalTemp.every((cur) => targets.some(run => run.some(element => element[0] === cur[0] && element[1] === cur[1])))) {
                    targets.push(verticalTemp);
                }
            };

            const horizontalTemp = [coordinate];
            let j = 1;
            while (true) {
                const nextCol = col + j;
                const next = available.some(element => element[0] === row && element[1] === nextCol);
                if (next) horizontalTemp.push([row,nextCol]);
                else break;
                j++;
            }
            if (horizontalTemp.length >= ship) {
                if (!horizontalTemp.every((cur) => targets.some(run => run.some(element => element[0] === cur[0] && element[1] === cur[1])))) {
                    targets.push(horizontalTemp);
                }
            };
        })

        if (targets.length > 0) {
            let modifier = 0;
            const combination = targets[Math.floor(Math.random() * targets.length)];
            if (combination.length % 2 === 0) modifier = Math.floor(Math.random() * 2);
            return combination[Math.max(0, Math.floor(combination.length / 2) - modifier)];
        }
        return available[Math.floor(Math.random() * available.length)];
    }

    #normalSingleHit(available, targets, hit) {
        const DIRECTIONS = [[-1,0],[0,1],[1,0],[0,-1]];
        DIRECTIONS.forEach(dir => {
            const row = hit.row + dir[0];
            const col = hit.col + dir[1];
            if (available.some(square => square[0] === row && square[1] === col)) targets.push([row,col]);
        })   
    }

    #hardSingleHit(available, targets, hit, board) {
        const DIRECTIONS = [[-1,0],[0,1],[1,0],[0,-1]];
        DIRECTIONS.forEach(dir => {
            const row = hit.row + dir[0];
            const col = hit.col + dir[1];
            if (available.some(square => square[0] === row && square[1] === col && board[row][col].ship === hit.ship)) targets.push([row,col]);
        })   
    }

    #normalVerticalTraversal(TRAVERSE_DIRECTIONS, board, queue, visited, targets) {
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.includes(current.row)) continue;
            visited.push(current.row);

            TRAVERSE_DIRECTIONS.forEach(direction => {
                const dir = current.row + direction;
                if (dir < 0 || dir >= board.length) return;
                const cell = board[dir][current.col];
                if (cell.hit === false) {
                    targets.push([dir,current.col])
                } else if (cell.hit === true && cell.ship && !cell.ship.isSunk()) {
                    queue.push({ row: dir, col: current.col });
                };
            })
        }
    }

    #normalHorizontalTraversal(TRAVERSE_DIRECTIONS, board, queue, visited, targets) {
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.includes(current.col)) continue;
            visited.push(current.col);

            TRAVERSE_DIRECTIONS.forEach(direction => {
                const dir = current.col + direction;
                if (dir < 0 || dir >= board.length) return;
                const cell = board[current.row][dir];
                if (cell.hit === false) {
                    targets.push([current.row,dir])
                } else if (cell.hit === true && cell.ship && !cell.ship.isSunk()) {
                    queue.push({ row: current.row, col: dir });
                };
            })
        }
    }

    #hardVerticalTraversal(TRAVERSE_DIRECTIONS, board, queue, visited, targets, hit) {
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.includes(current.row)) continue;
            visited.push(current.row);

            TRAVERSE_DIRECTIONS.forEach(direction => {
                const dir = current.row + direction;
                if (dir < 0 || dir >= board.length) return;
                const cell = board[dir][current.col];
                if (cell.hit === false && cell.ship === hit.ship) {
                    targets.push([dir,current.col])
                } else if (cell.hit === true && cell.ship === hit.ship) {
                    queue.push({ row: dir, col: current.col });
                };
            })
        }
    }

    #hardHorizontalTraversal(TRAVERSE_DIRECTIONS, board, queue, visited, targets, hit) {
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.includes(current.col)) continue;
            visited.push(current.col);

            TRAVERSE_DIRECTIONS.forEach(direction => {
                const dir = current.col + direction;
                if (dir < 0 || dir >= board.length) return;
                const cell = board[current.row][dir];
                if (cell.hit === false && cell.ship === hit.ship) {
                    targets.push([current.row,dir])
                } else if (cell.hit === true && cell.ship === hit.ship) {
                    queue.push({ row: current.row, col: dir });
                };
            })
        }
    }

    #findTargetNearShips(TRAVERSE_DIRECTIONS, targets, board) {
        board.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                if (col.ship !== null && col.hit === false) {
                    const queue = [{ row: rowIndex, col: colIndex, distance: 0 }];
                    const visited = [];
                    targets.push([rowIndex,colIndex]);
                    this.#traverseFromShipLocation(TRAVERSE_DIRECTIONS, queue, visited, board, targets);
                };
            })
        })
        return targets[Math.floor(Math.random() * targets.length)]; 
    }

    #traverseFromShipLocation(TRAVERSE_DIRECTIONS, queue, visited, board, targets) {
        const CAP = 2;

        while(queue.length > 0) {
            const current = queue.shift();
            if (current.distance >= CAP) continue;
            if (visited.some(v => v.row === current.row && v.col === current.col && v.vertical === current.vertical)) continue;
            visited.push(current);

            if (current.vertical === true || current.vertical === undefined) {
                TRAVERSE_DIRECTIONS.forEach(direction => {
                    const dir = current.row + direction;
                    if (dir < 0 || dir >= board.length) return;
                    if (board[dir][current.col].hit === false) {
                        if (!targets.some(t => t[0] === dir && t[1] === current.col)) targets.push([dir, current.col]);
                        queue.push({ row: dir, col: current.col, vertical: true, distance: current.distance + 1 });
                    };
                })
            }

            if (current.vertical === false || current.vertical === undefined) {
                TRAVERSE_DIRECTIONS.forEach(direction => {
                    const dir = current.col + direction;
                    if (dir < 0 || dir >= board.length) return;
                    if (board[current.row][dir].hit === false) {
                        if (!targets.some(t => t[0] === current.row && t[1] === dir)) targets.push([current.row, dir]);
                        queue.push({ row: current.row, col: dir, vertical: false, distance: current.distance + 1 });
                    };
                })
            }
        }
    }

    addPlayer(name = "CPU", human = false) {
        const player = new Player(name, human);
        this.players.push(player);
        return player;
    }

    randomiseShipPlacement(player) {
        const getRandomCoordinates = function(size, board) {
            const coordinates = [];
            const available = [];

            board.forEach((row, rowIndex) => {
                row.forEach((col, colIndex) => {
                    if (rowIndex + size <= board.length) { 
                        const temp = [];
                        for (let i = 0; i < size; i++) {
                            const square = board[rowIndex + i][colIndex];
                            temp.push(square);
                        }
                        if (temp.every((cur) => cur.ship === null)) {
                            available.push({ coordinates: [rowIndex,colIndex], vertical: true })
                        };
                    }

                    if (colIndex + size <= board.length) { 
                        const temp = [];
                        for (let i = 0; i < size; i++) {
                            const cell = board[rowIndex][colIndex + i];
                            temp.push(cell);
                        }
                        if (temp.every((cur) => cur.ship === null)) {
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
                end[1] += (size - 1);
            }

            coordinates.push(start.coordinates,end);
            return coordinates;
        }

        const shuffleArray = function(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        player.gameboard = new Gameboard();
        const ships = Array.from(this.ships);
        shuffleArray(ships);
        
        const placements = [];
        ships.forEach((ship) => {
            const coordinates = getRandomCoordinates(ship, player.gameboard.board);
            const start = coordinates[0];
            const end = coordinates[1];
            player.gameboard.placeShip(start, end, ship);
            placements.push({ size: ship, start: start, end: end });
        });

        return placements;
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

    #playVeryEasyTurn(targets, available, hits) {
        this.#easyHitAlgorithm(hits, available, targets);
        if (targets.length > 0) return targets[Math.floor(Math.random() * targets.length)];
        return available[Math.floor(Math.random() * available.length)];
    }
    
    #playEasyTurn(targets, TRAVERSE_DIRECTIONS, board, available, hits) {
        this.#normalHitAlgorithm(TRAVERSE_DIRECTIONS, board, available, hits, targets);
        if (targets.length > 0) return targets[Math.floor(Math.random() * targets.length)];
        return available[Math.floor(Math.random() * available.length)];
    }

    #playMediumTurn(targets, TRAVERSE_DIRECTIONS, board, ships, available, hits) {
        this.#normalHitAlgorithm(TRAVERSE_DIRECTIONS, board, available, hits, targets);
        if (targets.length > 0) return targets[Math.floor(Math.random() * targets.length)];
        const smallestShip = this.#getSmallestShip(ships);
        return this.#slidingWindowTraversal(available, board, targets, smallestShip);
    }

    #playHardTurn(targets, TRAVERSE_DIRECTIONS, board, ships, available, hits) {
        this.#normalHitAlgorithm(TRAVERSE_DIRECTIONS, board, available, hits, targets);
        if (targets.length > 0) return targets[Math.floor(Math.random() * targets.length)];
        const smallestShip = this.#getSmallestShip(ships);
        return this.#longestRunTraversal(available, targets, smallestShip);
    }

    #playVeryHardTurn(targets, TRAVERSE_DIRECTIONS, gameBoard, ships, available, hits) {
        this.#hardHitAlgorithm(TRAVERSE_DIRECTIONS, gameBoard, available, hits, targets);
        if (targets.length > 0) return targets[Math.floor(Math.random() * targets.length)];
        return this.#findTargetNearShips(TRAVERSE_DIRECTIONS, targets, gameBoard);
    }

    playComputerTurn(humanPlayer) {
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

        let target;

        const gameBoard = humanPlayer.gameboard.board;
        const ships = humanPlayer.gameboard.ships;
        const targets = [];
        const TRAVERSE_DIRECTIONS = [-1,1];

        switch (this.difficulty) {
            case 0:
                target = this.#playVeryEasyTurn(targets, available, hits);
                break;
            case 1:
                target = this.#playEasyTurn(targets, TRAVERSE_DIRECTIONS, gameBoard, available, hits);
                break;
            case 2:
                target = this.#playMediumTurn(targets, TRAVERSE_DIRECTIONS, gameBoard, ships, available, hits);
                break;
            case 3:
                target = this.#playHardTurn(targets, TRAVERSE_DIRECTIONS, gameBoard, ships, available, hits);
                break;
            default:
                target = this.#playVeryHardTurn(targets, TRAVERSE_DIRECTIONS, gameBoard, ships, available, hits);
        }

        const row = target[0];
        const col = target[1];

        humanPlayer.gameboard.recieveAttack(row, col);
        return target;
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

    getHumanPlayerCount() {
        return this.players.filter((player) => player.human).length;
    }
}