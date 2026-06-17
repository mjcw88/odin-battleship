import { Game } from "./game.js";

describe("Game (constructor)", () => {
    test("Throws range error when any arguments given", () => {
        expect(() => new Game(1)).toThrow(RangeError);
        expect(() => new Game("1")).toThrow(RangeError);
        expect(() => new Game(1, 2)).toThrow(RangeError);
        expect(() => new Game("1", "2")).toThrow(RangeError);
        expect(() => new Game(1, 2, 3)).toThrow(RangeError);
        expect(() => new Game("1", "2", "3")).toThrow(RangeError);
    });
    test("Creates new game with default settings", () => {
        const game = new Game();
        expect(game.players.length).toBe(0);
        expect(game.playerOneTurn).toBeTruthy();
        expect(game.winner).toBeNull();
    })
})