import { Gameboard } from "./gameboard.js";

export class Player {
    constructor(name = "CPU", human = false) {
        if (typeof name !== "string") throw new TypeError ("Name must be a string");
        if (typeof human !== "boolean") throw new TypeError("Player type must be a boolean");

        this.name = name;
        this.human = human;
        this.gameboard = new Gameboard();
    }
}