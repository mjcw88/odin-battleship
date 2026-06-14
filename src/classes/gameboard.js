import { Ship } from "./ship.js";

export class Gameboard {
    constructor(...rest) {
        if (rest.length > 0) throw new RangeError("Too many arguments given");

        const SIZE = 10;
        this.board = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
    }

    #isValid(start, end, size) {
        if (!Array.isArray(start)) throw new TypeError("Start must be an array");
        if (start.some((x) => !Number.isInteger(x))) throw new TypeError("Start must contain only integers");
        if (start.length !== 2) throw new RangeError("Start must have 2 values only");
        start.forEach(num => {
            if (num < 0 || num >= this.board.length) throw new RangeError("Start index out of bounds");
        });

        if (!Array.isArray(end)) throw new TypeError("End must be an array");
        if (end.some((x) => !Number.isInteger(x))) throw new TypeError("End must contain only integers");
        if (end.length !== 2) throw new RangeError("End must have 2 values only");
        end.forEach(num => {
            if (num < 0 || num >= this.board.length) throw new RangeError("End index out of bounds");
        });

        if (!Number.isInteger(size)) throw new TypeError("Ship size must be an integer");
    }

    #isDiagonal(start, end) {
        if (start[0] !== end[0] && start[1] !== end[1]) throw new Error("Ship cannot be diagonal");
    }

    #isVertical(startRow, endRow) {
        return startRow !== endRow;
    }

    #isValidPlacement(start, end, size) {
        if (end - start !== size - 1) throw new Error("End point and ship size mismatch");
        if (start < 0 || end >= this.board.length) throw new RangeError("Ship placement out of bounds");
    }

    #checkVerticalSquares(start, end) {
        for (let i = 0; i < end; i++) {
            const row = start[0] + i;
            const col = start[1];
            this.#isSquareEmpty(row, col);
        }
    }

    #checkHorizontalSquares(start, end) {
        for (let i = 0; i < end; i++) {
            const row = start[0];
            const col = start[1] + i;
            this.#isSquareEmpty(row, col);
        }
    }

    #isSquareEmpty(row, col) {
        if (this.board[row][col]) throw new Error("Ships cannot overlap");
    }

    placeShip(start, end, ship) {
        this.#isValid(start, end, ship.size);
        this.#isDiagonal(start, end);

        if (this.#isVertical(start[0], end[0])) {
            this.#isValidPlacement(start[0], end[0], ship.size);
            this.#checkVerticalSquares(start, ship.size);
            for (let i = 0; i < ship.size; i++) {
                const row = start[0] + i;
                const col = start[1];
                this.board[row][col] = ship;
            }
        } else {
            this.#isValidPlacement(start[1], end[1], ship.size);
            this.#checkHorizontalSquares(start, ship.size);
            for (let i = 0; i < ship.size; i++) {
                const row = start[0];
                const col = start[1] + i;
                this.board[row][col] = ship;
            }
        }
    }

    recieveAttack() {

    }

    allShipsSunk() {

    }

    printBoard() {
        const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
        let string = "";
        console.log("  " + letters.join(" "));
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board.length; j++) {
                string = string + (isNaN(Number(this.board[i][j])) ? this.board[i][j].size + " ": 0 + " ");
            }
            console.log(letters[i] + " " + string);
            string = "";
        }
    }
}

const carrier = new Ship(5);
const battleship = new Ship(4);
const cruiser = new Ship(3);
const submarine = new Ship(3);
const destroyer = new Ship(2);

const board = new Gameboard();

let start = [0,0];
let end = [start[0] + carrier.size-1,0];
board.placeShip(start, end, carrier);

start = [6,0];
end = [6,start[1] + battleship.size-1];
board.placeShip(start, end, battleship);

board.printBoard();