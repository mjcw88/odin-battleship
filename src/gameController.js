import { Player } from "./classes/player.js";

export class Game {
    constructor(...rest) {
        if (rest.length > 0) throw new RangeError("Too many arguments given");

        this.players = [];
        this.playerOneTurn = true;
        this.winner = null;
    }

    createNewGame() {
        // Placeholder Coordinates - delete later
        const coordinates = [
            [[0,0],[4,0]],
            [[6,0],[6,3]],
            [[8,5],[8,7]],
            [[1,4],[3,4]],
            [[3,7],[4,7]],
            [[5,5],[5,9]],
            [[3,2],[6,2]],
            [[9,0],[9,2]],
            [[3,5],[3,7]],
            [[1,0],[1,1]],
        ];

        const ships = [5, 4, 3, 3, 2];

        const playerOne = new Player("Human", true);
        const playerTwo = new Player();

        this.players.push(playerOne);
        this.players.push(playerTwo);
        
        this.players.forEach((player, playerIndex) => {
            const offset = playerIndex * ships.length;
            ships.forEach((ship, shipIndex) => {
                player.gameboard.placeShip(coordinates[offset + shipIndex][0], coordinates[offset + shipIndex][1], ship);
            });
        });
    }

    declareWinner(player) {
        this.winner = player;
    }

    playComputerTurn() {
        console.log("COMPUTING CPU TURN");
        this.playerOneTurn = true;
    }
}