export class Ship {
    constructor(size = 1, ...rest) {
        if (rest.length > 0) throw new RangeError("Too many arguments given, only 1 argument must be given");
        if (!Number.isInteger(size)) throw new TypeError("Input must be an integer");

        this.size = size;
        this.hits = 0;
    }

    hit() {
        if (this.isSunk()) return;
        this.hits++;
    }

    isSunk() {
        return this.hits >= this.size;
    }
}
