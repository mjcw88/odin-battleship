import { Player } from "./classes/player.js";
import { Ship } from "./classes/ship.js";

function createShips() {
    const ships = [];
    const shipSizes = [5, 4, 3, 3, 2];
    shipSizes.forEach(size => { 
        const ship = new Ship(size);
        ships.push(ship);
    })
    return ships;
}

export function createNewGame() {
    // Placeholder Coordinates - delete later
    const coordinates = [
        [[0,0],[4,0]],
        [[6,0],[6,3]],
        [[8,5],[8,7]],
        [[1,4],[3,4]],
        [[3,7],[4,7]]
    ];

    const players = [];
    const playerOne = new Player("Human", true);
    const playerTwo = new Player();

    players.push(playerOne);
    players.push(playerTwo);

    const ships = createShips();

    players.forEach(player => {
        ships.forEach((ship, index) => {
            player.gameboard.placeShip(coordinates[index][0], coordinates[index][1], ship);
        });
        // console.log(player.name);
        // player.gameBoard.printBoard();
        // console.log("");
    });
    return players;
}