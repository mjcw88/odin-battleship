import { Ship } from "./ship.js";

export class Gameboard {
    constructor(...rest) {
        if (rest.length > 0) throw new RangeError("Too many arguments given");

        const SIZE = 10;
        this.board = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
    }

    #isDiagonal(start, end) {
        return start[0] !== end[0] && start[1] !== end[1];
    }

    #isVertical(startRow, endRow) {
        return startRow !== endRow;
    }

    #isValidPlacement(start, end, size) {
        if (end - start !== size - 1) throw new Error("End point and ship size mismatch");
        if (start < 0 || end >= this.board.length) throw new RangeError("Ship placement out of bounds");
    }

    #isSquareEmpty(row, col) {
        if (this.board[row][col]) throw new Error("Ships cannot overlap");
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

    placeShip(start, end, ship) {
        if (this.#isDiagonal(start, end)) throw new Error("Ship cannot be diagonal");

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
                string = string + Number(this.board[i][j]) + " ";
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