import { Player } from "./player.js";

describe("Player (constructor)", () => {
    test("Throws type error if name input is not a string", () => {
        expect(() => new Player(1, true)).toThrow(TypeError);
    })
    test("Throws type error if player type input is not a string", () => {
        expect(() => new Player("Player", "true")).toThrow(TypeError);
    })
    test("Default name is CPU when no name is given", () => {
        const player = new Player();
        expect(player.name).toBe("CPU");
    })
    test("Default human status is false if none is given", () => {
        const player = new Player();
        expect(player.human).toBeFalsy();
    })
    test("Player name input is accepted", () => {
        const name = "Hello, World!";
        const player = new Player(name, true);
        expect(player.name).toBe(name);
    })
    test("Human status is true when boolean provided", () => {
        const player = new Player("Player", true);
        expect(player.human).toBeTruthy();
    })
})