import { Ship } from "./ship.js";

describe("Ship creation", () => {
    test("creates a ship default size of 1", () => {
        const ship = new Ship();
        expect(ship.size).toBe(1);
    });
    test("creates a ship default hit of 0", () => {
        const ship = new Ship();
        expect(ship.hits).toBe(0);
    });
    test("creates a ship default sunk of false", () => {
        const ship = new Ship();
        expect(ship.sunk).toBeFalsy();
    });
    test("creates a ship default size of 3", () => {
        const size = 3;
        const ship = new Ship(size);
        expect(ship.size).toBe(size);
    });
    test("rejects non-integer input for ship size", () => {
        expect(() => new Ship("Hello, World!")).toThrow(TypeError);
    });
    test("rejects more than 1 argument given", () => {
        expect(() => new Ship(3, 1)).toThrow(RangeError);
    });
});

describe("Ship (hit)", () => {
    test("ship hit zero times", () => {
        const ship = new Ship(5);
        expect(ship.hits).toBe(0);
    })
    test("ship hit once", () => {
        const ship = new Ship(5);
        ship.hit();
        expect(ship.hits).toBe(1);
    })
    test("ship hit twice", () => {
        const ship = new Ship(5);
        expect(ship.hits).toBe(0);
        ship.hit();
        ship.hit();
        expect(ship.hits).toBe(2);
    })
    test("ship hit three times", () => {
        const ship = new Ship(5);
        expect(ship.hits).toBe(0);
        ship.hit();
        ship.hit();
        ship.hit();
        expect(ship.hits).toBe(3);
    })
})

describe("Ship (isSunk)", () => {
    test("returns true on a 1 size ship hit once", () => {
        const ship = new Ship();
        expect(ship.isSunk()).toBeFalsy();
        ship.hit();
        expect(ship.isSunk()).toBeTruthy();
    })
    test("returns false on a 2 size ship hit once", () => {
        const ship = new Ship(2);
        expect(ship.isSunk()).toBeFalsy();
        ship.hit();
        expect(ship.isSunk()).toBeFalsy();
    })
    test("returns true on a 2 size ship hit twice", () => {
        const ship = new Ship(2);
        expect(ship.isSunk()).toBeFalsy();
        ship.hit();
        expect(ship.isSunk()).toBeFalsy();
        ship.hit();
        expect(ship.isSunk()).toBeTruthy();
    })
    test("returns false on a 3 size ship hit twice", () => {
        const ship = new Ship(3);
        expect(ship.isSunk()).toBeFalsy();
        ship.hit();
        expect(ship.isSunk()).toBeFalsy();
        ship.hit();
        expect(ship.isSunk()).toBeFalsy();
    })
    test("returns true on a 3 size ship hit three times", () => {
        const ship = new Ship(3);
        expect(ship.isSunk()).toBeFalsy();
        ship.hit();
        expect(ship.isSunk()).toBeFalsy();
        ship.hit();
        expect(ship.isSunk()).toBeFalsy();
        ship.hit();
        expect(ship.isSunk()).toBeTruthy();
    })
})