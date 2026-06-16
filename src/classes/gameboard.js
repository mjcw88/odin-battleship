export class Gameboard {
    constructor(...rest) {
        if (rest.length > 0) throw new RangeError("Too many arguments given");

        const SIZE = 10;
        this.board = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => ({ hit: false, ship: null })));
        this.ships = [];
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

        if (start[0] !== end[0] && start[1] !== end[1]) throw new Error("Ship cannot be diagonal");

        if (!Number.isInteger(size)) throw new TypeError("Ship size must be an integer");
    }

    #isVertical(startRow, endRow) {
        return startRow !== endRow;
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
        if (this.board[row][col].ship) throw new Error("Ships cannot overlap");
    }

    placeShip(start, end, ship) {
        this.#isValid(start, end, ship.size);

        if (this.#isVertical(start[0], end[0])) {
            this.#checkVerticalSquares(start, ship.size);
            for (let i = 0; i < ship.size; i++) {
                const row = start[0] + i;
                const col = start[1];
                this.board[row][col].ship = ship;
            }
        } else {
            this.#checkHorizontalSquares(start, ship.size);
            for (let i = 0; i < ship.size; i++) {
                const row = start[0];
                const col = start[1] + i;
                this.board[row][col].ship = ship;
            }
        }
        this.ships.push(ship);
    }

    recieveAttack(row, col) {
        if (!Number.isInteger(row) || !Number.isInteger(col)) throw new TypeError("Coordinates must be an integer");
        if (this.board[row][col].hit) return;
        if (this.board[row][col].ship) {
            const ship = this.board[row][col].ship;
            ship.hit();
        }
        this.board[row][col].hit = true;
    }

    isAllSunk() {
        return this.ships.every((currentValue) => currentValue.isSunk());
    }

    printBoard() {
        const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
        let string = "";
        console.log("  " + letters.join(" "));
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board.length; j++) {
                string = string + (this.board[i][j].ship ? this.board[i][j].ship.size + " " : 0 + " ");
            }
            console.log(letters[i] + " " + string);
            string = "";
        }
    }
}