import { Gameboard } from "./gameboard.js";
import { Ship } from "./ship.js";

describe("Gameboard (constructor)", () => {
    test("Creates 10x10 gameboard", () => {
        const board = new Gameboard();
        expect(board.board.length).toBe(10);
        for (let i = 0; i < board.board.length; i++) {
            for (let j = 0; j < board.board.length; j++) {
                expect(board.board[i][j]).toBeFalsy();
            }
        }
    })
    test("Throws range error when any arguments given", () => {
        expect(() => new Gameboard(1)).toThrow(RangeError);
        expect(() => new Gameboard("1")).toThrow(RangeError);
        expect(() => new Gameboard(1, 2)).toThrow(RangeError);
        expect(() => new Gameboard("1", "2")).toThrow(RangeError);
        expect(() => new Gameboard(1, 2, 3)).toThrow(RangeError);
        expect(() => new Gameboard("1", "2", "3")).toThrow(RangeError);
    });
})

describe("Gameboard (placeShip)", () => {
    test("Places ship vertically", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = [0,0];
        const end = [start[0] + ship.size-1,0];

        board.placeShip(start, end, ship);

        for (let i = 0; i < ship.size; i++) {
            const row = start[0] + i;
            const col = start[1];
            expect(board.board[row][col]).toBe(ship);
        }
    })
    test("Places ship horizontally", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = [0,0];
        const end = [0,start[1] + ship.size-1];

        board.placeShip(start, end, ship);

        for (let i = 0; i < ship.size; i++) {
            const row = start[0];
            const col = start[1] + i;
            expect(board.board[row][col]).toBe(ship);
        }
    })
    test("Throws type error if start input is not array", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = "[0,0]";
        const end = [0,start[1] + ship.size-1];

        expect(() => board.placeShip(start, end, ship)).toThrow(TypeError);
    })
    test("Throws type error if start input contains non-integers", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = ["0",0];
        const end = [0,start[1] + ship.size-1];

        expect(() => board.placeShip(start, end, ship)).toThrow(TypeError);
    })
    test("Throws range error if start input contains less than two inputs", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = [0];
        const end = [0,start[1] + ship.size-1];

        expect(() => board.placeShip(start, end, ship)).toThrow(RangeError);
    })
    test("Throws range error if start input contains more than two inputs", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = [0,0,0];
        const end = [0,start[1] + ship.size-1];

        expect(() => board.placeShip(start, end, ship)).toThrow(RangeError);
    })
    test("Throws range error if start input is out of bounds", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = [board.board.length+1,0];
        const end = [0,start[1] + ship.size-1];

        expect(() => board.placeShip(start, end, ship)).toThrow(RangeError);
    })
    test("Throws type error if end input is not array", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = [0,0];
        const end = "[0,start[1] + ship.size-1]";

        expect(() => board.placeShip(start, end, ship)).toThrow(TypeError);
    })
    test("Throws type error if end input contains non-integers", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = [0,0];
        const end = ["0",start[1] + ship.size-1];

        expect(() => board.placeShip(start, end, ship)).toThrow(TypeError);
    })
    test("Throws range error if end input contains less than two inputs", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = [0,0];
        const end = [start[1] + ship.size-1];

        expect(() => board.placeShip(start, end, ship)).toThrow(RangeError);
    })
    test("Throws range error if end input contains more than two inputs", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = [0,0];
        const end = [0,start[1] + ship.size-1,0];

        expect(() => board.placeShip(start, end, ship)).toThrow(RangeError);
    })
    test("Throws range error if end input is out of bounds", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = [0,0];
        const end = [board.board.length+1,start[1] + ship.size-1];

        expect(() => board.placeShip(start, end, ship)).toThrow(RangeError);
    })
    test("Throws error if ship is diagonal", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = [0,0];
        const end = [start[0] + ship.size-1,start[1] + ship.size-1];
        expect(() => board.placeShip(start, end, ship)).toThrow(Error);
    })
    test("Throws range error if ship is vertically out of bounds", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = [8,0];
        const end = [start[0] + ship.size-1,0];
        expect(() => board.placeShip(start, end, ship)).toThrow(RangeError);
    })
    test("Throws range error if ship is horizontally out of bounds", () => {
        const board = new Gameboard();
        const ship = new Ship(5);
        const start = [0,8];
        const end = [0,start[1] + ship.size-1];
        expect(() => board.placeShip(start, end, ship)).toThrow(RangeError);
    })
    test("Throws error if ships overlap", () => {
        const board = new Gameboard();
        const carrier = new Ship(5);
        const battleship = new Ship(4);
        const start = [0,0];
        let end = [start[0] + carrier.size-1,0];
        board.placeShip(start, end, carrier);
        end = [start[0] + battleship.size-1,0];
        expect(() => board.placeShip(start, end, battleship)).toThrow(Error);
    })
})