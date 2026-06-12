export class Ship {
    constructor(size = 1, ...rest) {
        if (!Number.isInteger(size)) throw new TypeError("Input must be an integer");
        if (rest.length > 0) throw new RangeError("Too many arguments given, only 1 argument must be given");

        this.size = size;
        this.hits = 0;
        this.sunk = false;
    }

    hit() {
        if (this.isSunk()) return;
        this.hits++;
        this.sunk = this.isSunk();
    }

    isSunk() {
        return this.hits >= this.size;
    }
}
